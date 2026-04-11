'use client'

import { Clock, TrendingUp, Archive } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

interface TimelineStatsPillProps {
  minYear: number
  maxYear: number
  totalCases: number
  peakYear: number
  peakCount: number
}

export default function TimelineStatsPill({
  minYear,
  maxYear,
  totalCases,
  peakYear,
  peakCount,
}: TimelineStatsPillProps) {
  const t = useT()
  return (
    <div
      className="mt-10 inline-flex flex-wrap items-center justify-center gap-6 md:gap-8 px-6 md:px-10 py-5 rounded-2xl border"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.12)' }}
        >
          <Clock size={18} style={{ color: 'var(--color-gold)' }} />
        </div>
        <div className="text-left">
          <p
            className="text-xl md:text-2xl font-bold leading-none tabular-nums"
            style={{ color: 'var(--color-gold)' }}
          >
            {minYear} ~ {maxYear}
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.timeline.yearRange}
          </p>
        </div>
      </div>
      <div
        className="hidden md:block h-10 w-px"
        style={{ backgroundColor: 'var(--color-border)' }}
      />
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.12)' }}
        >
          <Archive size={18} style={{ color: 'var(--color-gold)' }} />
        </div>
        <div className="text-left">
          <p
            className="text-xl md:text-2xl font-bold leading-none tabular-nums"
            style={{ color: 'var(--color-gold)' }}
          >
            {totalCases}
            {t.stats.totalCasesSuffix}
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.timeline.totalCases}
          </p>
        </div>
      </div>
      <div
        className="hidden md:block h-10 w-px"
        style={{ backgroundColor: 'var(--color-border)' }}
      />
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.12)' }}
        >
          <TrendingUp size={18} style={{ color: 'var(--color-gold)' }} />
        </div>
        <div className="text-left">
          <p
            className="text-xl md:text-2xl font-bold leading-none tabular-nums"
            style={{ color: 'var(--color-gold)' }}
          >
            {peakYear}
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.timeline.peak} ({peakCount}
            {t.timeline.peakCases})
          </p>
        </div>
      </div>
    </div>
  )
}
