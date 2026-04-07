'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const closeLightbox = () => setSelectedIndex(null)

  const navigate = useCallback(
    (dir: 'prev' | 'next') => {
      if (selectedIndex === null) return
      if (dir === 'prev') {
        setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1)
      } else {
        setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0)
      }
    },
    [selectedIndex, images.length]
  )

  useEffect(() => {
    if (selectedIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate('prev')
      if (e.key === 'ArrowRight') navigate('next')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, navigate])

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null)

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {images.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: (idx % 4) * 0.05 }}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => openLightbox(idx)}
          >
            <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/30 transition-all">
              <img
                src={img.image_url}
                alt={img.alt_text || img.caseTitle || '복원 이미지'}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1"
                    style={{
                      backgroundColor: img.image_type === 'before' ? 'var(--color-red)' : 'var(--color-gold)',
                      color: '#000',
                    }}
                  >
                    {img.image_type === 'before' ? '복원 전' : '복원 후'}
                  </span>
                  {img.caseTitle && (
                    <p className="text-xs text-white line-clamp-1">{img.caseTitle}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && images[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
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
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
              aria-label="닫기"
            >
              <X size={28} />
            </button>

            {/* Nav buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); navigate('prev') }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"
              aria-label="이전 이미지"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('next') }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"
              aria-label="다음 이미지"
            >
              <ChevronRight size={32} />
            </button>

            {/* Image */}
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={images[selectedIndex].image_url}
              alt={images[selectedIndex].alt_text || ''}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Info bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/80 text-sm">
              <span className="mr-2">
                {images[selectedIndex].image_type === 'before' ? '복원 전' : '복원 후'}
              </span>
              <span>{selectedIndex + 1} / {images.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
