import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getAllCases, getOrganizations, getYearStats } from '@/lib/queries'
import type { CaseFilters } from '@/types'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import RecordCard from '@/components/RecordCard'
import PageHeader from '@/components/PageHeader'
import { CasesCount, CasesEmpty } from '@/components/CasesListHelpers'

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
        <CasesEmpty />
      ) : (
        <>
          <CasesCount count={cases.length} filtered={hasActiveFilters} />
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
      <PageHeader slug="cases" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <CasesList searchParams={resolvedParams} />
        </Suspense>
      </div>
    </div>
  )
}
