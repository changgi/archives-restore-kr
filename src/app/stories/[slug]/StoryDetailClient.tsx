'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ExternalLink, BookOpen, FileText } from 'lucide-react'
import type { FeaturedStory, OriginalDocument, DocumentPage } from '@/types'
import ScrollProgress from '@/components/ScrollProgress'
import ImageCompareSlider from '@/components/ImageCompareSlider'
import ItemGallery from '@/components/ItemGallery'
import VideoPlayer from '@/components/VideoPlayer'
import ExhibitionNav from '@/components/ExhibitionNav'
import ParallaxSection from '@/components/ParallaxSection'
import Breadcrumbs from '@/components/Breadcrumbs'
import ShareButton from '@/components/ShareButton'

interface StoryDetailClientProps {
  story: FeaturedStory
  prevStory: FeaturedStory | null
  nextStory: FeaturedStory | null
  originalDocuments?: (OriginalDocument & { document_pages: DocumentPage[] })[]
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.7 },
}

const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.7 },
}

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.8 },
}

export default function StoryDetailClient({ story, prevStory, nextStory, originalDocuments }: StoryDetailClientProps) {
  const hasOriginalDocs = originalDocuments && originalDocuments.length > 0

  const sections = [
    { id: 'hero', label: '전시 입구' },
    ...(story.before_image_url && story.after_image_url
      ? [{ id: 'compare', label: '복원 비교' }]
      : []),
    { id: 'intro', label: '소개' },
    ...(story.story_items?.length > 0 ? [{ id: 'gallery', label: '소장품' }] : []),
    ...(story.external_link || hasOriginalDocs ? [{ id: 'links', label: '원문 열람' }] : []),
    ...(story.video_url ? [{ id: 'video', label: '영상' }] : []),
    { id: 'nav', label: '다음 전시' },
  ]

  return (
    <>
      <ScrollProgress sections={sections} />

      {/* Section 1: Hero */}
      <ParallaxSection
        id="hero"
        imageUrl={story.before_image_url || undefined}
        className="min-h-screen flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Breadcrumbs
              items={[
                { label: '기획전시', href: '/stories' },
                { label: story.title },
              ]}
            />
            <ShareButton title={story.title} text={story.subtitle || undefined} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            {story.production_period && (
              <p className="text-sm tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--color-gold)' }}>
                {story.production_period}
              </p>
            )}

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
              {story.title}
            </h1>

            {story.subtitle && (
              <p className="text-xl md:text-2xl text-white/70 max-w-2xl">
                {story.subtitle}
              </p>
            )}

            {story.producing_org && (
              <p className="mt-6 text-sm text-white/50">
                {story.producing_org}
              </p>
            )}
          </motion.div>
        </div>
      </ParallaxSection>

      {/* Section 2: Before/After Compare */}
      {story.before_image_url && story.after_image_url && (
        <section id="compare" className="py-20 md:py-32" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeInLeft}>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                복원 <span style={{ color: 'var(--color-gold)' }}>전후 비교</span>
              </h2>
              <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                슬라이더를 움직여 복원 전후를 비교해 보세요
              </p>
            </motion.div>

            <motion.div {...fadeIn}>
              <ImageCompareSlider
                beforeSrc={story.before_image_url}
                afterSrc={story.after_image_url}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Section 3: Introduction */}
      <section
        id="intro"
        className="py-20 md:py-32"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div className="md:col-span-2" {...fadeInLeft}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                전시 <span style={{ color: 'var(--color-gold)' }}>소개</span>
              </h2>
              {story.description && (
                <p
                  className="text-base md:text-lg leading-relaxed whitespace-pre-line"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {story.description}
                </p>
              )}
            </motion.div>

            <motion.div {...fadeInUp}>
              <div
                className="rounded-xl border border-[var(--color-border)] p-6 space-y-4"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                {story.producing_org && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      생산기관
                    </p>
                    <p className="text-sm font-medium">{story.producing_org}</p>
                  </div>
                )}
                {story.production_period && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      시대
                    </p>
                    <p className="text-sm font-medium">{story.production_period}</p>
                  </div>
                )}
                {story.story_items && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      소장품
                    </p>
                    <p className="text-sm font-medium">{story.story_items.length}건</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Item Gallery */}
      {story.story_items && story.story_items.length > 0 && (
        <section id="gallery" className="py-20 md:py-32" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeInLeft} className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                소장품 <span style={{ color: 'var(--color-gold)' }}>갤러리</span>
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                각 소장품을 클릭하여 상세 정보를 확인하세요
              </p>
            </motion.div>

            <ItemGallery items={story.story_items} />
          </div>
        </section>
      )}

      {/* Section 5: External Link & Original Documents */}
      {(story.external_link || hasOriginalDocs) && (
        <section
          id="links"
          className="relative py-20 md:py-32 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          {/* Decorative background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Decorative frame */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 opacity-40"
            style={{
              background:
                'linear-gradient(to bottom, transparent, var(--color-gold))',
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeInUp} className="text-center mb-14">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                Original Archives
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div
                  className="h-px w-12 opacity-40"
                  style={{ backgroundColor: 'var(--color-gold)' }}
                />
                <h2 className="text-3xl md:text-4xl font-bold">
                  원문 <span style={{ color: 'var(--color-gold)' }}>자료</span>
                </h2>
                <div
                  className="h-px w-12 opacity-40"
                  style={{ backgroundColor: 'var(--color-gold)' }}
                />
              </div>
              <p
                className="text-sm md:text-base max-w-xl mx-auto"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                역사의 숨결이 담긴 원본 자료를 직접 확인해 보세요
              </p>
            </motion.div>

            {/* Document preview cards */}
            {hasOriginalDocs && (
              <motion.div
                {...fadeInUp}
                className="mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
              >
                {originalDocuments.slice(0, 3).map((doc) => {
                  const pageCount = doc.document_pages?.length || 0
                  const firstPage = doc.document_pages?.[0]
                  return (
                    <Link
                      key={doc.id}
                      href={`/stories/${story.slug}/documents`}
                      className="group relative rounded-xl border overflow-hidden transition-all duration-500 hover:-translate-y-1"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {/* Paper texture effect at top */}
                      <div
                        className="relative h-32 overflow-hidden"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(212,168,83,0.02))',
                        }}
                      >
                        {firstPage?.image_url ? (
                          <img
                            src={firstPage.image_url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                          />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:scale-110"
                            style={{
                              backgroundColor: 'rgba(212,168,83,0.15)',
                              border: '1px solid rgba(212,168,83,0.3)',
                            }}
                          >
                            <FileText
                              size={24}
                              style={{ color: 'var(--color-gold)' }}
                            />
                          </div>
                        </div>
                        {/* Page count badge */}
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm"
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'var(--color-gold)',
                            border: '1px solid rgba(212,168,83,0.3)',
                          }}
                        >
                          {pageCount} PAGES
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-sm font-bold line-clamp-2 mb-2 group-hover:text-[var(--color-gold)] transition-colors">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p
                            className="text-xs line-clamp-2 leading-relaxed"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {doc.description}
                          </p>
                        )}
                        <div
                          className="mt-3 pt-3 border-t flex items-center justify-between text-xs font-medium"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            원문 열람
                          </span>
                          <BookOpen
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                            style={{ color: 'var(--color-gold)' }}
                          />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </motion.div>
            )}

            {/* Main CTAs */}
            <motion.div
              {...fadeInUp}
              className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-2xl mx-auto"
            >
              {hasOriginalDocs && (
                <Link
                  href={`/stories/${story.slug}/documents`}
                  className="group relative flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
                  style={{ backgroundColor: 'var(--color-gold)' }}
                >
                  <BookOpen size={20} />
                  <span>원문 뷰어로 열람하기</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}

              {story.external_link && (
                <a
                  href={story.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                    hasOriginalDocs
                      ? 'border-2 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.2)]'
                      : 'text-black hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]'
                  }`}
                  style={
                    hasOriginalDocs
                      ? { borderColor: 'var(--color-gold)' }
                      : { backgroundColor: 'var(--color-gold)' }
                  }
                >
                  <ExternalLink size={18} />
                  <span>
                    {story.external_link_label || '원본 사이트에서 보기'}
                  </span>
                </a>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Section 6: Video */}
      {story.video_url && (
        <section id="video" className="py-20 md:py-32" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeInLeft} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                관련 <span style={{ color: 'var(--color-gold)' }}>영상</span>
              </h2>
            </motion.div>

            <motion.div {...fadeIn}>
              <VideoPlayer src={story.video_url} title={story.title} />
            </motion.div>
          </div>
        </section>
      )}

      {/* Section 7: Navigation */}
      <section
        id="nav"
        className="relative py-20 md:py-32 overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        {/* Decorative top line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 opacity-40"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--color-gold))',
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
              style={{ color: 'var(--color-gold)' }}
            >
              More Exhibitions
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div
                className="h-px w-12 opacity-40"
                style={{ backgroundColor: 'var(--color-gold)' }}
              />
              <h2 className="text-3xl md:text-4xl font-bold">
                다른 <span style={{ color: 'var(--color-gold)' }}>전시</span>
              </h2>
              <div
                className="h-px w-12 opacity-40"
                style={{ backgroundColor: 'var(--color-gold)' }}
              />
            </div>
            <p
              className="text-sm md:text-base max-w-xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              다른 기록유산 이야기도 함께 만나보세요
            </p>
          </motion.div>

          <ExhibitionNav prev={prevStory} next={nextStory} />

          <motion.div {...fadeInUp} className="mt-14 flex justify-center">
            <Link
              href="/stories"
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-bold border-2 transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.3)]"
              style={{
                borderColor: 'var(--color-gold)',
                color: 'var(--color-gold)',
              }}
            >
              <span className="tracking-wider">전시 목록 전체 보기</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: 'var(--color-gold)' }}
              />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
