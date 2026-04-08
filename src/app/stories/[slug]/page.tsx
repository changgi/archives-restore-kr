import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStoryBySlug, getFeaturedStories, getOriginalDocuments } from '@/lib/queries'
import StoryDetailClient from './StoryDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const story = await getStoryBySlug(slug)
  if (!story) return { title: '전시를 찾을 수 없습니다' }

  return {
    title: story.title,
    description: story.subtitle || story.description?.slice(0, 160) || '',
  }
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params
  const [story, allStories] = await Promise.all([
    getStoryBySlug(slug),
    getFeaturedStories(),
  ])

  if (!story) notFound()

  const [originalDocuments] = await Promise.all([
    getOriginalDocuments(story.id),
  ])

  const currentIndex = allStories.findIndex((s) => s.slug === slug)
  const prevStory = currentIndex > 0 ? allStories[currentIndex - 1] : null
  const nextStory = currentIndex < allStories.length - 1 ? allStories[currentIndex + 1] : null

  return (
    <StoryDetailClient
      story={story}
      prevStory={prevStory}
      nextStory={nextStory}
      originalDocuments={originalDocuments}
    />
  )
}
