'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[App error]', error)
  }, [error])

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-24">
      {/* Dot pattern */}
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
          background:
            'linear-gradient(to bottom, transparent, var(--color-gold))',
        }}
      />

      <div className="relative max-w-xl mx-auto px-4 text-center animate-fade-in">
        {/* Eyebrow */}
        <p
          className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
          style={{ color: 'var(--color-red)' }}
        >
          System Error
        </p>

        <div className="flex items-center justify-center gap-5 mb-8">
          <div
            className="h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-red)' }}
          />
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: 'rgba(197, 48, 48, 0.1)',
              borderColor: 'rgba(197, 48, 48, 0.4)',
            }}
          >
            <AlertTriangle
              size={26}
              style={{ color: 'var(--color-red)' }}
            />
          </div>
          <div
            className="h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-red)' }}
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          예상치 못한 오류가 <br className="sm:hidden" />
          발생했습니다
        </h1>
        <p
          className="text-base md:text-lg mb-8 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          요청을 처리하는 중에 문제가 발생했습니다.
          <br className="hidden sm:block" />
          잠시 후 다시 시도해 주세요.
        </p>

        {/* Error digest (optional) */}
        {error.digest && (
          <div
            className="inline-block mb-8 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            Error ID: {error.digest}
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            <RefreshCw
              size={16}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
            <span>다시 시도</span>
          </button>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[var(--color-gold)]/5"
            style={{
              borderColor: 'var(--color-gold)',
              color: 'var(--color-gold)',
            }}
          >
            <Home size={16} />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
