import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getAllCases, getOrganizations, getYearStats } from '@/lib/queries'
import type { CaseFilters } from '@/types'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import RecordCard from '@/components/RecordCard'

export const metadata: Metadata = {
  title: '복원 사례',
  description: '국가기록원 기록물 복원 사례 목록. 종이류, 시청각 기록물의 복원 전후를 확인하세요.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

async function CasesList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
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

  return (
    <>
      <div className="space-y-4 mb-8">
        <SearchBar />
        <FilterBar organizations={organizations} years={years} />
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            검색 결과가 없습니다.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            다른 필터를 시도해 보세요.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            총 {cases.length}건
          </p>
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
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span style={{ color: 'var(--color-gold)' }}>복원</span> 사례
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            국가기록원의 기록물 복원 사업 현황을 탐색하세요.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>
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
