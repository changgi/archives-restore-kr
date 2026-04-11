import type { Metadata } from 'next'
import { getAllCases } from '@/lib/queries'
import GalleryTabs from '@/components/GalleryTabs'
import type { CaseImage } from '@/types'
import PageHeader from '@/components/PageHeader'
import GalleryStatsPill from '@/components/GalleryStatsPill'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '갤러리',
  description:
    '기록물 복원 전후 이미지 갤러리. 복원의 과정과 결과를 시각적으로 확인하세요.',
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
    <div className="pt-24 pb-24">
      <PageHeader slug="gallery">
        {allImages.length > 0 && (
          <GalleryStatsPill
            total={allImages.length}
            before={beforeImages.length}
            after={afterImages.length}
          />
        )}
      </PageHeader>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryTabs
          allImages={allImages}
          beforeImages={beforeImages}
          afterImages={afterImages}
        />
      </section>
    </div>
  )
}
