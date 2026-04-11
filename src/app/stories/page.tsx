import type { Metadata } from 'next'
import { getFeaturedStories } from '@/lib/queries'
import StoryCard from '@/components/StoryCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '기획전시',
  description: '국가기록원 소장 기록물의 복원 사례를 기획전시로 만나보세요.',
}

export default async function StoriesPage() {
  const stories = await getFeaturedStories()

  return (
    <div className="pt-24 pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden mb-16 md:mb-20">
        {/* Decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Vertical gold accent line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 opacity-40 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--color-gold))',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            Featured Exhibitions
          </p>
          <div className="flex items-center justify-center gap-5 mb-5">
            <div
              className="h-px w-16 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span style={{ color: 'var(--color-gold)' }}>기획</span>전시
            </h1>
            <div
              className="h-px w-16 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          </div>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            소장 기록물의 복원 과정을 스토리텔링으로 체험하세요.
            <br />
            각 전시를 클릭하면 상세한 복원 이야기를 확인할 수 있습니다.
          </p>

          {/* Stats */}
          {stories.length > 0 && (
            <div className="mt-10 inline-flex items-center gap-8 px-8 py-4 rounded-full border"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="text-center">
                <p
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {stories.length}
                </p>
                <p
                  className="text-[10px] tracking-[0.2em] uppercase mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Exhibitions
                </p>
              </div>
              <div
                className="h-10 w-px"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <div className="text-center">
                <p
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {stories.reduce((sum, s) => sum + (s.story_items?.length || 0), 0)}
                </p>
                <p
                  className="text-[10px] tracking-[0.2em] uppercase mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Items
                </p>
              </div>
              <div
                className="h-10 w-px"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <div className="text-center">
                <p
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--color-gold)' }}
                >
                  4
                </p>
                <p
                  className="text-[10px] tracking-[0.2em] uppercase mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Stories
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stories grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>

        {stories.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <p className="text-lg">아직 등록된 기획전시가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  )
}
