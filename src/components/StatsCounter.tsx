'use client'

import { useEffect, useRef, useState } from 'react'
import { Archive, Building2, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatItemProps {
  label: string
  sublabel: string
  value: number
  suffix?: string
  icon: LucideIcon
  delay?: number
}

function StatItem({
  label,
  sublabel,
  value,
  suffix = '',
  icon: Icon,
  delay = 0,
}: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [displayed, setDisplayed] = useState(0)
  const [started, setStarted] = useState(false)

  // IntersectionObserver — trigger once when card enters viewport
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Linear count-up animation
  useEffect(() => {
    if (!started) return
    const duration = 1400
    const startTime = performance.now()
    let rafId = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [started, value])

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center text-center px-6 py-8 rounded-2xl border animate-fade-in"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-3 left-3 w-4 h-px opacity-50"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />
      <div
        className="absolute top-3 left-3 w-px h-4 opacity-50"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />
      <div
        className="absolute bottom-3 right-3 w-4 h-px opacity-50"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />
      <div
        className="absolute bottom-3 right-3 w-px h-4 opacity-50"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border"
        style={{
          backgroundColor: 'rgba(212, 168, 83, 0.08)',
          borderColor: 'rgba(212, 168, 83, 0.25)',
        }}
      >
        <Icon size={20} style={{ color: 'var(--color-gold)' }} />
      </div>
      <p
        className="text-[10px] tracking-[0.3em] uppercase mb-3 font-medium"
        style={{ color: 'var(--color-gold)' }}
      >
        {sublabel}
      </p>
      <div
        className="text-5xl md:text-6xl font-bold tabular-nums leading-none mb-3"
        style={{ color: 'var(--color-text)' }}
      >
        {displayed}
        <span
          className="text-2xl md:text-3xl ml-1"
          style={{ color: 'var(--color-gold)' }}
        >
          {suffix}
        </span>
      </div>
      <div
        className="h-px w-10 opacity-40 mb-3"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />
      <div
        className="text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </div>
    </div>
  )
}

interface StatsCounterProps {
  totalCases: number
  totalOrgs: number
  yearRange: { min: number; max: number }
}

export default function StatsCounter({
  totalCases,
  totalOrgs,
  yearRange,
}: StatsCounterProps) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section eyebrow */}
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
            style={{ color: 'var(--color-gold)' }}
          >
            By the Numbers
          </p>
          <div className="flex items-center justify-center gap-4">
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
            <h2 className="text-2xl md:text-3xl font-bold">
              아카이브 <span style={{ color: 'var(--color-gold)' }}>현황</span>
            </h2>
            <div
              className="h-px w-12 opacity-40"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <StatItem
            icon={Archive}
            sublabel="Total Cases"
            label="복원 사례"
            value={totalCases}
            suffix="건"
            delay={0}
          />
          <StatItem
            icon={Building2}
            sublabel="Partner Orgs"
            label="참여 기관"
            value={totalOrgs}
            suffix="개"
            delay={100}
          />
          <StatItem
            icon={Clock}
            sublabel="Time Span"
            label="복원 기간"
            value={yearRange.max - yearRange.min + 1}
            suffix="년"
            delay={200}
          />
        </div>
      </div>
    </section>
  )
}
