'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import type { Organization } from '@/types'

interface FilterBarProps {
  organizations: Organization[]
  years: number[]
}

export default function FilterBar({ organizations, years }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || 'all'
  const currentYear = searchParams.get('year') || ''
  const currentOrg = searchParams.get('organization') || ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/cases?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('/cases')
  }, [router])

  const hasActiveFilters = currentCategory !== 'all' || currentYear || currentOrg

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Category filter */}
        <select
          value={currentCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
        >
          <option value="all">전체 유형</option>
          <option value="paper">종이류</option>
          <option value="audiovisual">시청각</option>
        </select>

        {/* Year filter */}
        <select
          value={currentYear}
          onChange={(e) => updateFilter('year', e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
        >
          <option value="">전체 연도</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>

        {/* Organization filter */}
        <select
          value={currentOrg}
          onChange={(e) => updateFilter('organization', e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] max-w-[200px]"
        >
          <option value="">전체 기관</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-[var(--color-red)] text-[var(--color-red)] hover:bg-[var(--color-red)]/10 transition-colors"
          >
            <X size={14} />
            초기화
          </button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
              {currentCategory === 'paper' ? '종이류' : '시청각'}
              <button onClick={() => updateFilter('category', 'all')}>
                <X size={12} />
              </button>
            </span>
          )}
          {currentYear && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
              {currentYear}년
              <button onClick={() => updateFilter('year', '')}>
                <X size={12} />
              </button>
            </span>
          )}
          {currentOrg && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
              {organizations.find((o) => o.id === currentOrg)?.name || '기관'}
              <button onClick={() => updateFilter('organization', '')}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
