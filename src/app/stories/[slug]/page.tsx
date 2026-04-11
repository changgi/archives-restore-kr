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

  const description =
    story.subtitle ||
    story.description?.slice(0, 160) ||
    `${story.title} - 기획전시`

  const ogImageUrl = story.after_image_url || story.before_image_url

  return {
    title: story.title,
    description,
    openGraph: {
      title: story.title,
      description,
      type: 'article',
      locale: 'ko_KR',
      siteName: '기록유산 복원 아카이브',
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            alt: story.title,
          },
        ],
      }),
    },
    twitter: {
      card: ogImageUrl ? 'summary_large_image' : 'summary',
      title: story.title,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
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
