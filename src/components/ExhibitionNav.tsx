'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import type { FeaturedStory } from '@/types'
import { useT } from '@/i18n/LanguageProvider'

interface ExhibitionNavProps {
  prev: FeaturedStory | null
  next: FeaturedStory | null
}

function ExhibitionCard({
  story,
  direction,
}: {
  story: FeaturedStory
  direction: 'prev' | 'next'
}) {
  const t = useT()
  const isPrev = direction === 'prev'
  const bgImage = story.after_image_url || story.before_image_url

  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/60 transition-all duration-500 h-64"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      {/* Background image with parallax zoom */}
      {bgImage && (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={bgImage}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
          <div
            className={`absolute inset-0 bg-gradient-to-${isPrev ? 'r' : 'l'} from-black/50 to-transparent`}
          />
        </div>
      )}

      {/* Direction arrow indicator */}
      <div
        className={`absolute top-5 ${
          isPrev ? 'left-5' : 'right-5'
        } w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500`}
        style={{
          backgroundColor: 'rgba(212, 168, 83, 0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212, 168, 83, 0.3)',
        }}
      >
        {isPrev ? (
          <ChevronLeft
            size={20}
            className="text-[var(--color-gold)] transition-transform duration-500 group-hover:-translate-x-0.5"
          />
        ) : (
          <ChevronRight
            size={20}
            className="text-[var(--color-gold)] transition-transform duration-500 group-hover:translate-x-0.5"
          />
        )}
      </div>

      {/* Label tag */}
      <div
        className={`absolute top-5 ${isPrev ? 'right-5' : 'left-5'}`}
      >
        <span
          className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'var(--color-gold)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212, 168, 83, 0.3)',
          }}
        >
          {isPrev ? t.card.previous : t.card.next}
        </span>
      </div>

      {/* Content at bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 ${
          isPrev ? 'text-left' : 'text-right'
        }`}
      >
        {story.production_period && (
          <p
            className="text-xs font-mono mb-2 opacity-70"
            style={{ color: 'var(--color-gold)' }}
          >
            {story.production_period}
          </p>
        )}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-[var(--color-gold)] transition-colors">
          {story.title}
        </h3>
        {story.subtitle && (
          <p className="text-xs text-white/70 line-clamp-1">
            {story.subtitle}
          </p>
        )}
        <div
          className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isPrev ? '' : 'flex-row-reverse'
          }`}
          style={{ color: 'var(--color-gold)' }}
        >
          <span>{t.card.viewExhibition}</span>
          <ArrowRight size={12} className={isPrev ? '' : 'rotate-180'} />
        </div>
      </div>
    </Link>
  )
}

export default function ExhibitionNav({ prev, next }: ExhibitionNavProps) {
  if (!prev && !next) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
      <div>{prev && <ExhibitionCard story={prev} direction="prev" />}</div>
      <div>{next && <ExhibitionCard story={next} direction="next" />}</div>
    </div>
  )
}
