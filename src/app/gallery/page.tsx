import type { Metadata } from 'next'
import { getAllCases } from '@/lib/queries'
import GalleryGrid from '@/components/GalleryGrid'
import GalleryTabs from '@/components/GalleryTabs'
import type { CaseImage } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '갤러리',
  description: '기록물 복원 전후 이미지 갤러리. 복원의 과정과 결과를 시각적으로 확인하세요.',
}

interface GalleryItem extends CaseImage {
  caseTitle?: string
}

export default async function GalleryPage() {
  const cases = await getAllCases()

  const allImages: GalleryItem[] = []
  const beforeImages: GalleryItem[] = []
  const afterImages: GalleryItem[] = []

  cases.forEach((c) => {
    c.case_images?.forEach((img) => {
      const item: GalleryItem = { ...img, caseTitle: c.title }
      allImages.push(item)
      if (img.image_type === 'before') beforeImages.push(item)
      if (img.image_type === 'after') afterImages.push(item)
    })
  })

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span style={{ color: 'var(--color-gold)' }}>갤러리</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            복원 전후 이미지를 탐색하세요.
          </p>
        </div>

        <GalleryTabs
          allImages={allImages}
          beforeImages={beforeImages}
          afterImages={afterImages}
        />
      </div>
    </div>
  )
}
