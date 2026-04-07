'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { FeaturedStory } from '@/types'

interface ExhibitionNavProps {
  prev: FeaturedStory | null
  next: FeaturedStory | null
}

function MiniCard({ story, direction }: { story: FeaturedStory; direction: 'prev' | 'next' }) {
  const isPrev = direction === 'prev'

  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      {isPrev && (
        <ChevronLeft size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors flex-shrink-0" />
      )}

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {story.before_image_url && (
          <img
            src={story.before_image_url}
            alt={story.title}
            className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className={`min-w-0 ${isPrev ? 'text-left' : 'text-right'}`}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
            {isPrev ? '이전 전시' : '다음 전시'}
          </p>
          <p className="text-sm font-medium truncate group-hover:text-[var(--color-gold)] transition-colors">
            {story.title}
          </p>
        </div>
      </div>

      {!isPrev && (
        <ChevronRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors flex-shrink-0" />
      )}
    </Link>
  )
}

export default function ExhibitionNav({ prev, next }: ExhibitionNavProps) {
  if (!prev && !next) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div>{prev && <MiniCard story={prev} direction="prev" />}</div>
      <div>{next && <MiniCard story={next} direction="next" />}</div>
    </motion.div>
  )
}
