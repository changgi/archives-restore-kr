import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getAllCases, getOrganizations, getYearStats } from '@/lib/queries'
import type { CaseFilters } from '@/types'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import RecordCard from '@/components/RecordCard'
import { Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '복원 사례',
  description:
    '국가기록원 기록물 복원 사례 목록. 종이류, 시청각 기록물의 복원 전후를 확인하세요.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

async function CasesList({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>
}) {
  const filters: CaseFilters = {
    category: searchParams.category,
    year: searchParams.year,
    organization: searchParams.organization,
    support_type: searchParams.support_type,
    search: searchParams.search,
  }

  const [cases, organizations, yearStats] = await Promise.all([
    getAllCases(filters),
    getOrganizations(),
    getYearStats(),
  ])

  const years = yearStats.map((y) => y.year).sort((a, b) => b - a)

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <>
      {/* Search + Filter panel */}
      <div
        className="mb-10 rounded-2xl border p-5 md:p-6"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="space-y-4">
          <SearchBar />
          <FilterBar organizations={organizations} years={years} />
        </div>
      </div>

      {cases.length === 0 ? (
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
            검색 결과가 없습니다
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            다른 검색어나 필터를 시도해 보세요
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl md:text-3xl font-bold tabular-nums"
                style={{ color: 'var(--color-gold)' }}
              >
                {cases.length}
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                건의 복원 사례
                {hasActiveFilters && ' (필터링됨)'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <RecordCard key={c.id} record={c} index={i} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default async function CasesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams

  return (
    <div className="pt-24 pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden mb-12">
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
            background:
              'linear-gradient(to bottom, transparent, var(--color-gold))',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            Restoration Cases
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-5 mb-5">
            <div
              className="hidden sm:block h-px w-10 md:w-16 opacity-40 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h1 className="text-4xl md:text-6xl font-bold whitespace-nowrap">
              복원 <span style={{ color: 'var(--color-gold)' }}>사례</span>
            </h1>
            <div
              className="hidden sm:block h-px w-10 md:w-16 opacity-40 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          </div>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            국가기록원의 기록물 복원 사업 현황을 탐색하세요.
            <br />
            검색과 필터로 원하는 사례를 빠르게 찾을 수 있습니다.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div
              className="text-center py-20"
              style={{ color: 'var(--color-text-muted)' }}
            >
              불러오는 중...
            </div>
          }
        >
          <CasesList searchParams={resolvedParams} />
        </Suspense>
      </div>
    </div>
  )
}
