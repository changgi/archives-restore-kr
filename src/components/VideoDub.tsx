'use client'

/**
 * VideoDub — client-side voice dubbing via Web Speech API.
 *
 * Renders a visible toggle overlay on top of the video so the user
 * can explicitly enable dubbing (required to claim the browser's
 * autoplay/speech gesture). When enabled:
 *
 *   1. Claims the user gesture by speaking a tiny priming utterance.
 *   2. Force-mutes the underlying <video> element (even if the
 *      VideoPlayer wasn't configured with muted=true).
 *   3. Pre-translates all transcript segments via Google Translate
 *      public endpoint (shared localStorage cache with AutoTranslate).
 *   4. Picks the best browser voice for the target language,
 *      waiting for `voiceschanged` if the catalogue is empty.
 *   5. Hooks the video's timeupdate event and speaks each segment
 *      in the target language when the playhead crosses it.
 *   6. Shows a live "🎙 Dubbing · [language]" badge so the user
 *      knows it's working.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Mic,
  MicOff,
  Volume2,
  Settings2,
  Download,
  Check,
  Gauge,
  Captions,
} from 'lucide-react'
import type { VideoTranscript } from '@/types'
import { useLocale } from '@/i18n/LanguageProvider'
import { getLocaleDef, type Locale } from '@/i18n/config'

const VOICE_LANG: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  'zh-CN': 'zh-CN',
  'zh-HK': 'zh-HK',
  ru: 'ru-RU',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  vi: 'vi-VN',
  af: 'af-ZA',
  qu: 'es-PE',
  fj: 'en-GB',
}

const GT_LANG: Record<Locale, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  'zh-CN': 'zh-CN',
  'zh-HK': 'zh-TW',
  ru: 'ru',
  es: 'es',
  fr: 'fr',
  ar: 'ar',
  vi: 'vi',
  af: 'af',
  qu: 'qu',
  fj: 'fj',
}

// Short priming phrases spoken on enable to claim the user gesture.
// These are locale-appropriate "Dubbing enabled" messages.
const PRIME_PHRASE: Record<Locale, string> = {
  ko: '더빙이 활성화되었습니다',
  en: 'Dubbing enabled',
  ja: 'ダビングを開始します',
  'zh-CN': '配音已启动',
  'zh-HK': '配音已啟動',
  ru: 'Дубляж включён',
  es: 'Doblaje activado',
  fr: 'Doublage activé',
  ar: 'تم تفعيل الدبلجة',
  vi: 'Đã bật lồng tiếng',
  af: 'Oorsetting geaktiveer',
  qu: 'Rimay kamachisqa',
  fj: 'Sa torocake na vosa',
}

const CACHE_PREFIX = 'ar.tx.v1.'
const CONSENT_KEY = 'ar.dub.consent'  // set to 'yes' once the user enables dub
const SETTINGS_KEY = 'ar.dub.settings'

const PLAYBACK_RATES = [0.75, 1.0, 1.25, 1.5] as const
type PlaybackRate = (typeof PLAYBACK_RATES)[number]

interface DubSettings {
  /** Whether to speak the TTS audio. When false, only karaoke subtitles show. */
  ttsEnabled: boolean
  /** Whether to render the karaoke subtitle overlay. */
  subtitlesEnabled: boolean
  /** Speech rate multiplier (SpeechSynthesisUtterance.rate). */
  rate: PlaybackRate
  /** Whether to auto-pause the video when TTS runs longer than the segment. */
  pauseWhenBehind: boolean
}

const DEFAULT_SETTINGS: DubSettings = {
  ttsEnabled: true,
  subtitlesEnabled: true,
  rate: 1.0,
  pauseWhenBehind: true,
}

function readSettings(): DubSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<DubSettings>
    return {
      ttsEnabled: parsed.ttsEnabled ?? DEFAULT_SETTINGS.ttsEnabled,
      subtitlesEnabled:
        parsed.subtitlesEnabled ?? DEFAULT_SETTINGS.subtitlesEnabled,
      rate: (PLAYBACK_RATES.includes(parsed.rate as PlaybackRate)
        ? (parsed.rate as PlaybackRate)
        : DEFAULT_SETTINGS.rate),
      pauseWhenBehind:
        parsed.pauseWhenBehind ?? DEFAULT_SETTINGS.pauseWhenBehind,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function writeSettings(s: DubSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* quota */
  }
}

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'yes'
  } catch {
    return false
  }
}
function saveConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, 'yes')
  } catch {
    /* quota */
  }
}
function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    /* quota */
  }
}
function cacheKey(locale: string, text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i)
  return CACHE_PREFIX + locale + '.' + (h >>> 0).toString(36)
}
function readCache(locale: string, text: string): string | null {
  try {
    return localStorage.getItem(cacheKey(locale, text))
  } catch {
    return null
  }
}
function writeCache(locale: string, text: string, tx: string): void {
  try {
    localStorage.setItem(cacheKey(locale, text), tx)
  } catch {
    /* quota */
  }
}

/**
 * Format seconds to SRT timestamp: HH:MM:SS,mmm
 */
function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000)
  return (
    h.toString().padStart(2, '0') +
    ':' +
    m.toString().padStart(2, '0') +
    ':' +
    s.toString().padStart(2, '0') +
    ',' +
    ms.toString().padStart(3, '0')
  )
}

/**
 * Build an SRT subtitle file from translated segments.
 * Each segment ends when the next one begins; the last segment
 * ends 5 seconds after it starts (safe default).
 */
function buildSrt(
  segments: { start_seconds: number; text: string }[],
  videoDuration: number | null,
): string {
  const lines: string[] = []
  const sorted = [...segments].sort(
    (a, b) => a.start_seconds - b.start_seconds,
  )
  for (let i = 0; i < sorted.length; i++) {
    const seg = sorted[i]
    const nextStart =
      i + 1 < sorted.length ? sorted[i + 1].start_seconds : null
    const fallbackEnd =
      videoDuration && videoDuration > seg.start_seconds
        ? videoDuration
        : seg.start_seconds + 5
    const end = Math.min(nextStart ?? fallbackEnd, fallbackEnd)
    lines.push(String(i + 1))
    lines.push(formatSrtTime(seg.start_seconds) + ' --> ' + formatSrtTime(end))
    lines.push(seg.text)
    lines.push('')
  }
  return lines.join('\n')
}

async function translateLine(text: string, locale: Locale): Promise<string> {
  // Korean source → Korean target: no translation needed
  if (locale === 'ko') return text
  const cached = readCache(locale, text)
  if (cached) return cached
  const gt = GT_LANG[locale] ?? locale
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx&sl=ko&tl=' +
    encodeURIComponent(gt) +
    '&dt=t&q=' +
    encodeURIComponent(text)
  try {
    const res = await fetch(url)
    if (!res.ok) return text
    const data = await res.json()
    const chunks = data[0] ?? []
    const out = (chunks as unknown[][])
      .map((c) => (c?.[0] as string) ?? '')
      .join('')
    const trimmed = out.trim()
    if (trimmed) {
      writeCache(locale, text, trimmed)
      return trimmed
    }
  } catch {
    /* ignore */
  }
  return text
}

/**
 * Wait for speechSynthesis to populate its voices list. Chrome and
 * Edge load voices asynchronously on first access.
 */
function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    const first = synth.getVoices()
    if (first.length > 0) {
      resolve(first)
      return
    }
    let done = false
    const onChange = () => {
      if (done) return
      done = true
      synth.removeEventListener('voiceschanged', onChange)
      resolve(synth.getVoices())
    }
    synth.addEventListener('voiceschanged', onChange)
    // Fallback in case the event never fires
    setTimeout(() => {
      if (!done) {
        done = true
        synth.removeEventListener('voiceschanged', onChange)
        resolve(synth.getVoices())
      }
    }, 2000)
  })
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const lower = lang.toLowerCase()
  const exact = voices.filter((v) => v.lang.toLowerCase() === lower)
  if (exact.length > 0) {
    const premium = exact.find((v) =>
      /natural|neural|premium|online/i.test(v.name),
    )
    return premium ?? exact[0]
  }
  const prefix = lower.split('-')[0]
  const prefixed = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(prefix),
  )
  return prefixed[0] ?? null
}

interface VideoDubProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  transcripts: VideoTranscript[]
}

type Status = 'idle' | 'priming' | 'ready' | 'speaking' | 'unsupported' | 'no-voice'

export default function VideoDub({ videoRef, transcripts }: VideoDubProps) {
  const { locale } = useLocale()
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [translatedCount, setTranslatedCount] = useState(0)
  // Karaoke subtitle state — shows the currently-speaking translated
  // line overlaid on the bottom of the video.
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  // Settings popover state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<DubSettings>(DEFAULT_SETTINGS)
  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])
  // Load persisted settings on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setSettings(readSettings()))
    return () => cancelAnimationFrame(id)
  }, [])
  // Persist settings on change
  useEffect(() => {
    writeSettings(settings)
  }, [settings])

  const lastIdxRef = useRef(-1)
  const cancelledRef = useRef(false)
  const translationsRef = useRef<Map<number, string>>(new Map())

  const localeDef = getLocaleDef(locale)
  const activeSegments = transcripts.filter(
    (t) => (t.locale ?? 'ko') === 'ko',
  )
  const total = activeSegments.length

  // Unsupported browser check
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) {
      setStatus('unsupported')
    }
  }, [])

  // Auto-enable if the user has already granted consent on a
  // previous video. We still need a gesture on the VERY FIRST
  // video — browsers don't let us speak without one ever — but
  // once they've clicked once, subsequent videos in the same
  // session can start automatically because speechSynthesis
  // retains the permission while the tab is alive.
  //
  // We actually attempt an auto-enable on mount and fall back to
  // the manual button if the browser rejects it.
  const consentCheckedRef = useRef(false)

  // Detect whether the <video> element has any audio track.
  // Silent videos (educational clips, b-roll) benefit from dubbing
  // even in Korean because there's nothing to compete with.
  const [videoHasAudio, setVideoHasAudio] = useState<boolean | null>(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const checkAudio = () => {
      // Browser-agnostic heuristic: if either standard property
      // exists and is false/empty we assume no audio.
      type VideoWithAudioHints = HTMLVideoElement & {
        mozHasAudio?: boolean
        webkitAudioDecodedByteCount?: number
        audioTracks?: { length: number }
      }
      const v = video as VideoWithAudioHints
      const mozHas = v.mozHasAudio
      const webkitBytes = v.webkitAudioDecodedByteCount
      const trackLen = v.audioTracks?.length
      // If any hint is truthy, audio exists
      if (mozHas === true) return setVideoHasAudio(true)
      if (typeof webkitBytes === 'number' && webkitBytes > 0)
        return setVideoHasAudio(true)
      if (typeof trackLen === 'number') return setVideoHasAudio(trackLen > 0)
      // Fall back to true — we don't know, assume yes so we don't
      // surprise the user with unexpected autospeak
      return setVideoHasAudio(true)
    }
    if (video.readyState >= 1) checkAudio()
    video.addEventListener('loadedmetadata', checkAudio)
    video.addEventListener('canplay', checkAudio)
    return () => {
      video.removeEventListener('loadedmetadata', checkAudio)
      video.removeEventListener('canplay', checkAudio)
    }
  }, [videoRef])

  // Reset everything on locale change or on disable
  useEffect(() => {
    cancelledRef.current = false
    return () => {
      cancelledRef.current = true
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [locale])

  const enableDub = useCallback(
    async (isUserGesture: boolean) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setStatus('unsupported')
        return false
      }
      const synth = window.speechSynthesis
      setStatus('priming')

      // --- STEP 1: Claim the user gesture (when applicable) ---
      // When called from a click handler, speak a priming phrase
      // synchronously to claim the gesture. When auto-enabling from
      // a previous session's consent, skip the prime because there's
      // no gesture to claim — we rely on the browser's existing
      // permission state.
      if (isUserGesture) {
        const primeText = PRIME_PHRASE[locale] ?? 'Dubbing enabled'
        const prime = new SpeechSynthesisUtterance(primeText)
        prime.lang = VOICE_LANG[locale]
        prime.rate = 1.1
        synth.cancel()
        synth.speak(prime)
      }

      // --- STEP 2: Wait for voices ---
      const voices = await waitForVoices()
      const picked = pickVoice(voices, VOICE_LANG[locale])
      setVoice(picked)
      if (!picked) {
        setStatus('no-voice')
        return false
      }

      // --- STEP 3: Force-mute the underlying video ---
      const video = videoRef.current
      if (video) {
        video.muted = true
      }

      // --- STEP 4: Pre-translate all segments in the background ---
      translationsRef.current = new Map()
      setTranslatedCount(0)
      ;(async () => {
        for (const seg of activeSegments) {
          if (cancelledRef.current) return
          const tx = await translateLine(seg.text, locale)
          if (cancelledRef.current) return
          translationsRef.current.set(seg.start_seconds, tx)
          setTranslatedCount((c) => c + 1)
        }
      })()

      if (isUserGesture) saveConsent()
      setEnabled(true)
      setStatus('ready')
      return true
    },
    [locale, videoRef, activeSegments],
  )

  const handleEnable = useCallback(() => {
    return enableDub(true)
  }, [enableDub])

  // Auto-enable on first render if consent was granted in a
  // previous session. Runs exactly once per (video, locale) pair.
  // For Korean locale, only auto-enable if the video is silent
  // (videoHasAudio === false).
  useEffect(() => {
    if (consentCheckedRef.current) return
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    )
      return
    // For Korean, we need to know whether the video has audio first.
    // Defer the check until videoHasAudio resolves.
    if (locale === 'ko' && videoHasAudio === null) return
    if (locale === 'ko' && videoHasAudio === true) {
      // Korean UI + video with Korean audio — nothing to do
      consentCheckedRef.current = true
      return
    }
    consentCheckedRef.current = true
    if (!hasConsent()) return
    if (activeSegments.length === 0) return
    enableDub(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, videoHasAudio])

  const handleDisable = useCallback(() => {
    if (typeof window === 'undefined') return
    setEnabled(false)
    setStatus('idle')
    setCurrentSubtitle('')
    setSettingsOpen(false)
    clearConsent()
    window.speechSynthesis.cancel()
    const video = videoRef.current
    if (video) {
      video.muted = false
    }
    lastIdxRef.current = -1
  }, [videoRef])

  /**
   * Build + download an SRT file of the translated transcript.
   * Triggers any missing translations synchronously-ish first.
   */
  const handleDownloadSrt = useCallback(async () => {
    // Ensure every segment has a translation
    const segments: { start_seconds: number; text: string }[] = []
    for (const seg of activeSegments) {
      let text = translationsRef.current.get(seg.start_seconds)
      if (!text) {
        text = await translateLine(seg.text, locale)
        translationsRef.current.set(seg.start_seconds, text)
      }
      segments.push({ start_seconds: seg.start_seconds, text })
    }
    const video = videoRef.current
    const srt = buildSrt(segments, video?.duration ?? null)
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitles-' + locale + '.srt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [activeSegments, locale, videoRef])

  // Hook video timeupdate to trigger segment speech. Crucially,
  // when a new segment starts but the previous utterance is still
  // playing, we PAUSE the video until the speech finishes, then
  // resume + speak the new segment. This guarantees every line is
  // spoken in full even when the target language runs longer than
  // the original Korean audio.
  useEffect(() => {
    if (!enabled) return
    const video = videoRef.current
    if (!video) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const synth = window.speechSynthesis
    const sorted = [...activeSegments].sort(
      (a, b) => a.start_seconds - b.start_seconds,
    )

    // ── Predictive segment-duration-aware pause ─────────────────
    //
    // For each segment i we know:
    //   - segStart = sorted[i].start_seconds
    //   - segEnd   = sorted[i+1].start_seconds (or video.duration)
    //   - frameDur = segEnd - segStart   ← how long the text is on screen
    //
    // After speaking starts we measure how long the TTS utterance
    // actually took (speechEnd - speechStart). If speechDuration >
    // frameDur, we pause the video for exactly (speechDuration -
    // frameDur) seconds so the viewer can hear every word before
    // the scene advances.
    //
    // This matches the user's request: "장면에 있는 글자를 다 읽고
    // 다음장면으로 갈 수 있도록" — read all text in the current
    // frame, then move to the next frame.

    let isSpeaking = false
    let autoPaused = false
    let pendingSpeak: { text: string; segIdx: number } | null = null
    let pauseTimerId: ReturnType<typeof setTimeout> | null = null
    let speechStartedAt = 0     // performance.now() when utterance started

    // Pre-compute each segment's on-screen duration
    const segDurations = sorted.map((seg, i) => {
      const nextStart =
        i + 1 < sorted.length
          ? sorted[i + 1].start_seconds
          : video.duration || seg.start_seconds + 5
      return Math.max(0.5, nextStart - seg.start_seconds)
    })

    const findActiveIdx = (t: number): number => {
      let lo = 0
      let hi = sorted.length - 1
      let ans = -1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (sorted[mid].start_seconds <= t) {
          ans = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      return ans
    }

    const resumeVideo = () => {
      if (!autoPaused) return
      autoPaused = false
      if (pauseTimerId) {
        clearTimeout(pauseTimerId)
        pauseTimerId = null
      }
      const p = video.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* autoplay policy may reject */
        })
      }
    }

    const showSubtitle = (text: string) => {
      if (!settingsRef.current.subtitlesEnabled) return
      setCurrentSubtitle(text)
    }

    /**
     * Schedule a precise pause at the moment the current frame
     * is about to end, if speech will still be going.
     *
     * Called from utterance.onstart with the segment index so we
     * know the frame's remaining display time.
     */
    const schedulePauseIfNeeded = (segIdx: number) => {
      if (!settingsRef.current.pauseWhenBehind) return
      if (!settingsRef.current.ttsEnabled) return
      // How much of the frame is left from the moment speech started?
      const elapsed = video.currentTime - sorted[segIdx].start_seconds
      const remaining = Math.max(0, segDurations[segIdx] - elapsed)
      // We'll pause the video at the exact frame-end if speech is
      // still going at that point. The check happens inside the
      // timeout callback.
      if (pauseTimerId) clearTimeout(pauseTimerId)
      pauseTimerId = setTimeout(() => {
        pauseTimerId = null
        if (isSpeaking && !video.paused) {
          autoPaused = true
          video.pause()
        }
      }, remaining * 1000)
    }

    const speakSegment = (text: string, segIdx: number) => {
      if (!text) return
      // Subtitle-only mode: show caption, skip TTS
      if (!settingsRef.current.ttsEnabled) {
        showSubtitle(text)
        const readMs = Math.max(2000, Math.min(6000, text.length * 100))
        setTimeout(() => setCurrentSubtitle(''), readMs)
        return
      }
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = VOICE_LANG[locale]
      if (voice) u.voice = voice
      u.rate = settingsRef.current.rate
      u.pitch = 1.0
      u.volume = 1.0
      u.onstart = () => {
        isSpeaking = true
        speechStartedAt = performance.now()
        setStatus('speaking')
        showSubtitle(text)
        // Schedule a precise pause at the frame boundary
        schedulePauseIfNeeded(segIdx)
      }
      u.onend = () => {
        isSpeaking = false
        setStatus('ready')
        // Clear the pending pause timer if speech finished before
        // the frame ended (speech was faster than the frame — no
        // pause needed, the ideal case)
        if (pauseTimerId) {
          clearTimeout(pauseTimerId)
          pauseTimerId = null
        }
        // Resume if we paused for this utterance
        if (autoPaused) resumeVideo()
        // Clear subtitle after a short grace period
        setTimeout(() => setCurrentSubtitle(''), 500)
        // Speak any queued segment (from fast-forward etc.)
        if (pendingSpeak) {
          const { text: next, segIdx: nextIdx } = pendingSpeak
          pendingSpeak = null
          speakSegment(next, nextIdx)
        }
      }
      u.onerror = () => {
        isSpeaking = false
        setStatus('ready')
        if (pauseTimerId) {
          clearTimeout(pauseTimerId)
          pauseTimerId = null
        }
        if (autoPaused) resumeVideo()
      }
      synth.speak(u)
    }

    const handleNewSegment = async (segIdx: number) => {
      const seg = sorted[segIdx]
      let text = translationsRef.current.get(seg.start_seconds)
      if (!text) {
        text = await translateLine(seg.text, locale)
        translationsRef.current.set(seg.start_seconds, text)
      }
      // If speech is still playing from the previous segment and
      // pause-when-behind is on, queue the new line so it plays
      // after the current utterance finishes.
      if (
        isSpeaking &&
        settingsRef.current.ttsEnabled &&
        settingsRef.current.pauseWhenBehind
      ) {
        if (!video.paused) {
          autoPaused = true
          video.pause()
        }
        pendingSpeak = { text, segIdx }
      } else {
        speakSegment(text, segIdx)
      }
    }

    const onTimeUpdate = () => {
      if (autoPaused) return
      if (video.paused) return
      const idx = findActiveIdx(video.currentTime)
      if (idx < 0 || idx === lastIdxRef.current) return
      lastIdxRef.current = idx
      handleNewSegment(idx)
    }

    const onPause = () => {
      // If we paused for TTS sync, don't cancel speech
      if (autoPaused) return
      synth.cancel()
      isSpeaking = false
      pendingSpeak = null
      if (pauseTimerId) {
        clearTimeout(pauseTimerId)
        pauseTimerId = null
      }
      setStatus('ready')
    }
    const onPlay = () => {
      if (autoPaused && !isSpeaking) {
        autoPaused = false
      }
    }
    const onSeeking = () => {
      synth.cancel()
      isSpeaking = false
      autoPaused = false
      pendingSpeak = null
      if (pauseTimerId) {
        clearTimeout(pauseTimerId)
        pauseTimerId = null
      }
      lastIdxRef.current = -1
      setStatus('ready')
    }
    const onEnded = () => {
      synth.cancel()
      isSpeaking = false
      autoPaused = false
      pendingSpeak = null
      if (pauseTimerId) {
        clearTimeout(pauseTimerId)
        pauseTimerId = null
      }
      setStatus('ready')
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('pause', onPause)
    video.addEventListener('play', onPlay)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('ended', onEnded)
      if (pauseTimerId) clearTimeout(pauseTimerId)
    }
  }, [enabled, activeSegments, locale, voice, videoRef])

  // Hide when there's nothing to dub (no transcripts at all)
  if (total === 0) return null
  // Hide for Korean locale if the video already has Korean audio —
  // dubbing would just duplicate the existing narration
  if (locale === 'ko' && videoHasAudio === true) return null

  const label = localeDef.nativeLabel

  return (
    <>
      {/* Karaoke subtitle overlay — bottom of video, shows the
          currently-spoken translated line in sync with the dub */}
      {enabled && currentSubtitle && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 px-4 pointer-events-none max-w-[90%] animate-fade-in"
          style={{ direction: localeDef.dir }}
        >
          <div
            className="inline-block px-4 py-2 rounded-lg backdrop-blur-md text-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(212, 168, 83, 0.4)',
            }}
          >
            <p
              className="text-sm md:text-base font-medium leading-snug"
              style={{
                color: '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              {currentSubtitle}
            </p>
          </div>
        </div>
      )}

      {/* Top-center toggle button / status badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {!enabled ? (
            <button
              onClick={handleEnable}
              disabled={status === 'priming' || status === 'unsupported'}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(212,168,83,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgba(212, 168, 83, 0.95)',
                borderColor: '#fff3',
                color: '#000',
              }}
            >
              <Mic size={13} />
              <span>
                {status === 'priming'
                  ? 'Loading voice...'
                  : status === 'unsupported'
                    ? 'Not supported'
                    : status === 'no-voice'
                      ? 'No ' + label + ' voice'
                      : '🎙 ' + label + ' dub'}
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold backdrop-blur-md border"
                style={{
                  backgroundColor:
                    status === 'speaking'
                      ? 'rgba(212, 168, 83, 0.95)'
                      : 'rgba(0, 0, 0, 0.7)',
                  borderColor:
                    status === 'speaking'
                      ? '#fff3'
                      : 'rgba(212, 168, 83, 0.4)',
                  color: status === 'speaking' ? '#000' : 'var(--color-gold)',
                }}
              >
                <Volume2
                  size={13}
                  className={status === 'speaking' ? 'animate-pulse' : ''}
                />
                <span>
                  {status === 'speaking' ? 'Dubbing · ' : 'Ready · '}
                  {label}
                </span>
                {translatedCount < total && (
                  <span
                    className="text-[9px] opacity-70"
                    style={{ marginLeft: 2 }}
                  >
                    ({translatedCount}/{total})
                  </span>
                )}
              </div>
              {/* Settings popover trigger */}
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10"
                  style={{
                    backgroundColor: settingsOpen
                      ? 'rgba(212, 168, 83, 0.2)'
                      : 'rgba(0, 0, 0, 0.7)',
                    borderColor: settingsOpen
                      ? 'rgba(212, 168, 83, 0.5)'
                      : 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                  }}
                  aria-label="Dub settings"
                  aria-expanded={settingsOpen}
                >
                  <Settings2 size={14} />
                </button>

                {settingsOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-64 rounded-2xl border backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] z-50 animate-fade-in"
                    style={{
                      backgroundColor: 'rgba(15, 15, 15, 0.95)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {/* Header */}
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <p
                        className="text-[9px] tracking-[0.3em] uppercase font-medium"
                        style={{ color: 'var(--color-gold)' }}
                      >
                        Dub Settings
                      </p>
                      {voice && (
                        <p
                          className="text-[10px] mt-1 truncate"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {voice.name}
                        </p>
                      )}
                    </div>

                    <div className="p-3 space-y-1">
                      {/* TTS audio toggle */}
                      <SettingRow
                        label="Voice audio"
                        description="Speak translations aloud"
                        checked={settings.ttsEnabled}
                        onToggle={() =>
                          setSettings((s) => ({
                            ...s,
                            ttsEnabled: !s.ttsEnabled,
                          }))
                        }
                        icon={<Volume2 size={13} />}
                      />
                      {/* Subtitles toggle */}
                      <SettingRow
                        label="Subtitles"
                        description="Show translated captions"
                        checked={settings.subtitlesEnabled}
                        onToggle={() =>
                          setSettings((s) => ({
                            ...s,
                            subtitlesEnabled: !s.subtitlesEnabled,
                          }))
                        }
                        icon={<Captions size={13} />}
                      />
                      {/* Pause-when-behind toggle */}
                      <SettingRow
                        label="Sync pausing"
                        description="Pause video if voice runs long"
                        checked={settings.pauseWhenBehind}
                        onToggle={() =>
                          setSettings((s) => ({
                            ...s,
                            pauseWhenBehind: !s.pauseWhenBehind,
                          }))
                        }
                        icon={<Gauge size={13} />}
                      />
                    </div>

                    {/* Playback rate selector */}
                    {settings.ttsEnabled && (
                      <div
                        className="px-4 py-3 border-t"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <p
                          className="text-[10px] tracking-[0.2em] uppercase mb-2 font-medium"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          Speed
                        </p>
                        <div className="flex items-center gap-1">
                          {PLAYBACK_RATES.map((r) => (
                            <button
                              key={r}
                              onClick={() =>
                                setSettings((s) => ({ ...s, rate: r }))
                              }
                              className="flex-1 px-2 py-1 rounded text-[10px] font-bold tabular-nums transition-colors"
                              style={{
                                backgroundColor:
                                  settings.rate === r
                                    ? 'var(--color-gold)'
                                    : 'var(--color-bg-card)',
                                color: settings.rate === r ? '#000' : 'var(--color-text-secondary)',
                                border:
                                  '1px solid ' +
                                  (settings.rate === r
                                    ? 'var(--color-gold)'
                                    : 'var(--color-border)'),
                              }}
                            >
                              {r.toFixed(2)}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Download SRT */}
                    <div
                      className="px-3 py-3 border-t"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <button
                        onClick={handleDownloadSrt}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold border transition-colors hover:bg-[var(--color-bg-hover)]"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-gold)',
                        }}
                      >
                        <Download size={13} />
                        <span>Download subtitles (.srt)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleDisable}
                className="w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                }}
                aria-label="Disable dubbing"
              >
                <MicOff size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Settings row subcomponent ───────────────────────────────────
interface SettingRowProps {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
  icon: React.ReactNode
}

function SettingRow({
  label,
  description,
  checked,
  onToggle,
  icon,
}: SettingRowProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: checked
            ? 'rgba(212, 168, 83, 0.15)'
            : 'var(--color-bg-card)',
          color: checked ? 'var(--color-gold)' : 'var(--color-text-muted)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-bold leading-none"
          style={{
            color: checked ? 'var(--color-gold)' : 'var(--color-text)',
          }}
        >
          {label}
        </p>
        <p
          className="text-[9px] mt-1 leading-none"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {description}
        </p>
      </div>
      <div
        className="flex-shrink-0 w-8 h-5 rounded-full transition-colors relative"
        style={{
          backgroundColor: checked
            ? 'var(--color-gold)'
            : 'var(--color-bg-card)',
          border: '1px solid ' + (checked ? 'var(--color-gold)' : 'var(--color-border)'),
        }}
      >
        <div
          className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all"
          style={{
            backgroundColor: checked ? '#000' : 'var(--color-text-muted)',
            left: checked ? 'calc(100% - 16px)' : '2px',
          }}
        />
      </div>
      {checked && (
        <Check
          size={11}
          strokeWidth={2.5}
          style={{ color: 'var(--color-gold)', display: 'none' }}
        />
      )}
    </button>
  )
}
