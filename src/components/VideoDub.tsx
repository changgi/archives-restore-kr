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
import { Mic, MicOff, Volume2 } from 'lucide-react'
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
    clearConsent()
    window.speechSynthesis.cancel()
    const video = videoRef.current
    if (video) {
      video.muted = false
    }
    lastIdxRef.current = -1
  }, [videoRef])

  // Hook video timeupdate to trigger segment speech
  useEffect(() => {
    if (!enabled) return
    const video = videoRef.current
    if (!video) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const synth = window.speechSynthesis
    const sorted = [...activeSegments].sort(
      (a, b) => a.start_seconds - b.start_seconds,
    )

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

    const speakSegment = async (text: string) => {
      if (!text) return
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = VOICE_LANG[locale]
      if (voice) u.voice = voice
      u.rate = 1.0
      u.pitch = 1.0
      u.volume = 1.0
      u.onstart = () => {
        setStatus('speaking')
        setCurrentSubtitle(text)
      }
      u.onend = () => {
        setStatus('ready')
        // Clear the subtitle after a short grace period so it
        // doesn't disappear the instant the voice stops
        setTimeout(() => setCurrentSubtitle(''), 800)
      }
      u.onerror = () => setStatus('ready')
      synth.speak(u)
    }

    const onTimeUpdate = async () => {
      if (video.paused) return
      const idx = findActiveIdx(video.currentTime)
      if (idx < 0 || idx === lastIdxRef.current) return
      lastIdxRef.current = idx
      const seg = sorted[idx]
      let text = translationsRef.current.get(seg.start_seconds)
      if (!text) {
        text = await translateLine(seg.text, locale)
        translationsRef.current.set(seg.start_seconds, text)
      }
      speakSegment(text)
    }

    const onPause = () => {
      synth.cancel()
      setStatus('ready')
    }
    const onSeeking = () => {
      synth.cancel()
      lastIdxRef.current = -1
      setStatus('ready')
    }
    const onEnded = () => {
      synth.cancel()
      setStatus('ready')
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('pause', onPause)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('ended', onEnded)
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
