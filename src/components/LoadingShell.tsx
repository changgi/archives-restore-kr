import { Loader2 } from 'lucide-react'

interface LoadingShellProps {
  eyebrow?: string
  label?: string
}

export default function LoadingShell({
  eyebrow = 'Loading',
  label = '불러오는 중...',
}: LoadingShellProps) {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24 pb-24">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Vertical accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 opacity-40 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-gold))',
        }}
      />

      <div className="relative text-center animate-fade-in">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
          style={{ color: 'var(--color-gold)' }}
        >
          {eyebrow}
        </p>
        <div className="flex items-center justify-center gap-5 mb-6">
          <div
            className="h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border"
            style={{
              backgroundColor: 'rgba(212, 168, 83, 0.08)',
              borderColor: 'rgba(212, 168, 83, 0.3)',
            }}
          >
            <Loader2
              size={22}
              className="animate-spin"
              style={{ color: 'var(--color-gold)' }}
            />
          </div>
          <div
            className="h-px w-12 opacity-40"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}
