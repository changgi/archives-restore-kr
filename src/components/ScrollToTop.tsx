'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'

export default function ScrollToTop() {
  const t = useT()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label={t.notFound.goHome}
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-500 hover:shadow-[0_10px_30px_-5px_rgba(212,168,83,0.5)] ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'rgba(15, 15, 15, 0.85)',
        borderColor: 'rgba(212, 168, 83, 0.4)',
        color: 'var(--color-gold)',
      }}
    >
      <ArrowUp size={18} />
    </button>
  )
}
