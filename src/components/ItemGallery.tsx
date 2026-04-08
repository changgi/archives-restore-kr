'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, MapPin, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
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

  const galleryImages = selected?.story_item_images
    ?.slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) || []

  const galleryPrev = useCallback(() => {
    setGalleryIndex(i => Math.max(0, i - 1))
  }, [])

  const galleryNext = useCallback(() => {
    setGalleryIndex(i => Math.min(galleryImages.length - 1, i + 1))
  }, [galleryImages.length])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <button
              onClick={() => openItem(item)}
              className="w-full text-left group rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              {item.thumbnail_url ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-[var(--color-bg-secondary)] flex items-center justify-center">
                  <span className="text-4xl opacity-20">&#128196;</span>
                </div>
              )}

              <div className="p-4">
                <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
                  {item.title}
                </h4>
                <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {item.year && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {item.year}
                    </span>
                  )}
                  {item.repository && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {item.repository}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Detail overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-[var(--color-border)]"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <X size={24} />
              </button>

              {/* Image Gallery or Thumbnail */}
              {galleryImages.length > 0 ? (
                <div className="relative bg-black">
                  <div className="aspect-video flex items-center justify-center overflow-hidden">
                    <img
                      src={galleryImages[galleryIndex]?.image_url}
                      alt={galleryImages[galleryIndex]?.alt_text || selected.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Gallery navigation */}
                  {galleryImages.length > 1 && (
                    <>
                      {galleryIndex > 0 && (
                        <button
                          onClick={galleryPrev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 transition-colors"
                        >
                          <ChevronLeft size={20} className="text-white" />
                        </button>
                      )}
                      {galleryIndex < galleryImages.length - 1 && (
                        <button
                          onClick={galleryNext}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 transition-colors"
                        >
                          <ChevronRight size={20} className="text-white" />
                        </button>
                      )}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/10">
                        <span className="text-xs text-white/80">
                          {galleryIndex + 1} / {galleryImages.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : selected.thumbnail_url ? (
                <img
                  src={selected.thumbnail_url}
                  alt={selected.title}
                  className="w-full aspect-video object-contain bg-black"
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <ImageIcon size={48} className="text-white/10" />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-bold mb-3">{selected.title}</h3>

                <div className="flex flex-wrap gap-4 mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {selected.year && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} style={{ color: 'var(--color-gold)' }} />
                      {selected.year}
                    </span>
                  )}
                  {selected.repository && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} style={{ color: 'var(--color-gold)' }} />
                      {selected.repository}
                    </span>
                  )}
                </div>

                {selected.description && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {selected.description}
                  </p>
                )}

                {/* Gallery thumbnails strip */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {galleryImages.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setGalleryIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          i === galleryIndex
                            ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/50'
                            : 'border-transparent hover:border-white/30'
                        }`}
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

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  {selected.detail_link && (
                    <a
                      href={selected.detail_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--color-gold)' }}
                    >
                      <ExternalLink size={14} />
                      원문 보기
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
