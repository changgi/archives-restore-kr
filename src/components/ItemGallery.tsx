'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  X,
  ExternalLink,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ArrowUpRight,
} from 'lucide-react'
import type { StoryItem } from '@/types'

interface ItemGalleryProps {
  items: StoryItem[]
}

export default function ItemGallery({ items }: ItemGalleryProps) {
  const [selected, setSelected] = useState<StoryItem | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openItem = useCallback((item: StoryItem) => {
    setSelected(item)
    setGalleryIndex(0)
  }, [])

  const closeItem = useCallback(() => setSelected(null), [])

  const galleryImages =
    selected?.story_item_images
      ?.slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) || []

  const galleryPrev = useCallback(() => {
    setGalleryIndex((i) => (i > 0 ? i - 1 : galleryImages.length - 1))
  }, [galleryImages.length])

  const galleryNext = useCallback(() => {
    setGalleryIndex((i) => (i < galleryImages.length - 1 ? i + 1 : 0))
  }, [galleryImages.length])

  // Lock scroll + keyboard nav when modal is open
  useEffect(() => {
    if (!selected) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeItem()
      if (e.key === 'ArrowLeft' && galleryImages.length > 1) galleryPrev()
      if (e.key === 'ArrowRight' && galleryImages.length > 1) galleryNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
    }
  }, [selected, closeItem, galleryPrev, galleryNext, galleryImages.length])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const imageCount = item.story_item_images?.length ?? 0
          return (
            <div
              key={item.id}
              className="animate-fade-in h-full"
              style={{
                animationDelay: `${Math.min(i * 80, 320)}ms`,
                animationFillMode: 'both',
              }}
            >
              <button
                onClick={() => openItem(item)}
                className="group relative w-full h-full text-left flex flex-col rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(212,168,83,0.35)]"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-secondary)]">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon
                        size={36}
                        style={{ color: 'var(--color-text-muted)' }}
                      />
                    </div>
                  )}

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  {/* Corner accents */}
                  <div
                    className="absolute top-3 left-3 w-4 h-px opacity-60 group-hover:w-6 transition-all duration-500"
                    style={{ backgroundColor: 'var(--color-gold)' }}
                  />
                  <div
                    className="absolute top-3 left-3 w-px h-4 opacity-60 group-hover:h-6 transition-all duration-500"
                    style={{ backgroundColor: 'var(--color-gold)' }}
                  />

                  {/* Image count pill */}
                  {imageCount > 1 && (
                    <div
                      className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums backdrop-blur-md border"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderColor: 'rgba(212, 168, 83, 0.4)',
                        color: 'var(--color-gold)',
                      }}
                    >
                      <ImageIcon size={9} />
                      <span>{imageCount}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-5">
                  <h4 className="text-sm font-bold line-clamp-2 mb-3 leading-snug group-hover:text-[var(--color-gold)] transition-colors">
                    {item.title}
                  </h4>

                  <div
                    className="flex flex-wrap items-center gap-3 text-[11px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {item.year && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{item.year}</span>
                      </span>
                    )}
                    {item.repository && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <MapPin size={11} className="flex-shrink-0" />
                        <span className="truncate">{item.repository}</span>
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className="mt-auto pt-3 flex items-center justify-between border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase font-medium"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Click to Explore
                    </span>
                    <div
                      className="flex items-center gap-1 text-xs font-bold transition-all duration-300 group-hover:gap-2"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      <span>자세히</span>
                      <ArrowUpRight
                        size={12}
                        className="transition-transform duration-300 group-hover:rotate-45"
                      />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={closeItem}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeItem}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
              }}
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            {/* Image stage */}
            <div className="relative bg-black flex-shrink-0">
              {galleryImages.length > 0 ? (
                <>
                  <div className="aspect-video flex items-center justify-center overflow-hidden">
                    <img
                      src={galleryImages[galleryIndex]?.image_url}
                      alt={
                        galleryImages[galleryIndex]?.alt_text || selected.title
                      }
                      className="max-w-full max-h-full object-contain animate-fade-in"
                      key={galleryIndex}
                    />
                  </div>

                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={galleryPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                        }}
                        aria-label="이전 이미지"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={galleryNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                        }}
                        aria-label="다음 이미지"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border backdrop-blur-md text-xs font-mono tabular-nums"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.85)',
                        }}
                      >
                        {galleryIndex + 1} / {galleryImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : selected.thumbnail_url ? (
                <img
                  src={selected.thumbnail_url}
                  alt={selected.title}
                  className="w-full aspect-video object-contain"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <ImageIcon
                    size={48}
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-7">
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-3 font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                Story Item
              </p>
              <h3 className="text-xl md:text-2xl font-bold mb-4 leading-tight">
                {selected.title}
              </h3>

              <div
                className="flex flex-wrap items-center gap-4 mb-5 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {selected.year && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar
                      size={14}
                      style={{ color: 'var(--color-gold)' }}
                    />
                    <span>{selected.year}</span>
                  </span>
                )}
                {selected.repository && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin
                      size={14}
                      style={{ color: 'var(--color-gold)' }}
                    />
                    <span>{selected.repository}</span>
                  </span>
                )}
              </div>

              {selected.description && (
                <p
                  className="text-sm md:text-base leading-relaxed mb-5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {selected.description}
                </p>
              )}

              {/* Thumbnail strip */}
              {galleryImages.length > 1 && (
                <div
                  className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {galleryImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setGalleryIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === galleryIndex
                          ? 'ring-2 ring-[var(--color-gold)]/40'
                          : 'hover:border-white/30'
                      }`}
                      style={{
                        borderColor:
                          i === galleryIndex
                            ? 'var(--color-gold)'
                            : 'transparent',
                      }}
                    >
                      <img
                        src={img.image_url}
                        alt={img.alt_text || `${selected.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Action */}
              {selected.detail_link && (
                <a
                  href={selected.detail_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-black transition-all duration-300 hover:shadow-[0_10px_25px_-5px_rgba(212,168,83,0.5)]"
                  style={{ backgroundColor: 'var(--color-gold)' }}
                >
                  <ExternalLink size={14} />
                  <span>원문 보기</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
