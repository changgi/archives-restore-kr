import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCaseById, getRelatedCases } from '@/lib/queries'
import ImageCompareSlider from '@/components/ImageCompareSlider'
import RecordCard from '@/components/RecordCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const record = await getCaseById(id)
  if (!record) return { title: '사례를 찾을 수 없습니다' }
  return {
    title: record.title,
    description: record.description || `${record.title} - 기록물 복원 사례`,
  }
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params
  const record = await getCaseById(id)

  if (!record) {
    notFound()
  }

  const beforeImage = record.case_images?.find((img) => img.image_type === 'before')
  const afterImage = record.case_images?.find((img) => img.image_type === 'after')

  const relatedCases = await getRelatedCases(
    record.id,
    record.requesting_org_id,
    record.category
  )

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={16} />
          목록으로
        </Link>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{record.title}</h1>

        {/* Image Compare */}
        {beforeImage && afterImage && (
          <div className="mb-8">
            <ImageCompareSlider
              beforeSrc={beforeImage.image_url}
              afterSrc={afterImage.image_url}
              beforeAlt={beforeImage.alt_text || '복원 전'}
              afterAlt={afterImage.alt_text || '복원 후'}
            />
          </div>
        )}

        {/* If only one type of image */}
        {!(beforeImage && afterImage) && record.case_images?.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.case_images.map((img) => (
              <div key={img.id} className="relative rounded-xl overflow-hidden">
                <img
                  src={img.image_url}
                  alt={img.alt_text || record.title}
                  className="w-full h-auto object-contain rounded-xl"
                />
                <span
                  className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: img.image_type === 'before' ? 'var(--color-red)' : 'var(--color-gold)',
                    color: '#000',
                  }}
                >
                  {img.image_type === 'before' ? '복원 전' : '복원 후'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div
          className="rounded-xl border border-[var(--color-border)] p-6 mb-8"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-gold)' }}>
            상세 정보
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>유형</dt>
              <dd className="text-sm font-medium">
                {record.category === 'paper' ? '종이류' : '시청각'}
              </dd>
            </div>
            <div>
              <dt className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>지원 유형</dt>
              <dd className="text-sm font-medium">{record.support_type}</dd>
            </div>
            {record.support_year && (
              <div>
                <dt className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>지원 연도</dt>
                <dd className="text-sm font-medium">{record.support_year}년</dd>
              </div>
            )}
            {record.quantity && (
              <div>
                <dt className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>수량</dt>
                <dd className="text-sm font-medium">{record.quantity}</dd>
              </div>
            )}
            {record.organizations?.name && (
              <div>
                <dt className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>요청 기관</dt>
                <dd className="text-sm font-medium">{record.organizations.name}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Description */}
        {record.description && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>
              설명
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {record.description}
            </p>
          </div>
        )}

        {/* Related cases */}
        {relatedCases.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-gold)' }}>
              관련 사례
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCases.map((c, i) => (
                <RecordCard key={c.id} record={c} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
