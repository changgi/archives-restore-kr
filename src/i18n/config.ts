/**
 * i18n configuration — locales, labels, directions, fonts.
 *
 * Default locale: Korean. DB content (case titles, descriptions,
 * video transcripts) stays in Korean; only UI shell is translated.
 */

export type Locale =
  | 'ko'
  | 'en'
  | 'ja'
  | 'zh-CN'
  | 'zh-HK'
  | 'ru'
  | 'es'
  | 'fr'
  | 'ar'
  | 'vi'
  | 'af'
  | 'qu'
  | 'fj'

export interface LocaleDef {
  code: Locale
  /** English label (always ascii so it renders with any fallback font) */
  label: string
  /** Native label (may need a non-Latin font) */
  nativeLabel: string
  /** Text direction */
  dir: 'ltr' | 'rtl'
  /** Browser-side Accept-Language match */
  matches: string[]
  /** Emoji flag (rough geographic association) */
  flag: string
}

export const DEFAULT_LOCALE: Locale = 'ko'

export const LOCALES: LocaleDef[] = [
  {
    code: 'ko',
    label: 'Korean',
    nativeLabel: '한국어',
    dir: 'ltr',
    matches: ['ko', 'ko-KR'],
    flag: '🇰🇷',
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    dir: 'ltr',
    matches: ['en', 'en-US', 'en-GB', 'en-AU'],
    flag: '🇺🇸',
  },
  {
    code: 'ja',
    label: 'Japanese',
    nativeLabel: '日本語',
    dir: 'ltr',
    matches: ['ja', 'ja-JP'],
    flag: '🇯🇵',
  },
  {
    code: 'zh-CN',
    label: 'Chinese (Simplified)',
    nativeLabel: '简体中文',
    dir: 'ltr',
    matches: ['zh', 'zh-CN', 'zh-Hans'],
    flag: '🇨🇳',
  },
  {
    code: 'zh-HK',
    label: 'Chinese (Hong Kong)',
    nativeLabel: '繁體中文',
    dir: 'ltr',
    matches: ['zh-HK', 'zh-TW', 'zh-Hant'],
    flag: '🇭🇰',
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: 'Русский',
    dir: 'ltr',
    matches: ['ru', 'ru-RU'],
    flag: '🇷🇺',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
    dir: 'ltr',
    matches: ['es', 'es-ES', 'es-MX', 'es-AR'],
    flag: '🇪🇸',
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Français',
    dir: 'ltr',
    matches: ['fr', 'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH'],
    flag: '🇫🇷',
  },
  {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    dir: 'rtl',
    matches: ['ar', 'ar-MA', 'ar-EG', 'ar-SA'],
    flag: '🇲🇦',
  },
  {
    code: 'vi',
    label: 'Vietnamese',
    nativeLabel: 'Tiếng Việt',
    dir: 'ltr',
    matches: ['vi', 'vi-VN'],
    flag: '🇻🇳',
  },
  {
    code: 'af',
    label: 'Afrikaans',
    nativeLabel: 'Afrikaans',
    dir: 'ltr',
    matches: ['af', 'af-ZA'],
    flag: '🇿🇦',
  },
  {
    code: 'qu',
    label: 'Quechua',
    nativeLabel: 'Runa Simi',
    dir: 'ltr',
    matches: ['qu', 'qu-PE'],
    flag: '🇵🇪',
  },
  {
    code: 'fj',
    label: 'Fijian',
    nativeLabel: 'Vosa Vakaviti',
    dir: 'ltr',
    matches: ['fj', 'fj-FJ'],
    flag: '🇫🇯',
  },
]

export function getLocaleDef(code: Locale): LocaleDef {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]
}

/**
 * Best-effort match from a raw Accept-Language string.
 * Returns the default locale if nothing matches.
 */
export function matchLocale(rawLang: string | undefined | null): Locale {
  if (!rawLang) return DEFAULT_LOCALE
  const lower = rawLang.toLowerCase()
  // Exact match first
  for (const l of LOCALES) {
    if (l.matches.some((m) => m.toLowerCase() === lower)) return l.code
  }
  // Prefix match (e.g. "en-NZ" → "en")
  const prefix = lower.split('-')[0]
  for (const l of LOCALES) {
    if (l.matches.some((m) => m.toLowerCase().startsWith(prefix))) return l.code
  }
  return DEFAULT_LOCALE
}
