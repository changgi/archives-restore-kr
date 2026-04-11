'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react'
import type { FeaturedStory } from '@/types'

interface HomeFeaturedProps {
  stories: FeaturedStory[]
}

export default function HomeFeatured({ stories }: HomeFeaturedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -420 : 420,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      {/* Scroll controls — top right, above the rail */}
      {stories.length > 1 && (
        <div className="hidden md:flex absolute -top-14 right-0 items-center gap-2 z-10">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: canScrollLeft
                ? 'rgba(212, 168, 83, 0.4)'
                : 'var(--color-border)',
              color: canScrollLeft
                ? 'var(--color-gold)'
                : 'var(--color-text-muted)',
            }}
            aria-label="이전 전시"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: canScrollRight
                ? 'rgba(212, 168, 83, 0.4)'
                : 'var(--color-border)',
              color: canScrollRight
                ? 'var(--color-gold)'
                : 'var(--color-text-muted)',
            }}
            aria-label="다음 전시"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {stories.map((story, idx) => {
          const isHovered = hoveredId === story.id
          return (
            <Link
              key={story.id}
              href={`/stories/${story.slug}`}
              className="group relative flex-shrink-0 w-[320px] md:w-[400px] rounded-2xl overflow-hidden border snap-start transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(212,168,83,0.35)] animate-fade-in"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                animationDelay: `${Math.min(idx * 100, 400)}ms`,
                animationFillMode: 'both',
              }}
              onMouseEnter={() => setHoveredId(story.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image stage with before/after crossfade */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-bg-secondary)]">
                {story.before_image_url && (
                  <Image
                    src={story.before_image_url}
                    alt={`${story.title} 복원 전`}
                    fill
                    sizes="(max-width: 768px) 320px, 400px"
                    className="object-cover transition-all duration-700"
                    style={{
                      opacity: isHovered ? 0 : 1,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      filter: 'grayscale(0.25)',
                    }}
                  />
                )}
                {story.after_image_url && (
                  <Image
                    src={story.after_image_url}
                    alt={`${story.title} 복원 후`}
                    fill
                    sizes="(max-width: 768px) 320px, 400px"
                    className="object-cover transition-all duration-700"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                )}
                {!story.before_image_url && !story.after_image_url && (
                  <div className="absolute inset-0 bg-[var(--color-bg-secondary)]" />
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                {/* Corner accents */}
                <div
                  className="absolute top-4 left-4 w-5 h-px opacity-60 group-hover:w-8 transition-all duration-500"
                  style={{ backgroundColor: 'var(--color-gold)' }}
                />
                <div
                  className="absolute top-4 left-4 w-px h-5 opacity-60 group-hover:h-8 transition-all duration-500"
                  style={{ backgroundColor: 'var(--color-gold)' }}
                />

                {/* Exhibition number */}
                <div
                  className="absolute top-5 left-9 text-[10px] tracking-[0.25em] uppercase font-medium"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Exhibition · {(idx + 1).toString().padStart(2, '0')}
                </div>

                {/* Before/After indicator (appears on hover) */}
                <div
                  className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.12em] uppercase backdrop-blur-md border transition-all duration-500"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderColor: 'rgba(212, 168, 83, 0.4)',
                    color: 'var(--color-gold)',
                  }}
                >
                  <span>{isHovered ? 'After' : 'Before'}</span>
                </div>

                {/* Bottom overlay: period + hover hint */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  {story.production_period && (
                    <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase font-medium text-white/90">
                      <Sparkles
                        size={10}
                        style={{ color: 'var(--color-gold)' }}
                      />
                      <span>{story.production_period}</span>
                    </div>
                  )}
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md transition-all duration-500"
                    style={{
                      backgroundColor: 'rgba(212, 168, 83, 0.9)',
                      color: '#000',
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered
                        ? 'translateY(0)'
                        : 'translateY(4px)',
                    }}
                  >
                    <span>관람하기</span>
                    <ArrowUpRight size={11} />
                  </div>
                </div>
              </div>

              {/* Card content */}
              <div className="p-5">
                <h3 className="font-bold text-lg line-clamp-1 mb-2 leading-snug transition-colors group-hover:text-[var(--color-gold)]">
                  {story.title}
                </h3>
                {story.subtitle && (
                  <p
                    className="text-sm line-clamp-2 leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {story.subtitle}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
