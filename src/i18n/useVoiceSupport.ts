'use client'

import { useEffect, useState } from 'react'
import { LOCALES, type Locale } from './config'

/**
 * BCP-47 voice tag per locale, matching the map in VideoDub.tsx.
 * Kept separate so VideoDub stays a pure UI component.
 */
const LOCALE_TO_VOICE_LANG: Record<Locale, string> = {
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

/**
 * Returns the set of locales for which the current browser has at
 * least one matching speech synthesis voice. Useful for marking
 * language switcher entries that support dubbing.
 *
 * Handles the async voice loading race — speechSynthesis.getVoices()
 * returns empty on first call in Chrome, then fires the
 * 'voiceschanged' event once the catalogue is populated.
 */
export function useVoiceSupport(): Set<Locale> {
  const [supported, setSupported] = useState<Set<Locale>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return

    const compute = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) return
      const result = new Set<Locale>()
      for (const loc of LOCALES) {
        const target = LOCALE_TO_VOICE_LANG[loc.code].toLowerCase()
        const prefix = target.split('-')[0]
        const has = voices.some((v) => {
          const lang = v.lang.toLowerCase()
          return lang === target || lang.startsWith(prefix)
        })
        if (has) result.add(loc.code)
      }
      setSupported(result)
    }

    compute()
    window.speechSynthesis.addEventListener('voiceschanged', compute)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', compute)
    }
  }, [])

  return supported
}
