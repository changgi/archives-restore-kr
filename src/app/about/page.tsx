import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  Archive,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Heart,
  Database,
  Code2,
  Palette,
  Cloud,
  Zap,
  Shield,
} from 'lucide-react'
import {
  getStats,
  getFeaturedStories,
  getRelatedVideos,
} from '@/lib/queries'
import PageHeader from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '소개',
  description:
    '기록유산 복원 아카이브 프로젝트 소개. 국가기록원 데이터를 활용한 디지털 아카이브입니다.',
}

const features = [
  {
    icon: Sparkles,
    title: 'Before · After 비교',
    desc: '복원 전후를 드래그로 직접 비교할 수 있는 인터랙티브 슬라이더',
  },
  {
    icon: Layers,
    title: '스토리텔링 전시',
    desc: '소장품의 역사와 복원 과정을 4개 기획전시로 감상',
  },
  {
    icon: BookOpen,
    title: '원문 뷰어',
    desc: '원본 스캔 자료를 페이지별로 자세히 열람',
  },
  {
    icon: Archive,
    title: '타임라인 탐색',
    desc: '연도별로 정리된 복원 사례를 한눈에',
  },
]

const techStack = [
  { name: 'Next.js 15', desc: 'App Router · RSC', icon: Zap },
  { name: 'TypeScript', desc: 'Strict mode', icon: Code2 },
  { name: 'Tailwind CSS 4', desc: '유틸 스타일링', icon: Palette },
  { name: 'Supabase', desc: 'Postgres + RLS', icon: Database },
  { name: 'Framer Motion', desc: '스크롤 애니메이션', icon: Sparkles },
  { name: 'Vercel', desc: 'Edge 배포', icon: Cloud },
]

export default async function AboutPage() {
  const [stats, stories, videos] = await Promise.all([
    getStats(),
    getFeaturedStories(),
    getRelatedVideos(),
  ])

  const totalItems = stories.reduce(
    (sum, s) => sum + (s.story_items?.length || 0),
    0,
  )

  return (
    <div className="pt-24 pb-24">
      <PageHeader slug="about" />

      {/* STATS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Restoration Cases', value: stats.totalCases, suffix: '건' },
            {
              label: 'Organizations',
              value: stats.totalOrganizations,
              suffix: '곳',
            },
            {
              label: 'Featured Stories',
              value: stories.length,
              suffix: '건',
            },
            {
              label: 'Education Videos',
              value: videos.length,
              suffix: '편',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative rounded-2xl border p-6 md:p-8 transition-all duration-500 hover:border-[var(--color-gold)]/40"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-baseline gap-1 mb-3">
                <span
                  className="text-4xl md:text-5xl font-bold tabular-nums"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-lg md:text-xl font-medium"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {stat.suffix}
                </span>
              </div>
              <p
                className="text-[10px] tracking-[0.2em] uppercase font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Extra info row */}
        <div
          className="mt-6 flex items-center justify-center gap-3 text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Sparkles size={14} style={{ color: 'var(--color-gold)' }} />
          <span>
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
              {totalItems}
            </span>
            점의 기록물
          </span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28">
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            Key Features
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h2 className="text-3xl md:text-4xl font-bold">
              주요 <span style={{ color: 'var(--color-gold)' }}>기능</span>
            </h2>
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border p-6 md:p-8 transition-all duration-500 hover:border-[var(--color-gold)]/40"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 transition-all duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                    border: '1px solid rgba(212, 168, 83, 0.3)',
                  }}
                >
                  <Icon size={24} style={{ color: 'var(--color-gold)' }} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  {feature.title}
                </h3>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {feature.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* DATA SOURCE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28">
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            Data Source
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h2 className="text-3xl md:text-4xl font-bold">
              데이터 <span style={{ color: 'var(--color-gold)' }}>출처</span>
            </h2>
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          </div>
        </div>

        <div
          className="relative rounded-2xl border p-8 md:p-12 overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Decorative corner */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, var(--color-gold), transparent 70%)',
            }}
          />

          <div className="relative flex items-start gap-5 mb-8">
            <div
              className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(212, 168, 83, 0.12)',
                border: '1px solid rgba(212, 168, 83, 0.3)',
              }}
            >
              <Archive size={24} style={{ color: 'var(--color-gold)' }} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-1">
                국가기록원
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                National Archives of Korea · archives.go.kr
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: '대외 복원처리 지원사례', count: `${stats.totalCases}건` },
              {
                label: '참여 기관',
                count: `${stats.totalOrganizations}곳`,
              },
              {
                label: '소장기록물 기획전시',
                count: `${stories.length}건 · ${totalItems}점`,
              },
              {
                label: '보존 교육 영상',
                count: `${videos.length}편`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <a
            href="https://www.archives.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
            style={{ color: 'var(--color-gold)' }}
          >
            <ExternalLink size={14} />
            국가기록원 사이트 바로가기
          </a>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28">
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            Tech Stack
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h2 className="text-3xl md:text-4xl font-bold">
              기술 <span style={{ color: 'var(--color-gold)' }}>스택</span>
            </h2>
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((tech) => {
            const Icon = tech.icon
            return (
              <div
                key={tech.name}
                className="group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 hover:border-[var(--color-gold)]/40"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.1)',
                  }}
                >
                  <Icon size={18} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div>
                  <p className="text-sm font-bold">{tech.name}</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {tech.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div
          className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden border"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Decorative dots */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <Sparkles
              size={28}
              className="mx-auto mb-4"
              style={{ color: 'var(--color-gold)' }}
            />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              지금 바로 복원 사례를 탐험해 보세요
            </h2>
            <p
              className="text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {stats.yearRange.min}년부터 {stats.yearRange.max}년까지,{' '}
              {stats.totalCases}건의 복원 기록과{' '}
              {stories.length}개의 기획전시가 여러분을 기다리고 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/cases"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
                style={{ backgroundColor: 'var(--color-gold)' }}
              >
                <span>복원 사례 보기</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/stories"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[var(--color-gold)]/5"
                style={{
                  borderColor: 'var(--color-gold)',
                  color: 'var(--color-gold)',
                }}
              >
                <span>기획전시 관람</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NOTICE */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl border-l-4 p-6"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderLeftColor: 'var(--color-gold)',
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <Shield
              size={18}
              style={{ color: 'var(--color-gold)' }}
              className="flex-shrink-0 mt-0.5"
            />
            <h3 className="text-sm font-bold tracking-wide">저작권 및 유의사항</h3>
          </div>
          <p
            className="text-xs md:text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            본 사이트는 공공데이터를 활용한 비영리 아카이브 프로젝트로, 국가기록원과의 직접적인 관계는 없습니다.
            모든 기록물 이미지와 자료의 저작권은 국가기록원 및 원저작자에게 있으며,
            해당 자료는 교육 및 연구 목적의 참고용으로만 제공됩니다.
          </p>
        </div>
        <p
          className="mt-6 text-center text-xs flex items-center justify-center gap-1.5"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Heart size={11} style={{ color: 'var(--color-gold)' }} />
          Made with care for Korea&apos;s archival heritage
        </p>
      </section>
    </div>
  )
}
