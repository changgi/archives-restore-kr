import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="경로"
      className={`flex items-center flex-wrap gap-1 text-xs ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-gold)]"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="홈"
      >
        <Home size={11} />
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <div key={idx} className="flex items-center gap-1">
            <ChevronRight
              size={11}
              className="opacity-50 flex-shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
            />
            {isLast || !item.href ? (
              <span
                className="px-2 py-1 rounded-md max-w-[240px] truncate font-medium"
                style={{
                  color: isLast
                    ? 'var(--color-gold)'
                    : 'var(--color-text-secondary)',
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="px-2 py-1 rounded-md transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-gold)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
