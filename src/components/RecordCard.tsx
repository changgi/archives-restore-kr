'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { RestorationCase } from '@/types'

interface RecordCardProps {
  record: RestorationCase
  index?: number
}

export default function RecordCard({ record, index = 0 }: RecordCardProps) {
  const beforeImage = record.case_images?.find((img) => img.image_type === 'before')
  const afterImage = record.case_images?.find((img) => img.image_type === 'after')
  const displayImage = afterImage || beforeImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/cases/${record.id}`}
        className="group block rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/30 transition-all duration-300"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-secondary)]">
          {displayImage ? (
            <img
              src={displayImage.image_url}
              alt={displayImage.alt_text || record.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
              이미지 없음
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge */}
          <span
            className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: record.category === 'paper' ? 'var(--color-gold)' : 'var(--color-red)',
              color: '#000',
            }}
          >
            {record.category === 'paper' ? '종이류' : '시청각'}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-[var(--color-text)] line-clamp-2 mb-2 group-hover:text-[var(--color-gold)] transition-colors">
            {record.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            {record.support_year && (
              <span>{record.support_year}년</span>
            )}
            {record.organizations?.name && (
              <>
                <span>|</span>
                <span className="truncate">{record.organizations.name}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
