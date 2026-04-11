import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCaseById, getRelatedCases } from '@/lib/queries'
import ImageCompareSlider from '@/components/ImageCompareSlider'
import RecordCard from '@/components/RecordCard'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileStack,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react'

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

  const categoryLabel = record.category === 'paper' ? '종이류' : '시청각'

  return (
    <div className="pt-24 pb-24">
      {/* Back link bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link
          href="/cases"
          className="group inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-gold)]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          <span className="tracking-wide">복원 사례 목록</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero header */}
        <header className="mb-10 md:mb-14">
          {/* Category + year + support type tags */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase"
              style={{
                backgroundColor:
                  record.category === 'paper'
                    ? 'var(--color-gold)'
                    : 'var(--color-red)',
                color: '#000',
              }}
            >
              <Tag size={11} />
              {categoryLabel}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide border"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-card)',
              }}
            >
              <Layers size={11} />
              {record.support_type}
            </span>
            {record.support_year && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide border"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-card)',
                }}
              >
                <Calendar size={11} />
                {record.support_year}년 복원
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {record.title}
          </h1>

          {record.organizations?.name && (
            <p
              className="flex items-center gap-2 text-sm md:text-base"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Building2 size={16} style={{ color: 'var(--color-gold)' }} />
              {record.organizations.name}
            </p>
          )}
        </header>

        {/* Image Compare */}
        {beforeImage && afterImage && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
              <p
                className="text-xs tracking-[0.2em] uppercase font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                Before · After Comparison
              </p>
            </div>
            <div
              className="rounded-2xl overflow-hidden border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <ImageCompareSlider
                beforeSrc={beforeImage.image_url}
                afterSrc={afterImage.image_url}
                beforeAlt={beforeImage.alt_text || '복원 전'}
                afterAlt={afterImage.alt_text || '복원 후'}
              />
            </div>
            <p
              className="text-xs mt-3 text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              드래그하여 복원 전후를 비교해 보세요
            </p>
          </section>
        )}

        {/* If only one type of image */}
        {!(beforeImage && afterImage) && record.case_images?.length > 0 && (
          <section className="mb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.case_images.map((img) => (
                <div
                  key={img.id}
                  className="relative rounded-2xl overflow-hidden border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || record.title}
                    className="w-full h-auto object-contain"
                  />
                  <span
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm"
                    style={{
                      backgroundColor:
                        img.image_type === 'before'
                          ? 'rgba(197, 48, 48, 0.9)'
                          : 'rgba(212, 168, 83, 0.9)',
                      color: '#000',
                    }}
                  >
                    {img.image_type === 'before' ? '복원 전' : '복원 후'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Content grid: Metadata + Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Metadata sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div
              className="rounded-2xl border p-6 sticky top-24"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2
                className="text-xs tracking-[0.2em] uppercase font-medium mb-5 pb-4 border-b"
                style={{
                  color: 'var(--color-gold)',
                  borderColor: 'var(--color-border)',
                }}
              >
                상세 정보
              </h2>
              <dl className="space-y-5">
                <div>
                  <dt
                    className="flex items-center gap-2 text-[10px] tracking-wider uppercase mb-1.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Tag size={11} />
                    분류
                  </dt>
                  <dd className="text-sm font-semibold">
                    {categoryLabel}
                  </dd>
                </div>
                <div
                  className="h-px"
                  style={{ backgroundColor: 'var(--color-border)' }}
                />
                <div>
                  <dt
                    className="flex items-center gap-2 text-[10px] tracking-wider uppercase mb-1.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Layers size={11} />
                    지원 유형
                  </dt>
                  <dd className="text-sm font-semibold">
                    {record.support_type}
                  </dd>
                </div>
                {record.support_year && (
                  <>
                    <div
                      className="h-px"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    />
                    <div>
                      <dt
                        className="flex items-center gap-2 text-[10px] tracking-wider uppercase mb-1.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Calendar size={11} />
                        복원 연도
                      </dt>
                      <dd
                        className="text-xl font-bold"
                        style={{ color: 'var(--color-gold)' }}
                      >
                        {record.support_year}
                      </dd>
                    </div>
                  </>
                )}
                {record.quantity && (
                  <>
                    <div
                      className="h-px"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    />
                    <div>
                      <dt
                        className="flex items-center gap-2 text-[10px] tracking-wider uppercase mb-1.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <FileStack size={11} />
                        수량
                      </dt>
                      <dd className="text-sm font-semibold">
                        {record.quantity}
                      </dd>
                    </div>
                  </>
                )}
                {record.organizations?.name && (
                  <>
                    <div
                      className="h-px"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    />
                    <div>
                      <dt
                        className="flex items-center gap-2 text-[10px] tracking-wider uppercase mb-1.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Building2 size={11} />
                        요청 기관
                      </dt>
                      <dd className="text-sm font-semibold leading-relaxed">
                        {record.organizations.name}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </aside>

          {/* Description */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {record.description ? (
              <article>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: 'var(--color-gold)', opacity: 0.4 }}
                  />
                  <p
                    className="text-xs tracking-[0.2em] uppercase font-medium whitespace-nowrap"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    복원 이야기
                  </p>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: 'var(--color-gold)', opacity: 0.4 }}
                  />
                </div>
                <div
                  className="relative pl-6 py-2"
                  style={{
                    borderLeft: '2px solid var(--color-gold)',
                  }}
                >
                  <p
                    className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {record.description}
                  </p>
                </div>
              </article>
            ) : (
              <div
                className="rounded-2xl border p-8 text-center"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <p className="text-sm">이 사례에 대한 상세 설명이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related cases */}
        {relatedCases.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div
                className="h-px flex-1"
                style={{ backgroundColor: 'var(--color-gold)', opacity: 0.3 }}
              />
              <div className="text-center">
                <p
                  className="text-xs tracking-[0.3em] uppercase mb-1 font-medium"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Related Cases
                </p>
                <h2 className="text-2xl md:text-3xl font-bold">
                  관련 <span style={{ color: 'var(--color-gold)' }}>복원 사례</span>
                </h2>
              </div>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: 'var(--color-gold)', opacity: 0.3 }}
              />
            </div>
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
