'use client'

import { useState, useEffect, useCallback } from 'react'

interface Section {
  id: string
  label: string
}

interface ScrollProgressProps {
  sections: Section[]
}

export default function ScrollProgress({ sections }: ScrollProgressProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const windowH = window.innerHeight
    setVisible(scrollY > windowH * 0.25)

    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i].id)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= windowH * 0.4) {
          setActiveIndex(i)
          break
        }
      }
    }
  }, [sections])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Prime initial state after mount so SSR/hydration doesn't set
    // state during render. rAF batches with the next paint.
    const id = requestAnimationFrame(handleScroll)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      aria-label="섹션 탐색"
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end transition-all duration-500 ${
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-4 pointer-events-none'
      }`}
    >
      {/* Rail */}
      <div
        className="relative flex flex-col items-end gap-4 pl-2 pr-3 py-4 rounded-full border backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(15, 15, 15, 0.5)',
          borderColor: 'var(--color-border)',
        }}
      >
        {sections.map((section, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className="group relative flex items-center gap-3"
              aria-label={section.label}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Label tooltip */}
              <span
                className={`absolute right-full mr-3 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-md transition-all duration-300 ${
                  isActive
                    ? 'opacity-100 -translate-x-0'
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
                style={{
                  backgroundColor: 'rgba(15, 15, 15, 0.85)',
                  borderColor: 'var(--color-border)',
                  color: isActive
                    ? 'var(--color-gold)'
                    : 'var(--color-text-secondary)',
                }}
              >
                {section.label}
              </span>

              {/* Dot indicator */}
              <span
                className="flex items-center justify-center w-4 h-4"
                aria-hidden
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? '10px' : '6px',
                    height: isActive ? '10px' : '6px',
                    backgroundColor: isActive
                      ? 'var(--color-gold)'
                      : 'var(--color-text-muted)',
                    boxShadow: isActive
                      ? '0 0 0 3px rgba(212, 168, 83, 0.18)'
                      : 'none',
                  }}
                />
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
