import HeroSection from '@/components/HeroSection'
import StatsCounter from '@/components/StatsCounter'
import RecordCard from '@/components/RecordCard'
import { getAllCases, getStats } from '@/lib/queries'
import Link from 'next/link'

export default async function HomePage() {
  const [cases, stats] = await Promise.all([getAllCases(), getStats()])
  const recentCases = cases.slice(0, 3)

  return (
    <>
      <HeroSection />

      <StatsCounter
        totalCases={stats.totalCases}
        totalOrgs={stats.totalOrganizations}
        yearRange={stats.yearRange}
      />

      {/* Recent cases section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                최근 <span style={{ color: 'var(--color-gold)' }}>복원 사례</span>
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                국가기록원의 최신 기록물 복원 현황
              </p>
            </div>
            <Link
              href="/cases"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
              style={{ color: 'var(--color-gold)' }}
            >
              전체 보기 &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCases.map((c, i) => (
              <RecordCard key={c.id} record={c} index={i} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/cases"
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-gold)' }}
            >
              전체 보기 &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            기록의 복원, 함께 확인하세요
          </h2>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            {stats.yearRange.min}년부터 {stats.yearRange.max}년까지, {stats.totalCases}건의 복원 기록을 탐색해 보세요.
          </p>
          <Link
            href="/cases"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-medium text-black transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            전체 사례 보기
          </Link>
        </div>
      </section>
    </>
  )
}
