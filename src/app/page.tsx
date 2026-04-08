import HeroSection from '@/components/HeroSection'
import StatsCounter from '@/components/StatsCounter'
import RecordCard from '@/components/RecordCard'
import { getAllCases, getStats, getFeaturedStories, getRelatedVideos } from '@/lib/queries'
import Link from 'next/link'
import HomeFeatured from './HomeFeatured'
import { Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [cases, stats, stories, videos] = await Promise.all([
    getAllCases(),
    getStats(),
    getFeaturedStories(),
    getRelatedVideos(),
  ])
  const recentCases = cases.slice(0, 3)
  const previewVideos = videos.slice(0, 3)

  return (
    <>
      <HeroSection />

      <StatsCounter
        totalCases={stats.totalCases}
        totalOrgs={stats.totalOrganizations}
        yearRange={stats.yearRange}
      />

      {/* Featured Stories */}
      {stories.length > 0 && (
        <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-gold)' }}>기획</span>전시
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  소장 기록물의 복원 이야기를 체험하세요
                </p>
              </div>
              <Link
                href="/stories"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-gold)' }}
              >
                전체 보기 &rarr;
              </Link>
            </div>
            <HomeFeatured stories={stories} />
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/stories"
                className="inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                전체 보기 &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Education Videos */}
      {previewVideos.length > 0 && (
        <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-gold)' }}>보존</span> 교육
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  기록물 복원 과정을 영상으로 확인하세요
                </p>
              </div>
              <Link
                href="/learn"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-gold)' }}
              >
                전체 보기 &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewVideos.map((v) => (
                <Link
                  key={v.id}
                  href="/learn"
                  className="group rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    {v.thumbnail_url ? (
                      <img
                        src={v.thumbnail_url}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-bg)] flex items-center justify-center">
                        <Play size={32} className="text-[var(--color-gold)]/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
                      {v.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/learn"
                className="inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                전체 보기 &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

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
