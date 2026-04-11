'use client'

import Link from 'next/link'
import { Search, Home } from 'lucide-react'
import SmartBackButton from '@/components/SmartBackButton'
import { useT } from '@/i18n/LanguageProvider'

export default function NotFound() {
  const t = useT()
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-24">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-gold))',
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 text-center animate-fade-in">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {t.notFound.eyebrow}
        </p>

        <div className="flex items-center justify-center gap-3 md:gap-5 mb-8">
          <div
            className="hidden sm:block h-px w-10 md:w-16 opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          <h1
            className="text-7xl md:text-9xl font-bold tabular-nums tracking-tight whitespace-nowrap"
            style={{ color: 'var(--color-gold)' }}
          >
            404
          </h1>
          <div
            className="hidden sm:block h-px w-10 md:w-16 opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t.notFound.title}
        </h2>
        <p
          className="text-base md:text-lg mb-10 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t.notFound.desc1}
          <br className="hidden sm:block" />
          {t.notFound.desc2}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            <Home size={16} />
            <span>{t.notFound.goHome}</span>
          </Link>
          <Link
            href="/cases"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[var(--color-gold)]/5"
            style={{
              borderColor: 'var(--color-gold)',
              color: 'var(--color-gold)',
            }}
          >
            <Search size={16} />
            <span>{t.notFound.exploreCases}</span>
          </Link>
        </div>

        <div
          className="mt-10 pt-8 border-t inline-flex items-center gap-6"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <SmartBackButton fallbackHref="/" label={t.notFound.back} />
          <span
            className="h-4 w-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          <Link
            href="/about"
            className="text-xs tracking-[0.2em] uppercase inline-flex items-center gap-1.5 hover:text-[var(--color-gold)] transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.notFound.aboutLink}
          </Link>
        </div>
      </div>
    </div>
  )
}
