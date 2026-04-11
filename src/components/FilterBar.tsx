'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X, SlidersHorizontal, Tag, Calendar, Building2, FileImage, Film } from 'lucide-react'
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
      const qs = params.toString()
      router.push(qs ? `/cases?${qs}` : '/cases')
    },
    [router, searchParams],
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('year')
    params.delete('organization')
    const qs = params.toString()
    router.push(qs ? `/cases?${qs}` : '/cases')
  }, [router, searchParams])

  const hasActiveFilters =
    currentCategory !== 'all' || currentYear || currentOrg

  const selectStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  }

  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          <SlidersHorizontal size={12} />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors hover:bg-[var(--color-red)]/5"
            style={{
              borderColor: 'rgba(197, 48, 48, 0.4)',
              color: 'var(--color-red)',
            }}
          >
            <X size={11} />
            <span>초기화</span>
          </button>
        )}
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Category */}
        <label
          className="relative flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors hover:border-[var(--color-border-hover)]"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor:
              currentCategory !== 'all'
                ? 'rgba(212, 168, 83, 0.5)'
                : 'var(--color-border)',
          }}
        >
          {currentCategory === 'paper' ? (
            <FileImage
              size={14}
              className="flex-shrink-0"
              style={{ color: 'var(--color-gold)' }}
            />
          ) : currentCategory === 'audiovisual' ? (
            <Film
              size={14}
              className="flex-shrink-0"
              style={{ color: 'var(--color-gold)' }}
            />
          ) : (
            <Tag
              size={14}
              className="flex-shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
            />
          )}
          <select
            value={currentCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer"
            style={{ color: 'var(--color-text)' }}
          >
            <option value="all" style={selectStyle}>
              전체 유형
            </option>
            <option value="paper" style={selectStyle}>
              종이류
            </option>
            <option value="audiovisual" style={selectStyle}>
              시청각
            </option>
          </select>
        </label>

        {/* Year */}
        <label
          className="relative flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors hover:border-[var(--color-border-hover)]"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: currentYear
              ? 'rgba(212, 168, 83, 0.5)'
              : 'var(--color-border)',
          }}
        >
          <Calendar
            size={14}
            className="flex-shrink-0"
            style={{
              color: currentYear
                ? 'var(--color-gold)'
                : 'var(--color-text-muted)',
            }}
          />
          <select
            value={currentYear}
            onChange={(e) => updateFilter('year', e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer"
            style={{ color: 'var(--color-text)' }}
          >
            <option value="" style={selectStyle}>
              전체 연도
            </option>
            {years.map((y) => (
              <option key={y} value={y} style={selectStyle}>
                {y}년
              </option>
            ))}
          </select>
        </label>

        {/* Organization */}
        <label
          className="relative flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors hover:border-[var(--color-border-hover)]"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: currentOrg
              ? 'rgba(212, 168, 83, 0.5)'
              : 'var(--color-border)',
          }}
        >
          <Building2
            size={14}
            className="flex-shrink-0"
            style={{
              color: currentOrg
                ? 'var(--color-gold)'
                : 'var(--color-text-muted)',
            }}
          />
          <select
            value={currentOrg}
            onChange={(e) => updateFilter('organization', e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer truncate"
            style={{ color: 'var(--color-text)' }}
          >
            <option value="" style={selectStyle}>
              전체 기관
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id} style={selectStyle}>
                {org.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentCategory !== 'all' && (
            <span
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium border"
              style={{
                backgroundColor: 'rgba(212, 168, 83, 0.08)',
                borderColor: 'rgba(212, 168, 83, 0.3)',
                color: 'var(--color-gold)',
              }}
            >
              <span>{currentCategory === 'paper' ? '종이류' : '시청각'}</span>
              <button
                onClick={() => updateFilter('category', 'all')}
                className="p-0.5 rounded-full hover:bg-[var(--color-gold)]/10"
                aria-label="유형 필터 제거"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {currentYear && (
            <span
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium border"
              style={{
                backgroundColor: 'rgba(212, 168, 83, 0.08)',
                borderColor: 'rgba(212, 168, 83, 0.3)',
                color: 'var(--color-gold)',
              }}
            >
              <span>{currentYear}년</span>
              <button
                onClick={() => updateFilter('year', '')}
                className="p-0.5 rounded-full hover:bg-[var(--color-gold)]/10"
                aria-label="연도 필터 제거"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {currentOrg && (
            <span
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium border max-w-full"
              style={{
                backgroundColor: 'rgba(212, 168, 83, 0.08)',
                borderColor: 'rgba(212, 168, 83, 0.3)',
                color: 'var(--color-gold)',
              }}
            >
              <span className="truncate">
                {organizations.find((o) => o.id === currentOrg)?.name || '기관'}
              </span>
              <button
                onClick={() => updateFilter('organization', '')}
                className="p-0.5 rounded-full hover:bg-[var(--color-gold)]/10 flex-shrink-0"
                aria-label="기관 필터 제거"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
