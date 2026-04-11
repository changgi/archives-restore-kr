'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

interface HomeJourneyCTAProps {
  minYear: number
  maxYear: number
  totalCases: number
}

export default function HomeJourneyCTA({ minYear, maxYear, totalCases }: HomeJourneyCTAProps) {
  const t = useT()
  const s = t.sections
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-gold))',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <Sparkles
          size={24}
          className="mx-auto mb-5"
          style={{ color: 'var(--color-gold)' }}
        />
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {s.beginJourneyEyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
          {s.beginJourneyTitleLine1}
          <br />
          {s.beginJourneyTitleLine2Bold}
          <span style={{ color: 'var(--color-gold)' }}>
            {s.beginJourneyTitleLine2Accent}
          </span>
        </h2>
        <p
          className="mb-10 text-sm md:text-base leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {s.beginJourneyDescPre}
          <span className="font-bold" style={{ color: 'var(--color-gold)' }}>
            {minYear}
          </span>
          {s.beginJourneyDescTo}
          <span className="font-bold" style={{ color: 'var(--color-gold)' }}>
            {maxYear}
          </span>
          {', '}
          <span className="font-bold" style={{ color: 'var(--color-gold)' }}>
            {totalCases}
            {t.stats.totalCasesSuffix}
          </span>
          {s.beginJourneyDescTotal}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/cases"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            <span>{s.beginJourneyCtaAll}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/about"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[var(--color-gold)]/5"
            style={{
              borderColor: 'var(--color-gold)',
              color: 'var(--color-gold)',
            }}
          >
            <span>{s.beginJourneyCtaAbout}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
