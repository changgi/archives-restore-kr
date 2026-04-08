'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { RestorationCase } from '@/types'

interface TimelineViewProps {
  casesByYear: { year: number; cases: RestorationCase[] }[]
}

export default function TimelineView({ casesByYear }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = dir === 'left' ? -400 : 400
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Desktop scroll buttons */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between z-10 pointer-events-none px-2">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors pointer-events-auto"
          aria-label="이전 연도로 스크롤"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors pointer-events-auto"
          aria-label="다음 연도로 스크롤"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Desktop: horizontal scroll */}
      <div
        ref={scrollRef}
        className="hidden md:flex overflow-x-auto gap-8 pb-6 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {casesByYear.map(({ year, cases }, idx) => (
          <motion.div
            key={year}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="flex-shrink-0 w-72 snap-start"
          >
            <div className="relative pb-4 mb-4 border-b-2 border-[var(--color-gold)]">
              <span className="text-2xl font-bold text-[var(--color-gold)]">{year}</span>
              <span className="ml-2 text-sm text-[var(--color-text-muted)]">{cases.length}건</span>
              <div className="absolute -bottom-[5px] left-4 w-2 h-2 rounded-full bg-[var(--color-gold)]" />
            </div>
            <div className="space-y-3">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="block p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-gold)]/30 hover:bg-[var(--color-bg-hover)] transition-all"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <h4 className="text-sm font-medium text-[var(--color-text)] line-clamp-2 mb-1">
                    {c.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {c.organizations?.name || ''}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden space-y-8">
        {casesByYear.map(({ year, cases }, idx) => (
          <motion.div
            key={year}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="relative pl-6 border-l-2 border-[var(--color-gold)]/30"
          >
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[var(--color-gold)]" />
            <div className="mb-3">
              <span className="text-xl font-bold text-[var(--color-gold)]">{year}</span>
              <span className="ml-2 text-sm text-[var(--color-text-muted)]">{cases.length}건</span>
            </div>
            <div className="space-y-2">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="block p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-gold)]/30 transition-all"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <h4 className="text-sm font-medium text-[var(--color-text)] line-clamp-2">
                    {c.title}
                  </h4>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
