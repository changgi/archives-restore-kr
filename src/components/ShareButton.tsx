'use client'

import { useState, useEffect, useRef } from 'react'
import { Share2, Link as LinkIcon, Check, X, Send } from 'lucide-react'

// Lucide-react removed brand marks; inline SVG replacements
function XMarkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function FacebookMarkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22C18.34 21.21 22 17.06 22 12.06Z" />
    </svg>
  )
}

interface ShareButtonProps {
  title: string
  text?: string
  className?: string
}

export default function ShareButton({ title, text, className = '' }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)

  // Read the URL once after mount. Wrapped in rAF so the state
  // update happens on the next frame instead of synchronously
  // during the effect body (which the React 19 lint rule rejects).
  useEffect(() => {
    const id = requestAnimationFrame(() => setUrl(window.location.href))
    return () => cancelAnimationFrame(id)
  }, [])

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback: select input
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      } catch {
        /* ignore */
      }
      document.body.removeChild(input)
    }
  }

  const tryNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text, url })
        return true
      } catch {
        return false
      }
    }
    return false
  }

  const handleMainClick = async () => {
    const native = await tryNativeShare()
    if (!native) setOpen((v) => !v)
  }

  const encodedUrl = encodeURIComponent(url || '')
  const encodedTitle = encodeURIComponent(title || '')

  const shareTargets: {
    key: string
    label: string
    renderIcon: (size: number) => React.ReactNode
    href: string
  }[] = [
    {
      key: 'twitter',
      label: 'X',
      renderIcon: (size) => <XMarkIcon size={size} />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      renderIcon: (size) => <FacebookMarkIcon size={size} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      renderIcon: (size) => <Send size={size} />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ]

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleMainClick}
        className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 hover:bg-[var(--color-gold)]/5"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="공유"
      >
        <Share2
          size={14}
          className="transition-colors group-hover:text-[var(--color-gold)]"
        />
        <span className="text-xs font-medium tracking-wide group-hover:text-[var(--color-gold)] transition-colors">
          공유
        </span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl border backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] z-50 animate-fade-in"
          style={{
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div>
              <p
                className="text-[9px] tracking-[0.3em] uppercase font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                Share
              </p>
              <p className="text-xs font-bold mt-0.5">이 페이지 공유</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="닫기"
            >
              <X
                size={14}
                style={{ color: 'var(--color-text-muted)' }}
              />
            </button>
          </div>

          {/* Copy link row */}
          <div className="p-3">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors hover:bg-white/5"
              style={{
                backgroundColor: copied
                  ? 'rgba(212, 168, 83, 0.08)'
                  : 'var(--color-bg-card)',
                borderColor: copied
                  ? 'rgba(212, 168, 83, 0.4)'
                  : 'var(--color-border)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                style={{
                  backgroundColor: 'rgba(212, 168, 83, 0.08)',
                  borderColor: 'rgba(212, 168, 83, 0.3)',
                }}
              >
                {copied ? (
                  <Check
                    size={14}
                    style={{ color: 'var(--color-gold)' }}
                    strokeWidth={2.5}
                  />
                ) : (
                  <LinkIcon
                    size={14}
                    style={{ color: 'var(--color-gold)' }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p
                  className="text-[10px] tracking-[0.2em] uppercase font-medium"
                  style={{
                    color: copied
                      ? 'var(--color-gold)'
                      : 'var(--color-text-muted)',
                  }}
                >
                  {copied ? 'Copied!' : 'Link'}
                </p>
                <p
                  className="text-[11px] font-mono truncate mt-0.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {url.replace(/^https?:\/\//, '')}
                </p>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div
            className="h-px mx-3"
            style={{ backgroundColor: 'var(--color-border)' }}
          />

          {/* Share targets */}
          <div className="p-3 grid grid-cols-3 gap-2">
            {shareTargets.map((target) => (
              <a
                key={target.key}
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:-translate-y-0.5 hover:border-[var(--color-gold)]/40"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                }}
                onClick={() => setOpen(false)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:text-[var(--color-gold)]"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.08)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {target.renderIcon(14)}
                </div>
                <span
                  className="text-[10px] font-medium text-center leading-tight group-hover:text-[var(--color-gold)] transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {target.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
