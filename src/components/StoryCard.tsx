'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { FeaturedStory } from '@/types'

interface StoryCardProps {
  story: FeaturedStory
  index: number
}

export default function StoryCard({ story, index }: StoryCardProps) {
  const [hovered, setHovered] = useState(false)

  const beforeImg = story.before_image_url
  const afterImg = story.after_image_url

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
    >
      <Link
        href={`/stories/${story.slug}`}
        className="group block relative overflow-hidden rounded-2xl"
        style={{ aspectRatio: '16/9' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Before image */}
        {beforeImg && (
          <img
            src={beforeImg}
            alt={`${story.title} 복원 전`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: hovered ? 0 : 1 }}
          />
        )}

        {/* After image */}
        {afterImg && (
          <img
            src={afterImg}
            alt={`${story.title} 복원 후`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: hovered ? 1 : 0 }}
          />
        )}

        {/* Fallback if no images */}
        {!beforeImg && !afterImg && (
          <div className="absolute inset-0 bg-[var(--color-bg-secondary)]" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          {story.production_period && (
            <span className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-gold)' }}>
              {story.production_period}
            </span>
          )}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-[var(--color-gold)] transition-colors">
            {story.title}
          </h3>
          {story.subtitle && (
            <p className="text-sm text-white/70 line-clamp-2">{story.subtitle}</p>
          )}

          {/* Hover indicator */}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/60 group-hover:text-[var(--color-gold)] transition-colors">
            <span>{hovered ? '복원 후' : '복원 전'}</span>
            <span className="inline-block w-4 h-px bg-current" />
            <span>전시 보기</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
