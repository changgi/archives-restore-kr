'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, EyeOff, Eye } from 'lucide-react'
import type { CaseImage } from '@/types'

interface GalleryItem extends CaseImage {
  caseTitle?: string
}

interface GalleryGridProps {
  images: GalleryItem[]
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = useCallback(() => setSelectedIndex(null), [])

  const navigate = useCallback(
    (dir: 'prev' | 'next') => {
      setSelectedIndex((prev) => {
        if (prev === null) return prev
        if (dir === 'prev') {
          return prev > 0 ? prev - 1 : images.length - 1
        }
        return prev < images.length - 1 ? prev + 1 : 0
      })
    },
    [images.length],
  )

  useEffect(() => {
    if (selectedIndex === null) return
    // Lock body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate('prev')
      if (e.key === 'ArrowRight') navigate('next')
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
    }
  }, [selectedIndex, navigate, closeLightbox])

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div
        className="text-center py-24 rounded-2xl border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>
          표시할 이미지가 없습니다.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {images.map((img, idx) => {
          const isBefore = img.image_type === 'before'
          return (
            <div
              key={img.id}
              className="animate-fade-in break-inside-avoid cursor-pointer group"
              style={{
                animationDelay: `${Math.min((idx % 8) * 40, 320)}ms`,
                animationFillMode: 'both',
              }}
              onClick={() => openLightbox(idx)}
            >
              <div
                className="relative rounded-xl overflow-hidden border transition-all duration-500 group-hover:shadow-[0_16px_40px_-16px_rgba(212,168,83,0.35)]"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text || img.caseTitle || '복원 이미지'}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />

                {/* Top corner badge */}
                <div
                  className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase backdrop-blur-md border"
                  style={{
                    backgroundColor: isBefore
                      ? 'rgba(197, 48, 48, 0.9)'
                      : 'rgba(212, 168, 83, 0.9)',
                    borderColor: isBefore
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.2)',
                    color: '#000',
                  }}
                >
                  {isBefore ? <EyeOff size={10} /> : <Eye size={10} />}
                  <span>{isBefore ? 'Before' : 'After'}</span>
                </div>

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {img.caseTitle && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs text-white/95 font-medium line-clamp-2 leading-relaxed">
                        {img.caseTitle}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && images[selectedIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart === null) return
            const diff = e.changedTouches[0].clientX - touchStart
            if (Math.abs(diff) > 50) {
              navigate(diff > 0 ? 'prev' : 'next')
            }
            setTouchStart(null)
          }}
        >
          {/* Top bar */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--color-gold)',
              }}
            >
              {images[selectedIndex].image_type === 'before' ? (
                <>
                  <EyeOff size={12} /> <span>Before</span>
                </>
              ) : (
                <>
                  <Eye size={12} /> <span>After</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-mono tabular-nums px-3 py-1.5 rounded-full border backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                {selectedIndex + 1} / {images.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                }}
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Nav buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate('prev')
            }}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10 z-10"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
            }}
            aria-label="이전 이미지"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate('next')
            }}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors hover:bg-white/10 z-10"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
            }}
            aria-label="다음 이미지"
          >
            <ChevronRight size={22} />
          </button>

          {/* Image */}
          <img
            key={selectedIndex}
            src={images[selectedIndex].image_url}
            alt={images[selectedIndex].alt_text || ''}
            className="max-w-[92vw] max-h-[82vh] object-contain rounded-lg animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Caption */}
          {images[selectedIndex].caseTitle && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-xl text-center px-4 py-2.5 rounded-full border backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs md:text-sm text-white/90 line-clamp-1">
                {images[selectedIndex].caseTitle}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
