import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStoryBySlug, getOriginalDocuments } from '@/lib/queries'
import DocumentViewer from '@/components/DocumentViewer'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const story = await getStoryBySlug(slug)
  if (!story) return { title: '원문 자료를 찾을 수 없습니다' }

  return {
    title: `원문 열람 - ${story.title}`,
    description: `${story.title}의 원문 스캔 이미지를 직접 열람하세요.`,
  }
}

export default async function DocumentsPage({ params }: Props) {
  const { slug } = await params
  const story = await getStoryBySlug(slug)

  if (!story) notFound()

  const documents = await getOriginalDocuments(story.id)

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950">
      <DocumentViewer documents={documents} storyTitle={story.title} />
    </div>
  )
}
