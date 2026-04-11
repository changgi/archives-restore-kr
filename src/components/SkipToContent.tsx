'use client'

import { useT } from '@/i18n/LanguageProvider'

export default function SkipToContent() {
  const t = useT()
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-black"
      style={{ backgroundColor: 'var(--color-gold)' }}
    >
      {t.skipToContent}
    </a>
  )
}
