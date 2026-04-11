import HeroSection from '@/components/HeroSection'
import StatsCounter from '@/components/StatsCounter'
import RecordCard from '@/components/RecordCard'
import { getAllCases, getStats, getFeaturedStories, getRelatedVideos } from '@/lib/queries'
import Link from 'next/link'
import HomeFeatured from './HomeFeatured'
import { Play, ArrowRight, Sparkles, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Reusable section header
function SectionHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  href,
  align = 'between',
}: {
  eyebrow: string
  title: string
  titleAccent: string
  subtitle?: string
  href?: string
  align?: 'between' | 'center'
}) {
  const accent = <span style={{ color: 'var(--color-gold)' }}>{titleAccent}</span>

  if (align === 'center') {
    return (
      <div className="text-center mb-10 md:mb-14">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {eyebrow}
        </p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div
            className="h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          <h2 className="text-2xl md:text-4xl font-bold">
            {title} {accent}
          </h2>
          <div
            className="h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>
        {subtitle && (
          <p
            className="text-sm md:text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div>
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {eyebrow}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold">
          {title} {accent}
        </h2>
        {subtitle && (
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold whitespace-nowrap pb-1 transition-all hover:gap-2.5"
          style={{ color: 'var(--color-gold)' }}
        >
          전체 보기
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

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
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          {/* Decorative dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Featured Exhibitions"
              title="기획"
              titleAccent="전시"
              subtitle="소장 기록물의 복원 이야기를 스토리텔링으로 체험하세요"
              href="/stories"
            />
            <HomeFeatured stories={stories} />
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/stories"
                className="inline-flex items-center gap-1.5 text-sm font-bold"
                style={{ color: 'var(--color-gold)' }}
              >
                전체 보기
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent cases section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Recent Cases"
            title="최근"
            titleAccent="복원 사례"
            subtitle="국가기록원의 최신 기록물 복원 현황"
            href="/cases"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCases.map((c, i) => (
              <RecordCard key={c.id} record={c} index={i} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/cases"
              className="inline-flex items-center gap-1.5 text-sm font-bold"
              style={{ color: 'var(--color-gold)' }}
            >
              전체 보기
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Education Videos */}
      {previewVideos.length > 0 && (
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Conservation Education"
              title="보존"
              titleAccent="교육"
              subtitle="기록물 복원 과정을 전문가의 영상으로 확인하세요"
              href="/learn"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewVideos.map((v) => (
                <Link
                  key={v.id}
                  href="/learn"
                  className="group rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all duration-500"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    {v.thumbnail_url ? (
                      <img
                        src={v.thumbnail_url}
                        alt={v.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-bg)] flex items-center justify-center">
                        <Play size={32} className="text-[var(--color-gold)]/50" />
                      </div>
                    )}
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2 backdrop-blur-sm"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          borderColor: 'var(--color-gold)',
                        }}
                      >
                        <Play
                          size={22}
                          className="ml-0.5"
                          style={{ color: 'var(--color-gold)' }}
                          fill="currentColor"
                        />
                      </div>
                    </div>
                    {/* Duration badge */}
                    {v.duration_seconds && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-sm flex items-center gap-1">
                        <Clock size={10} className="text-white/80" />
                        <span className="text-[10px] text-white font-medium">
                          {Math.floor(v.duration_seconds / 60)}:
                          {(v.duration_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
                      {v.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-sm font-bold"
                style={{ color: 'var(--color-gold)' }}
              >
                전체 보기
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Vertical gold accent line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 opacity-40 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--color-gold))',
          }}
        />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Sparkles
            size={24}
            className="mx-auto mb-5"
            style={{ color: 'var(--color-gold)' }}
          />
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            Begin Your Journey
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
            기록의 복원,
            <br />
            함께 <span style={{ color: 'var(--color-gold)' }}>확인</span>
            하세요
          </h2>
          <p
            className="mb-10 text-sm md:text-base leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span
              className="font-bold"
              style={{ color: 'var(--color-gold)' }}
            >
              {stats.yearRange.min}
            </span>
            년부터{' '}
            <span
              className="font-bold"
              style={{ color: 'var(--color-gold)' }}
            >
              {stats.yearRange.max}
            </span>
            년까지,{' '}
            <span
              className="font-bold"
              style={{ color: 'var(--color-gold)' }}
            >
              {stats.totalCases}건
            </span>
            의 복원 기록을 탐색해 보세요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/cases"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
              style={{ backgroundColor: 'var(--color-gold)' }}
            >
              <span>전체 사례 보기</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[var(--color-gold)]/5"
              style={{
                borderColor: 'var(--color-gold)',
                color: 'var(--color-gold)',
              }}
            >
              <span>프로젝트 소개</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
