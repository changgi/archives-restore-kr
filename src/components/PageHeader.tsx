'use client'

import type { ReactNode } from 'react'
import { useT } from '@/i18n/LanguageProvider'

export type PageSlug =
  | 'cases'
  | 'stories'
  | 'learn'
  | 'timeline'
  | 'gallery'
  | 'about'

interface PageHeaderProps {
  slug: PageSlug
  /** Optional content to render below the subtitle (e.g. stats pill) */
  children?: ReactNode
}

/**
 * Shared museum-style page header. Reads its eyebrow/title/subtitle
 * from translations based on the page slug, so every page header is
 * automatically translated in all 13 supported languages.
 */
export default function PageHeader({ slug, children }: PageHeaderProps) {
  const t = useT()
  const h = t.pageHeaders

  // Map each slug to its strings. About has a different shape than the others.
  const parts: {
    eyebrow: string
    titleBold: string
    titleAccent: string
    sub1: string
    sub2: string
    aboutBefore: string
    aboutAfter: string
  } = (() => {
    switch (slug) {
      case 'cases':
        return {
          eyebrow: h.casesEyebrow,
          titleBold: h.casesTitle,
          titleAccent: h.casesAccent,
          sub1: h.casesSubtitle1,
          sub2: h.casesSubtitle2,
          aboutBefore: '',
          aboutAfter: '',
        }
      case 'stories':
        return {
          eyebrow: h.storiesEyebrow,
          titleBold: h.storiesTitle,
          titleAccent: h.storiesAccent,
          sub1: h.storiesSubtitle1,
          sub2: h.storiesSubtitle2,
          aboutBefore: '',
          aboutAfter: '',
        }
      case 'learn':
        return {
          eyebrow: h.learnEyebrow,
          titleBold: h.learnTitle,
          titleAccent: h.learnAccent,
          sub1: h.learnSubtitle1,
          sub2: h.learnSubtitle2,
          aboutBefore: '',
          aboutAfter: '',
        }
      case 'timeline':
        return {
          eyebrow: h.timelineEyebrow,
          titleBold: h.timelineTitle,
          titleAccent: h.timelineAccent,
          sub1: h.timelineSubtitle1,
          sub2: h.timelineSubtitle2,
          aboutBefore: '',
          aboutAfter: '',
        }
      case 'gallery':
        return {
          eyebrow: h.galleryEyebrow,
          titleBold: h.galleryTitle,
          titleAccent: h.galleryAccent,
          sub1: h.gallerySubtitle1,
          sub2: h.gallerySubtitle2,
          aboutBefore: '',
          aboutAfter: '',
        }
      case 'about':
        return {
          eyebrow: h.aboutEyebrow,
          titleBold: '',
          titleAccent: h.aboutTitleAccent,
          sub1: '',
          sub2: '',
          aboutBefore: h.aboutTitleBefore,
          aboutAfter: h.aboutTitleAfter,
        }
    }
  })()

  const { eyebrow, titleBold, titleAccent, sub1, sub2, aboutBefore, aboutAfter } =
    parts

  return (
    <section className="relative overflow-hidden mb-12">
      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Vertical gold accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-gold))',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 text-center">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {eyebrow}
        </p>
        <div className="flex items-center justify-center gap-3 md:gap-5 mb-5">
          <div
            className="hidden sm:block h-px w-10 md:w-16 opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          {slug === 'about' ? (
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
              {aboutBefore}
              <span style={{ color: 'var(--color-gold)' }}>{titleAccent}</span>
              {aboutAfter}
            </h1>
          ) : (
            <h1 className="text-4xl md:text-6xl font-bold whitespace-nowrap">
              {titleBold && (
                <>
                  {titleBold}
                  {titleBold ? ' ' : ''}
                </>
              )}
              <span style={{ color: 'var(--color-gold)' }}>{titleAccent}</span>
            </h1>
          )}
          <div
            className="hidden sm:block h-px w-10 md:w-16 opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>
        {(sub1 || sub2) && (
          <p
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {sub1}
            {sub1 && sub2 && <br />}
            {sub2}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
