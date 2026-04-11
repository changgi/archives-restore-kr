import type { Metadata } from 'next'
import { getAllCases } from '@/lib/queries'
import GalleryTabs from '@/components/GalleryTabs'
import type { CaseImage } from '@/types'
import { Images, Eye, EyeOff } from 'lucide-react'

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
      {/* Hero Header */}
      <section className="relative overflow-hidden mb-14">
        {/* Decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Vertical gold accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 opacity-40 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--color-gold))',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            Visual Archive
          </p>
          <div className="flex items-center justify-center gap-5 mb-5">
            <div
              className="h-px w-16 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span style={{ color: 'var(--color-gold)' }}>갤러리</span>
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
            복원 전후 이미지를 탐색하세요.
            <br />
            이미지를 클릭하면 풀스크린으로 감상할 수 있습니다.
          </p>

          {/* Stats */}
          {allImages.length > 0 && (
            <div
              className="mt-10 inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 px-6 md:px-10 py-5 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                  }}
                >
                  <Images size={18} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="text-left">
                  <p
                    className="text-xl md:text-2xl font-bold leading-none"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {allImages.length}점
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Total Images
                  </p>
                </div>
              </div>
              <div
                className="hidden sm:block h-10 w-px"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(197, 48, 48, 0.15)',
                  }}
                >
                  <EyeOff
                    size={18}
                    style={{ color: 'var(--color-red)' }}
                  />
                </div>
                <div className="text-left">
                  <p
                    className="text-xl md:text-2xl font-bold leading-none"
                    style={{ color: 'var(--color-red)' }}
                  >
                    {beforeImages.length}점
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Before
                  </p>
                </div>
              </div>
              <div
                className="hidden sm:block h-10 w-px"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                  }}
                >
                  <Eye size={18} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="text-left">
                  <p
                    className="text-xl md:text-2xl font-bold leading-none"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {afterImages.length}점
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    After
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gallery */}
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
