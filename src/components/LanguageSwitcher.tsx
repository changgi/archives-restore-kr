'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, Check, X } from 'lucide-react'
import { LOCALES, type Locale } from '@/i18n/config'
import { useLocale } from '@/i18n/LanguageProvider'

interface LanguageSwitcherProps {
  compact?: boolean
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
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

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  const handleSelect = (code: Locale) => {
    setLocale(code)
    setOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`group inline-flex items-center gap-1.5 rounded-lg transition-colors hover:bg-[var(--color-bg-hover)] ${
          compact ? 'p-2' : 'px-2.5 py-2'
        }`}
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label={t.language.switchLanguage}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe
          size={16}
          className="group-hover:text-[var(--color-gold)] transition-colors"
        />
        {!compact && (
          <span className="text-[10px] tracking-[0.15em] uppercase font-medium group-hover:text-[var(--color-gold)] transition-colors">
            {current.code.toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="listbox"
          className="absolute right-0 top-full mt-2 w-72 max-h-[420px] overflow-y-auto rounded-2xl border backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] z-50 animate-fade-in"
          style={{
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b sticky top-0"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'rgba(15, 15, 15, 0.95)',
            }}
          >
            <div>
              <p
                className="text-[9px] tracking-[0.3em] uppercase font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                Language
              </p>
              <p className="text-xs font-bold mt-0.5">
                {t.language.switchLanguage}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              aria-label={t.gallery.close}
            >
              <X size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          {/* Locale list */}
          <ul className="py-2" dir="ltr">
            {LOCALES.map((l) => {
              const isActive = l.code === locale
              return (
                <li key={l.code}>
                  <button
                    onClick={() => handleSelect(l.code)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5 text-left"
                    style={{
                      backgroundColor: isActive
                        ? 'rgba(212, 168, 83, 0.08)'
                        : 'transparent',
                    }}
                    aria-selected={isActive}
                    role="option"
                  >
                    <span className="text-lg flex-shrink-0" aria-hidden>
                      {l.flag}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className="block text-sm font-bold leading-tight"
                        style={{
                          color: isActive
                            ? 'var(--color-gold)'
                            : 'var(--color-text)',
                        }}
                      >
                        {l.nativeLabel}
                      </span>
                      <span
                        className="block text-[10px] mt-0.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {l.label}
                      </span>
                    </span>
                    {isActive && (
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        style={{ color: 'var(--color-gold)' }}
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Footer note */}
          <div
            className="px-4 py-3 border-t text-[10px] leading-relaxed"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {t.language.uiOnlyNote}
          </div>
        </div>
      )}
    </div>
  )
}
