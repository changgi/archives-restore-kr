import type { Metadata } from 'next'
import { getAllCases } from '@/lib/queries'
import TimelineView from '@/components/TimelineView'
import { Clock, TrendingUp, Archive } from 'lucide-react'

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
      {/* Hero Header */}
      <section className="relative overflow-hidden mb-16">
        {/* Decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Vertical gold accent */}
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
            Restoration Timeline
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-5 mb-5">
            <div
              className="hidden sm:block h-px w-10 md:w-16 opacity-40 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h1 className="text-4xl md:text-6xl font-bold whitespace-nowrap">
              복원 <span style={{ color: 'var(--color-gold)' }}>타임라인</span>
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
            연도별 기록물 복원 사업의 흐름을 한눈에 확인하세요.
            <br />
            각 연도를 클릭하면 해당 시기의 복원 사례를 볼 수 있습니다.
          </p>

          {/* Stats pill */}
          {casesByYear.length > 0 && (
            <div
              className="mt-10 inline-flex flex-wrap items-center justify-center gap-6 md:gap-8 px-6 md:px-10 py-5 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                  }}
                >
                  <Clock size={18} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="text-left">
                  <p
                    className="text-xl md:text-2xl font-bold leading-none"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {yearRange.min} ~ {yearRange.max}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Year Range
                  </p>
                </div>
              </div>
              <div
                className="hidden md:block h-10 w-px"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                  }}
                >
                  <Archive size={18} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="text-left">
                  <p
                    className="text-xl md:text-2xl font-bold leading-none"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {totalCases}건
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Total Cases
                  </p>
                </div>
              </div>
              <div
                className="hidden md:block h-10 w-px"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                  }}
                >
                  <TrendingUp
                    size={18}
                    style={{ color: 'var(--color-gold)' }}
                  />
                </div>
                <div className="text-left">
                  <p
                    className="text-xl md:text-2xl font-bold leading-none"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {peakYear.year}년
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Peak ({peakYear.cases.length}건)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TimelineView casesByYear={casesByYear} />
      </section>
    </div>
  )
}
