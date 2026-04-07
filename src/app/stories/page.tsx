import type { Metadata } from 'next'
import { getFeaturedStories } from '@/lib/queries'
import StoryCard from '@/components/StoryCard'

export const metadata: Metadata = {
  title: '기획전시',
  description: '국가기록원 소장 기록물의 복원 사례를 기획전시로 만나보세요.',
}

export default async function StoriesPage() {
  const stories = await getFeaturedStories()

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <p
          className="text-sm tracking-[0.2em] uppercase mb-3"
          style={{ color: 'var(--color-gold)' }}
        >
          Featured Exhibitions
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          <span style={{ color: 'var(--color-gold)' }}>기획</span>전시
        </h1>
        <p className="text-base md:text-lg max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          소장 기록물의 복원 과정을 스토리텔링으로 체험하세요.
          각 전시를 클릭하면 상세한 복원 이야기를 확인할 수 있습니다.
        </p>
      </section>

      {/* Stories grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-lg">아직 등록된 기획전시가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  )
}
