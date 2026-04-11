import Link from 'next/link'
import Image from 'next/image'
import { Building2, Calendar, ArrowUpRight, FileImage, Film } from 'lucide-react'
import type { RestorationCase } from '@/types'

interface RecordCardProps {
  record: RestorationCase
  index?: number
}

export default function RecordCard({ record, index = 0 }: RecordCardProps) {
  const beforeImage = record.case_images?.find(
    (img) => img.image_type === 'before',
  )
  const afterImage = record.case_images?.find(
    (img) => img.image_type === 'after',
  )
  const displayImage = afterImage || beforeImage
  const isPaper = record.category === 'paper'
  const hasBoth = beforeImage && afterImage

  return (
    <div
      className="animate-fade-in h-full"
      style={{
        animationDelay: `${Math.min(index * 60, 300)}ms`,
        animationFillMode: 'both',
      }}
    >
      <Link
        href={`/cases/${record.id}`}
        className="group relative flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(212,168,83,0.35)]"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Image area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-secondary)]">
          {displayImage ? (
            <Image
              src={displayImage.image_url}
              alt={displayImage.alt_text || record.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
              unoptimized={false}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
              {isPaper ? <FileImage size={28} /> : <Film size={28} />}
              <span className="text-xs">이미지 없음</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Corner accents (top-left) */}
          <div
            className="absolute top-3 left-3 w-4 h-px opacity-60 group-hover:w-6 transition-all duration-500"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          <div
            className="absolute top-3 left-3 w-px h-4 opacity-60 group-hover:h-6 transition-all duration-500"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />

          {/* Category badge (top-left) */}
          <div className="absolute top-4 left-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.08em] uppercase backdrop-blur-md"
            style={{
              backgroundColor: isPaper
                ? 'rgba(212, 168, 83, 0.95)'
                : 'rgba(197, 48, 48, 0.95)',
              color: '#000',
            }}
          >
            {isPaper ? <FileImage size={10} /> : <Film size={10} />}
            <span>{isPaper ? 'Paper' : 'AV'}</span>
          </div>

          {/* Year badge (top-right) */}
          {record.support_year && (
            <div
              className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(212, 168, 83, 0.4)',
                color: 'var(--color-gold)',
              }}
            >
              <Calendar size={10} />
              <span>{record.support_year}</span>
            </div>
          )}

          {/* Before/After ribbon (bottom-left) */}
          {hasBoth && (
            <div
              className="absolute bottom-4 left-4 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-[0.1em] uppercase backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'var(--color-gold)',
              }}
            >
              <span>Before</span>
              <span className="opacity-50">·</span>
              <span>After</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5">
          <h3 className="font-bold text-base line-clamp-2 mb-3 leading-snug transition-colors group-hover:text-[var(--color-gold)]">
            {record.title}
          </h3>

          {record.organizations?.name && (
            <div
              className="flex items-center gap-1.5 text-xs mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Building2 size={12} className="flex-shrink-0" />
              <span className="truncate">{record.organizations.name}</span>
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-auto pt-3 flex items-center justify-between border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span
              className="text-[10px] tracking-[0.2em] uppercase font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {record.support_type || '복원 완료'}
            </span>
            <div
              className="flex items-center gap-1 text-xs font-bold transition-all duration-300 group-hover:gap-2"
              style={{ color: 'var(--color-gold)' }}
            >
              <span>자세히</span>
              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:rotate-45"
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
