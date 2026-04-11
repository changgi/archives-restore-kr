import type { Metadata } from 'next'
import { getAllCases } from '@/lib/queries'
import TimelineView from '@/components/TimelineView'
import PageHeader from '@/components/PageHeader'
import TimelineStatsPill from '@/components/TimelineStatsPill'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '타임라인',
  description:
    '연도별 기록물 복원 사업 타임라인. 시간의 흐름에 따른 복원 현황을 확인하세요.',
}

export default async function TimelinePage() {
  const cases = await getAllCases()

  // Group by year
  const yearMap = new Map<number, typeof cases>()
  cases.forEach((c) => {
    const year = c.support_year || 0
    if (year === 0) return
    if (!yearMap.has(year)) yearMap.set(year, [])
    yearMap.get(year)!.push(c)
  })

  const casesByYear = Array.from(yearMap.entries())
    .map(([year, yearCases]) => ({ year, cases: yearCases }))
    .sort((a, b) => a.year - b.year)

  const yearRange =
    casesByYear.length > 0
      ? {
          min: casesByYear[0].year,
          max: casesByYear[casesByYear.length - 1].year,
        }
      : { min: 0, max: 0 }

  const peakYear = casesByYear.reduce(
    (peak, curr) => (curr.cases.length > peak.cases.length ? curr : peak),
    casesByYear[0] || { year: 0, cases: [] },
  )

  const totalCases = cases.filter((c) => c.support_year).length

  return (
    <div className="pt-24 pb-24">
      <PageHeader slug="timeline">
        {casesByYear.length > 0 && (
          <TimelineStatsPill
            minYear={yearRange.min}
            maxYear={yearRange.max}
            totalCases={totalCases}
            peakYear={peakYear.year}
            peakCount={peakYear.cases.length}
          />
        )}
      </PageHeader>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TimelineView casesByYear={casesByYear} />
      </section>
    </div>
  )
}
