import Link from 'next/link'
import { ArrowLeft, Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-24">
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
          background:
            'linear-gradient(to bottom, transparent, var(--color-gold))',
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 text-center animate-fade-in">
        {/* Eyebrow */}
        <p
          className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          Error 404
        </p>

        {/* Big 404 with dividers */}
        <div className="flex items-center justify-center gap-5 mb-8">
          <div
            className="h-px w-16 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          <h1
            className="text-7xl md:text-9xl font-bold tabular-nums tracking-tight"
            style={{ color: 'var(--color-gold)' }}
          >
            404
          </h1>
          <div
            className="h-px w-16 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p
          className="text-base md:text-lg mb-10 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          요청하신 기록은 이 아카이브에 존재하지 않거나,
          <br className="hidden sm:block" />
          다른 곳으로 이동했을 수 있습니다.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-black transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)]"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            <Home size={16} />
            <span>홈으로 돌아가기</span>
          </Link>
          <Link
            href="/cases"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[var(--color-gold)]/5"
            style={{
              borderColor: 'var(--color-gold)',
              color: 'var(--color-gold)',
            }}
          >
            <Search size={16} />
            <span>복원 사례 탐색</span>
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-10 pt-8 border-t inline-block"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-xs tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 hover:text-[var(--color-gold)] transition-colors"
            >
              <ArrowLeft size={12} />
              프로젝트 소개
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
