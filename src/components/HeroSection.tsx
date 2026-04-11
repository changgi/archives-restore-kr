'use client'

import Link from 'next/link'
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

export default function HeroSection() {
  const t = useT()
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(212,168,83,0.08) 0%, transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.3) 0%, var(--color-bg) 100%)',
        }}
      />

      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Vertical gold accent line (top) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-28 opacity-40 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-gold))',
        }}
      />

      {/* Corner accents */}
      <div
        className="absolute top-24 left-8 md:left-16 w-20 h-px opacity-30 pointer-events-none"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />
      <div
        className="absolute top-24 left-8 md:left-16 w-px h-20 opacity-30 pointer-events-none"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />
      <div
        className="absolute top-24 right-8 md:right-16 w-20 h-px opacity-30 pointer-events-none"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />
      <div
        className="absolute top-24 right-8 md:right-16 w-px h-20 opacity-30 pointer-events-none"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-12 animate-fade-in">
        {/* Museum label */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border"
          style={{
            borderColor: 'rgba(212, 168, 83, 0.3)',
            backgroundColor: 'rgba(212, 168, 83, 0.05)',
          }}
        >
          <Sparkles size={12} style={{ color: 'var(--color-gold)' }} />
          <span
            className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            {t.hero.eyebrowTop}
          </span>
        </div>

        {/* Divider + title */}
        <div className="flex items-center justify-center gap-5 mb-6">
          <div
            className="h-px w-12 md:w-20 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          <p
            className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            {t.hero.eyebrowMiddle}
          </p>
          <div
            className="h-px w-12 md:w-20 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
          <span style={{ color: 'var(--color-gold)' }}>{t.hero.titleAccent}</span>
          {t.hero.titleTail}
        </h1>

        <p
          className="text-base md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t.hero.subtitle1}
          <br className="hidden sm:block" />
          {t.hero.subtitle2}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cases"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            <span>{t.hero.ctaCases}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/stories"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[var(--color-gold)]/5"
            style={{
              borderColor: 'var(--color-gold)',
              color: 'var(--color-gold)',
            }}
          >
            <span>{t.hero.ctaStories}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span
          className="text-[9px] tracking-[0.3em] uppercase font-medium opacity-60"
          style={{ color: 'var(--color-gold)' }}
        >
          {t.hero.scroll}
        </span>
        <ChevronDown
          size={20}
          className="animate-bounce"
          style={{ color: 'var(--color-gold)' }}
        />
      </div>
    </section>
  )
}
