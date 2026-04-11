'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { FeaturedStory } from '@/types'

interface StoryCardProps {
  story: FeaturedStory
  index: number
}

export default function StoryCard({ story, index }: StoryCardProps) {
  const [hovered, setHovered] = useState(false)

  const beforeImg = story.before_image_url
  const afterImg = story.after_image_url
  const itemCount = story.story_items?.length || 0

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}
    >
      <Link
        href={`/stories/${story.slug}`}
        className="group block relative overflow-hidden rounded-3xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 transition-all duration-500"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image stage */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {/* Before image */}
          {beforeImg && (
            <Image
              src={beforeImg}
              alt={`${story.title} 복원 전`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-all duration-[900ms] ease-out"
              style={{
                opacity: hovered ? 0 : 1,
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          )}

          {/* After image */}
          {afterImg && (
            <Image
              src={afterImg}
              alt={`${story.title} 복원 후`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-all duration-[900ms] ease-out"
              style={{
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'scale(1.05)' : 'scale(1.1)',
              }}
            />
          )}

          {/* Fallback */}
          {!beforeImg && !afterImg && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 to-neutral-950" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

          {/* Exhibition number badge */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(212, 168, 83, 0.15)',
                border: '1px solid rgba(212, 168, 83, 0.4)',
                color: 'var(--color-gold)',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'var(--color-gold)',
                border: '1px solid rgba(212, 168, 83, 0.3)',
              }}
            >
              Exhibition
            </div>
          </div>

          {/* Top-right: before/after toggle indicator */}
          <div
            className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-md transition-all duration-500"
            style={{
              backgroundColor: hovered
                ? 'rgba(212, 168, 83, 0.9)'
                : 'rgba(0, 0, 0, 0.6)',
              color: hovered ? '#000' : '#fff',
              border: '1px solid rgba(212, 168, 83, 0.4)',
            }}
          >
            {hovered ? '복원 후' : '복원 전'}
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {story.production_period && (
              <div className="flex items-center gap-2 mb-3">
                <Sparkles
                  size={12}
                  style={{ color: 'var(--color-gold)' }}
                />
                <span
                  className="text-xs tracking-[0.2em] uppercase font-medium"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {story.production_period}
                </span>
              </div>
            )}
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-[var(--color-gold)] transition-colors duration-300">
              {story.title}
            </h3>
            {story.subtitle && (
              <p className="text-sm md:text-base text-white/75 line-clamp-2 leading-relaxed">
                {story.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 md:px-8 py-5 border-t"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-5 text-xs">
            {story.producing_org && (
              <div>
                <p
                  className="tracking-wider uppercase mb-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  소장
                </p>
                <p className="font-medium truncate max-w-[200px]">
                  {story.producing_org}
                </p>
              </div>
            )}
            {itemCount > 0 && (
              <div>
                <p
                  className="tracking-wider uppercase mb-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  소장품
                </p>
                <p className="font-medium">
                  {itemCount}점
                </p>
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2 text-sm font-bold transition-all duration-300 group-hover:gap-3"
            style={{ color: 'var(--color-gold)' }}
          >
            <span className="tracking-wide">전시 관람</span>
            <ArrowUpRight
              size={16}
              className="transition-transform duration-500 group-hover:rotate-45"
            />
          </div>
        </div>
      </Link>
    </div>
  )
}
