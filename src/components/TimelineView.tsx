'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  ArrowUpRight,
} from 'lucide-react'
import type { RestorationCase } from '@/types'

interface TimelineViewProps {
  casesByYear: { year: number; cases: RestorationCase[] }[]
}

export default function TimelineView({ casesByYear }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = dir === 'left' ? -400 : 400
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  // Find peak count for proportional indicator
  const peakCount = Math.max(
    ...casesByYear.map((y) => y.cases.length),
    1,
  )

  return (
    <div className="relative">
      {/* Desktop scroll buttons */}
      <div className="hidden md:flex absolute -top-14 right-0 items-center gap-2 z-10">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: canScrollLeft
              ? 'rgba(212, 168, 83, 0.4)'
              : 'var(--color-border)',
            color: canScrollLeft
              ? 'var(--color-gold)'
              : 'var(--color-text-muted)',
          }}
          aria-label="이전 연도"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: canScrollRight
              ? 'rgba(212, 168, 83, 0.4)'
              : 'var(--color-border)',
            color: canScrollRight
              ? 'var(--color-gold)'
              : 'var(--color-text-muted)',
          }}
          aria-label="다음 연도"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Desktop: horizontal scroll rail */}
      <div className="hidden md:block relative">
        {/* Horizontal timeline rail */}
        <div
          className="absolute left-0 right-0 top-[78px] h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--color-gold) 10%, var(--color-gold) 90%, transparent)',
            opacity: 0.35,
          }}
        />

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {casesByYear.map(({ year, cases }, idx) => {
            const heightPct = Math.round((cases.length / peakCount) * 100)
            return (
              <div
                key={year}
                className="flex-shrink-0 w-72 snap-start animate-fade-in"
                style={{
                  animationDelay: `${Math.min(idx * 60, 360)}ms`,
                  animationFillMode: 'both',
                }}
              >
                {/* Year header */}
                <div className="relative mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span
                      className="text-3xl font-bold tabular-nums leading-none"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      {year}
                    </span>
                    <span
                      className="text-xs font-medium tabular-nums"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {cases.length}건
                    </span>
                  </div>
                  {/* Volume indicator bar */}
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${heightPct}%`,
                        backgroundColor: 'var(--color-gold)',
                      }}
                    />
                  </div>
                  {/* Timeline dot (aligned with rail) */}
                  <div
                    className="absolute -bottom-[10px] left-0 w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor: 'var(--color-gold)',
                      borderColor: 'var(--color-bg)',
                    }}
                  />
                </div>

                {/* Cases */}
                <div className="space-y-2 mt-8">
                  {cases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/cases/${c.id}`}
                      className="group block p-3 rounded-lg border transition-all hover:border-[var(--color-gold)]/40 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-semibold line-clamp-2 leading-snug flex-1 group-hover:text-[var(--color-gold)] transition-colors">
                          {c.title}
                        </h4>
                        <ArrowUpRight
                          size={13}
                          className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--color-gold)' }}
                        />
                      </div>
                      {c.organizations?.name && (
                        <div
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Building2 size={10} />
                          <span className="truncate">
                            {c.organizations.name}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden relative pl-6">
        {/* Vertical rail */}
        <div
          className="absolute left-1 top-0 bottom-0 w-px"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--color-gold) 5%, var(--color-gold) 95%, transparent)',
            opacity: 0.35,
          }}
        />

        <div className="space-y-10">
          {casesByYear.map(({ year, cases }, idx) => {
            const heightPct = Math.round((cases.length / peakCount) * 100)
            return (
              <div
                key={year}
                className="relative animate-fade-in"
                style={{
                  animationDelay: `${Math.min(idx * 60, 360)}ms`,
                  animationFillMode: 'both',
                }}
              >
                {/* Timeline dot */}
                <div
                  className="absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: 'var(--color-gold)',
                    borderColor: 'var(--color-bg)',
                  }}
                />

                {/* Year header */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span
                      className="text-2xl font-bold tabular-nums leading-none"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      {year}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {cases.length}건
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${heightPct}%`,
                        backgroundColor: 'var(--color-gold)',
                      }}
                    />
                  </div>
                </div>

                {/* Cases */}
                <div className="space-y-2">
                  {cases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/cases/${c.id}`}
                      className="group block p-3 rounded-lg border transition-all"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <h4 className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-[var(--color-gold)] transition-colors">
                        {c.title}
                      </h4>
                      {c.organizations?.name && (
                        <p
                          className="text-[11px] truncate"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {c.organizations.name}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
