'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

interface HomeMobileSeeAllProps {
  href: string
}

export function HomeMobileSeeAll({ href }: HomeMobileSeeAllProps) {
  const t = useT()
  return (
    <div className="mt-8 text-center sm:hidden">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-bold"
        style={{ color: 'var(--color-gold)' }}
      >
        {t.sections.viewAll}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}

export default HomeMobileSeeAll
