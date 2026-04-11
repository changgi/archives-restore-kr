'use client'

import { Search } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

interface CasesCountProps {
  count: number
  filtered: boolean
}

/** Translated "{N}건의 복원 사례 (필터링됨)" counter */
export function CasesCount({ count, filtered }: CasesCountProps) {
  const t = useT()
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl md:text-3xl font-bold tabular-nums"
          style={{ color: 'var(--color-gold)' }}
        >
          {count}
        </span>
        <span
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {t.filters.resultsCount}
          {filtered && ' ' + t.filters.resultsFiltered}
        </span>
      </div>
    </div>
  )
}

/** Translated "검색 결과가 없습니다" empty state */
export function CasesEmpty() {
  const t = useT()
  return (
    <div
      className="text-center py-24 rounded-2xl border"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{ backgroundColor: 'rgba(212, 168, 83, 0.1)' }}
      >
        <Search size={28} style={{ color: 'var(--color-gold)' }} />
      </div>
      <p
        className="text-lg font-bold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        {t.filters.empty}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {t.filters.emptyHint}
      </p>
    </div>
  )
}
