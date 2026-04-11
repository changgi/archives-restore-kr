import type { Metadata } from 'next'
import { getFeaturedStories } from '@/lib/queries'
import StoryCard from '@/components/StoryCard'
import PageHeader from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '기획전시',
  description: '국가기록원 소장 기록물의 복원 사례를 기획전시로 만나보세요.',
}

export default async function StoriesPage() {
  const stories = await getFeaturedStories()
  const totalItems = stories.reduce(
    (sum, s) => sum + (s.story_items?.length || 0),
    0,
  )

  return (
    <div className="pt-24 pb-24">
      <PageHeader slug="stories" />

      {/* Stories grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
