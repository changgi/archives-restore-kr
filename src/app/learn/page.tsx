import type { Metadata } from 'next'
import { getRelatedVideos } from '@/lib/queries'
import LearnClient from './LearnClient'

export const metadata: Metadata = {
  title: '보존교육',
  description: '기록물 보존과 복원에 관한 교육 영상을 시청하세요.',
}

export default async function LearnPage() {
  const videos = await getRelatedVideos()

  return <LearnClient videos={videos} />
}
