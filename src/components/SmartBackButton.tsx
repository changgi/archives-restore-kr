'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface SmartBackButtonProps {
  /** Fallback href if there is no browser history to pop */
  fallbackHref: string
  /** Button label */
  label?: string
  className?: string
}

/**
 * Smart back button — uses router.back() when the user arrived via
 * an in-app navigation (history > 1), otherwise renders a real Link
 * to the fallback href so a direct-landing user still has a way out.
 */
export default function SmartBackButton({
  fallbackHref,
  label = '뒤로',
  className = '',
}: SmartBackButtonProps) {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // window.history.length > 1 is a strong hint that we came from
    // another in-app page. If length === 1 the user likely landed
    // directly (new tab, shared link, etc.), so back() would go
    // nowhere useful.
    setCanGoBack(window.history.length > 1)
  }, [])

  const baseClass = `group inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-gold)] ${className}`
  const style = { color: 'var(--color-text-secondary)' }
  const content = (
    <>
      <ArrowLeft
        size={16}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />
      <span className="tracking-wide">{label}</span>
    </>
  )

  if (canGoBack) {
    return (
      <button
        type="button"
        onClick={() => router.back()}
        className={baseClass}
        style={style}
        aria-label={label}
      >
        {content}
      </button>
    )
  }

  return (
    <Link href={fallbackHref} className={baseClass} style={style}>
      {content}
    </Link>
  )
}
