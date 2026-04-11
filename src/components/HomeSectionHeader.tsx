'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

export type HomeSectionVariant =
  | 'featuredExhibitions'
  | 'recentCases'
  | 'conservationEducation'

interface HomeSectionHeaderProps {
  variant: HomeSectionVariant
  href?: string
  align?: 'between' | 'center'
}

export default function HomeSectionHeader({
  variant,
  href,
  align = 'between',
}: HomeSectionHeaderProps) {
  const t = useT()
  const s = t.sections

  const eyebrow = s[`${variant}Eyebrow` as const]
  const title = s[`${variant}Title` as const]
  const titleAccent = s[`${variant}Accent` as const]
  const subtitle = s[`${variant}Subtitle` as const]

  const accent = <span style={{ color: 'var(--color-gold)' }}>{titleAccent}</span>

  if (align === 'center') {
    return (
      <div className="text-center mb-10 md:mb-14">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {eyebrow}
        </p>
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
          <div
            className="hidden sm:block h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          <h2 className="text-2xl md:text-4xl font-bold">
            {title} {accent}
          </h2>
          <div
            className="hidden sm:block h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>
        {subtitle && (
          <p
            className="text-sm md:text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div>
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {eyebrow}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold">
          {title} {accent}
        </h2>
        {subtitle && (
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold whitespace-nowrap pb-1 transition-all hover:gap-2.5"
          style={{ color: 'var(--color-gold)' }}
        >
          {s.viewAll}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
