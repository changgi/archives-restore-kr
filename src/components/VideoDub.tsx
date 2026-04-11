'use client'

/**
 * VideoDub — client-side voice dubbing via the Web Speech API.
 *
 * Takes:
 *   - a ref to the <video> element
 *   - an array of Korean transcript segments ({ start_seconds, text })
 *
 * When the active locale is NOT Korean:
 *   1. Translates every segment on-the-fly via Google Translate's
 *      public endpoint (same one AutoTranslate uses). Caches in
 *      localStorage so subsequent video plays are instant.
 *   2. Mutes the video and hooks into its `timeupdate` event.
 *   3. When the playhead crosses a segment's start_seconds, cancels
 *      any in-flight speech and queues an SSU for that segment in
 *      the target language using the browser's voice catalogue.
 *   4. Pauses speech on video pause / seek / locale change.
 *
 * This gives us real voice dubbing in all 13 supported languages
 * without any server-side TTS pipeline, audio file generation, or
 * ffmpeg muxing. The quality depends on the browser's built-in
 * neural voices (Chrome/Edge ship them for most major languages).
 */

import { useEffect, useRef } from 'react'
import type { VideoTranscript } from '@/types'
import { useLocale } from '@/i18n/LanguageProvider'
import type { Locale } from '@/i18n/config'

// Map app locales to BCP-47 tags the browser SpeechSynthesis
// voice catalogue uses.
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
  qu: 'es-PE', // Quechua — no browser voice, fallback to Peruvian Spanish
  fj: 'en-GB', // Fijian — no browser voice, fallback to British English
}

// Google Translate code mapping (slightly different for zh variants)
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

const CACHE_PREFIX = 'ar.tx.v1.'

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
  const cached = readCache(locale, text)
  if (cached) return cached
  const gt = GT_LANG[locale] ?? locale
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx' +
    '&sl=ko' +
    '&tl=' + encodeURIComponent(gt) +
    '&dt=t' +
    '&q=' + encodeURIComponent(text)
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
 * Pick the best voice for a given BCP-47 language tag.
 * Prefers non-default neural voices; falls back to the first match.
 */
function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const lower = lang.toLowerCase()
  // Exact match first
  const exact = voices.filter((v) => v.lang.toLowerCase() === lower)
  if (exact.length > 0) {
    // Prefer neural / premium / natural over default system voices
    const premium = exact.find((v) =>
      /natural|neural|premium|online/i.test(v.name),
    )
    return premium ?? exact[0]
  }
  // Prefix match: 'en-US' against 'en-GB' etc.
  const prefix = lower.split('-')[0]
  const prefixed = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(prefix),
  )
  if (prefixed.length > 0) return prefixed[0]
  return null
}

interface VideoDubProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  transcripts: VideoTranscript[]
}

export default function VideoDub({ videoRef, transcripts }: VideoDubProps) {
  const { locale } = useLocale()
  const lastIdxRef = useRef(-1)
  const dubEnabledRef = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Only dub when not Korean and we have segments
    if (locale === 'ko' || !transcripts || transcripts.length === 0) return
    const video = videoRef.current
    if (!video) return
    if (!('speechSynthesis' in window)) return

    // Sort segments by start time so binary-search works later
    const sorted = [...transcripts].sort(
      (a, b) => a.start_seconds - b.start_seconds,
    )

    // Pre-translate all segments in the background so the first
    // speech attempt doesn't suffer network latency. We still guard
    // with per-speak translation in case this async step is slow.
    const translations = new Map<number, string>()
    let cancelled = false
    ;(async () => {
      for (const seg of sorted) {
        if (cancelled) return
        const tx = await translateLine(seg.text, locale)
        if (cancelled) return
        translations.set(seg.start_seconds, tx)
      }
    })()

    const synth = window.speechSynthesis
    let voice: SpeechSynthesisVoice | null = null
    const loadVoice = () => {
      voice = pickVoice(synth.getVoices(), VOICE_LANG[locale])
    }
    loadVoice()
    synth.addEventListener('voiceschanged', loadVoice)

    // When the video was originally muted (Korean with no dub),
    // preserve that. When we're dubbing we force muted because we
    // don't want Korean audio playing under the dub.
    const originalMuted = video.muted
    video.muted = true

    const speakSegment = async (text: string) => {
      if (!dubEnabledRef.current) return
      if (!voice) loadVoice()
      // Cancel any in-flight utterance so we don't pile up
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = VOICE_LANG[locale]
      if (voice) u.voice = voice
      u.rate = 1.0
      u.pitch = 1.0
      u.volume = 1.0
      synth.speak(u)
    }

    /**
     * Find the segment index whose start_seconds is <= currentTime
     * but the next segment's start_seconds is > currentTime.
     */
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

    const onTimeUpdate = async () => {
      const idx = findActiveIdx(video.currentTime)
      if (idx < 0 || idx === lastIdxRef.current) return
      lastIdxRef.current = idx
      const seg = sorted[idx]
      let text = translations.get(seg.start_seconds)
      if (!text) {
        text = await translateLine(seg.text, locale)
        translations.set(seg.start_seconds, text)
      }
      if (!cancelled && !video.paused) speakSegment(text)
    }

    const onPause = () => synth.cancel()
    const onSeeking = () => {
      synth.cancel()
      lastIdxRef.current = -1
    }
    const onEnded = () => synth.cancel()

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('pause', onPause)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('ended', onEnded)

    return () => {
      cancelled = true
      synth.cancel()
      synth.removeEventListener('voiceschanged', loadVoice)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('ended', onEnded)
      video.muted = originalMuted
    }
  }, [locale, transcripts, videoRef])

  return null
}
