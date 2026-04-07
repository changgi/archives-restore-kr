'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, MapPin, Calendar } from 'lucide-react'
import type { StoryItem } from '@/types'

interface ItemGalleryProps {
  items: StoryItem[]
}

export default function ItemGallery({ items }: ItemGalleryProps) {
  const [selected, setSelected] = useState<StoryItem | null>(null)

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
              onClick={() => setSelected(item)}
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

              {selected.thumbnail_url && (
                <img
                  src={selected.thumbnail_url}
                  alt={selected.title}
                  className="w-full aspect-video object-contain bg-black"
                />
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

                {/* Additional images */}
                {selected.story_item_images && selected.story_item_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {selected.story_item_images.map((img) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt={img.alt_text || selected.title}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
