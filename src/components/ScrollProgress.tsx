'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

    setVisible(scrollY > windowH * 0.3)

    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i].id)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= windowH * 0.5) {
          setActiveIndex(i)
          break
        }
      }
    }
  }, [sections])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3"
        >
          {sections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className="group flex items-center gap-3"
              aria-label={section.label}
            >
              <span
                className={`text-xs transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ${
                  i === activeIndex
                    ? 'text-[var(--color-gold)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {section.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-3 h-3 bg-[var(--color-gold)]'
                    : 'w-2 h-2 bg-[var(--color-text-muted)] group-hover:bg-[var(--color-text-secondary)]'
                }`}
              />
            </button>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
