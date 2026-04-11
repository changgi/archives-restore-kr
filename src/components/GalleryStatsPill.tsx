'use client'

import { Images, Eye, EyeOff } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

interface GalleryStatsPillProps {
  total: number
  before: number
  after: number
}

export default function GalleryStatsPill({
  total,
  before,
  after,
}: GalleryStatsPillProps) {
  const t = useT()
  return (
    <div
      className="mt-10 inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 px-6 md:px-10 py-5 rounded-2xl border"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.12)' }}
        >
          <Images size={18} style={{ color: 'var(--color-gold)' }} />
        </div>
        <div className="text-left">
          <p
            className="text-xl md:text-2xl font-bold leading-none tabular-nums"
            style={{ color: 'var(--color-gold)' }}
          >
            {total}
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.gallery.totalImages}
          </p>
        </div>
      </div>
      <div
        className="hidden sm:block h-10 w-px"
        style={{ backgroundColor: 'var(--color-border)' }}
      />
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(197, 48, 48, 0.15)' }}
        >
          <EyeOff size={18} style={{ color: 'var(--color-red)' }} />
        </div>
        <div className="text-left">
          <p
            className="text-xl md:text-2xl font-bold leading-none tabular-nums"
            style={{ color: 'var(--color-red)' }}
          >
            {before}
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.gallery.before}
          </p>
        </div>
      </div>
      <div
        className="hidden sm:block h-10 w-px"
        style={{ backgroundColor: 'var(--color-border)' }}
      />
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.12)' }}
        >
          <Eye size={18} style={{ color: 'var(--color-gold)' }} />
        </div>
        <div className="text-left">
          <p
            className="text-xl md:text-2xl font-bold leading-none tabular-nums"
            style={{ color: 'var(--color-gold)' }}
          >
            {after}
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.gallery.after}
          </p>
        </div>
      </div>
    </div>
  )
}
