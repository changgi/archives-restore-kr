'use client'

import { useEffect, useRef, useState } from 'react'
import { useSpring, useInView } from 'framer-motion'

interface StatItemProps {
  label: string
  value: number
  suffix?: string
  prefix?: string
}

function StatItem({ label, value, suffix = '', prefix = '' }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [displayed, setDisplayed] = useState(0)
  const spring = useSpring(0, { stiffness: 50, damping: 20 })

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, value, spring])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      setDisplayed(Math.round(v))
    })
    return unsubscribe
  }, [spring])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2" style={{ color: 'var(--color-gold)' }}>
        {prefix}{displayed}{suffix}
      </div>
      <div className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
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

export default function StatsCounter({ totalCases, totalOrgs, yearRange }: StatsCounterProps) {
  return (
    <section className="py-16 md:py-24 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <StatItem label="복원 사례" value={totalCases} suffix="건" />
          <StatItem label="참여 기관" value={totalOrgs} suffix="개" />
          <StatItem
            label="복원 기간"
            value={yearRange.max - yearRange.min + 1}
            suffix="년"
          />
        </div>
      </div>
    </section>
  )
}
