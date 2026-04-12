'use client'

import { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'
import {
  subscribeProgress,
  type TranslateProgress,
} from '@/i18n/translateStore'
import { getLocaleDef, type Locale } from '@/i18n/config'

/**
 * Tiny floating progress badge that appears while AutoTranslate is
 * working through a fresh scan pass. Disappears automatically once
 * the pass completes. Mounted once in the root layout so every
 * page benefits.
 */
export default function AutoTranslateIndicator() {
  const [progress, setProgress] = useState<TranslateProgress>({
    active: false,
    total: 0,
    done: 0,
    locale: '',
  })
  // Delay hiding by 400ms so the 'Done' frame is briefly visible
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    return subscribeProgress((p) => {
      setProgress(p)
      if (p.active) {
        setVisible(true)
      } else if (p.total > 0) {
        // Keep the badge up for a brief moment after completion
        const t = window.setTimeout(() => setVisible(false), 600)
        return () => window.clearTimeout(t)
      } else {
        setVisible(false)
      }
    })
  }, [])

  if (!visible) return null

  const localeDef = progress.locale
    ? getLocaleDef(progress.locale as Locale)
    : null
  const pct =
    progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0
  const isDone = !progress.active && progress.done >= progress.total

  return (
    <div
      className="fixed bottom-6 left-6 z-[60] pointer-events-none animate-fade-in"
      aria-live="polite"
      data-noauto="true"
    >
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-full border backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
        style={{
          backgroundColor: 'rgba(15, 15, 15, 0.92)',
          borderColor: 'rgba(212, 168, 83, 0.4)',
        }}
      >
        <Globe
          size={14}
          className={progress.active ? 'animate-spin' : ''}
          style={{
            color: 'var(--color-gold)',
            animationDuration: '3s',
          }}
        />
        <div className="flex flex-col leading-none gap-1">
          <span
            className="text-[9px] tracking-[0.25em] uppercase font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            {isDone ? 'Translated' : 'Translating'}
            {localeDef && ' · ' + localeDef.nativeLabel}
          </span>
          {progress.total > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="relative h-1 rounded-full overflow-hidden"
                style={{
                  width: 96,
                  backgroundColor: 'rgba(212, 168, 83, 0.15)',
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                  style={{
                    width: pct + '%',
                    backgroundColor: 'var(--color-gold)',
                  }}
                />
              </div>
              <span
                className="text-[9px] font-mono tabular-nums opacity-70"
                style={{ color: 'var(--color-gold)' }}
              >
                {progress.done}/{progress.total}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
