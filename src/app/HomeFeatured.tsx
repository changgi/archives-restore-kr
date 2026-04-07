'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { FeaturedStory } from '@/types'

interface HomeFeaturedProps {
  stories: FeaturedStory[]
}

export default function HomeFeatured({ stories }: HomeFeaturedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div
      ref={scrollRef}
      className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/stories/${story.slug}`}
          className="group flex-shrink-0 w-[320px] md:w-[400px] rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all snap-start"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
          onMouseEnter={() => setHoveredId(story.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            {story.before_image_url && (
              <img
                src={story.before_image_url}
                alt={`${story.title} 복원 전`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: hoveredId === story.id ? 0 : 1 }}
              />
            )}
            {story.after_image_url && (
              <img
                src={story.after_image_url}
                alt={`${story.title} 복원 후`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: hoveredId === story.id ? 1 : 0 }}
              />
            )}
            {!story.before_image_url && !story.after_image_url && (
              <div className="absolute inset-0 bg-[var(--color-bg-secondary)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="p-4">
            {story.production_period && (
              <p className="text-xs mb-1" style={{ color: 'var(--color-gold)' }}>
                {story.production_period}
              </p>
            )}
            <h3 className="font-bold group-hover:text-[var(--color-gold)] transition-colors line-clamp-1">
              {story.title}
            </h3>
            {story.subtitle && (
              <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>
                {story.subtitle}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
