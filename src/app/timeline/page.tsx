import type { Metadata } from 'next'
import { getAllCases } from '@/lib/queries'
import TimelineView from '@/components/TimelineView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '타임라인',
  description: '연도별 기록물 복원 사업 타임라인. 시간의 흐름에 따른 복원 현황을 확인하세요.',
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

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            복원 <span style={{ color: 'var(--color-gold)' }}>타임라인</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            연도별 기록물 복원 사업의 흐름을 한눈에 확인하세요.
          </p>
        </div>

        <TimelineView casesByYear={casesByYear} />
      </div>
    </div>
  )
}
