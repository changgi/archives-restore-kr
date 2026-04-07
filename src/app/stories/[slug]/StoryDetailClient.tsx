'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { FeaturedStory } from '@/types'
import ScrollProgress from '@/components/ScrollProgress'
import ImageCompareSlider from '@/components/ImageCompareSlider'
import ItemGallery from '@/components/ItemGallery'
import VideoPlayer from '@/components/VideoPlayer'
import ExhibitionNav from '@/components/ExhibitionNav'
import ParallaxSection from '@/components/ParallaxSection'

interface StoryDetailClientProps {
  story: FeaturedStory
  prevStory: FeaturedStory | null
  nextStory: FeaturedStory | null
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.7 },
}

const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.7 },
}

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.8 },
}

export default function StoryDetailClient({ story, prevStory, nextStory }: StoryDetailClientProps) {
  const sections = [
    { id: 'hero', label: '전시 입구' },
    ...(story.before_image_url && story.after_image_url
      ? [{ id: 'compare', label: '복원 비교' }]
      : []),
    { id: 'intro', label: '소개' },
    ...(story.story_items?.length > 0 ? [{ id: 'gallery', label: '소장품' }] : []),
    ...(story.external_link ? [{ id: 'links', label: '원문' }] : []),
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
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[var(--color-gold)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={16} />
            전시 목록으로
          </Link>

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

      {/* Section 5: External Link */}
      {story.external_link && (
        <section
          id="links"
          className="py-20 md:py-32"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                원문 <span style={{ color: 'var(--color-gold)' }}>자료</span>
              </h2>
              <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                원본 자료를 직접 확인해 보세요
              </p>
              <a
                href={story.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-black transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--color-gold)' }}
              >
                <ExternalLink size={18} />
                {story.external_link_label || '원문 보기'}
              </a>
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
        className="py-20 md:py-32"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              다른 <span style={{ color: 'var(--color-gold)' }}>전시</span>
            </h2>
          </motion.div>

          <ExhibitionNav prev={prevStory} next={nextStory} />

          <div className="mt-10 text-center">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border transition-all hover:scale-105"
              style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}
            >
              전시 목록으로
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
