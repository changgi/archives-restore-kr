'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  getLocaleDef,
  matchLocale,
} from './config'
import type { Messages } from './types'
import { messages } from './messages'
import AutoTranslate from './AutoTranslate'

const STORAGE_KEY = 'restore.locale'
const COOKIE_NAME = 'restore_locale'

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Messages
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Read the user's preferred locale from (in order):
 *   1. localStorage
 *   2. cookie (set by us on previous visits)
 *   3. navigator.language (Accept-Language proxy)
 */
function readPreferredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && LOCALES.some((l) => l.code === stored)) {
      return stored as Locale
    }
  } catch {
    /* ignore */
  }
  // Cookie fallback
  if (typeof document !== 'undefined') {
    const m = document.cookie.match(
      new RegExp('(?:^|;\\s*)' + COOKIE_NAME + '=([^;]+)'),
    )
    if (m && LOCALES.some((l) => l.code === m[1])) {
      return m[1] as Locale
    }
  }
  // Navigator language
  if (typeof navigator !== 'undefined') {
    return matchLocale(navigator.language)
  }
  return DEFAULT_LOCALE
}

function writeLocale(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore (private mode) */
  }
  if (typeof document !== 'undefined') {
    // 365-day persistence
    const maxAge = 60 * 60 * 24 * 365
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; samesite=lax`
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [hydrated, setHydrated] = useState(false)

  // Sync from localStorage / cookie / navigator on mount.
  // Runs once (strict-mode safe because the read is idempotent).
  useEffect(() => {
    const next = readPreferredLocale()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot hydration from persistent store
    setLocaleState(next)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mark hydrated
    setHydrated(true)
  }, [])

  // Apply document-level lang + dir whenever locale changes
  useEffect(() => {
    if (typeof document === 'undefined') return
    const def = getLocaleDef(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = def.dir
    document.documentElement.setAttribute('data-locale', locale)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeLocale(next)
  }, [])

  const def = getLocaleDef(locale)
  const value: LanguageContextValue = {
    locale,
    setLocale,
    t: messages[locale] ?? messages[DEFAULT_LOCALE],
    dir: def.dir,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {hydrated && <AutoTranslate />}
    </LanguageContext.Provider>
  )
}

/** Hook to access the current locale's translations */
export function useT(): Messages {
  const ctx = useContext(LanguageContext)
  if (!ctx) return messages[DEFAULT_LOCALE]
  return ctx.t
}

/** Hook to access full locale context (for switcher, RTL logic, etc.) */
export function useLocale(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // Server render fallback — returns defaults
    const def = getLocaleDef(DEFAULT_LOCALE)
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {
        /* noop on server */
      },
      t: messages[DEFAULT_LOCALE],
      dir: def.dir,
    }
  }
  return ctx
}
