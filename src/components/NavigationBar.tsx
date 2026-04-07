'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon } from 'lucide-react'

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/cases', label: '복원 사례' },
  { href: '/stories', label: '기획전시' },
  { href: '/learn', label: '보존교육' },
  { href: '/timeline', label: '타임라인' },
  { href: '/gallery', label: '갤러리' },
  { href: '/about', label: '소개' },
]

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2 backdrop-blur-xl bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]'
          : 'py-4 bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold" style={{ color: 'var(--color-gold)' }}>
            기록유산
          </span>
          <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block">
            복원 아카이브
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-[var(--color-gold)] bg-[var(--color-bg-hover)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-bg-hover)] transition-colors"
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
            aria-label="메뉴"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-[var(--color-border)]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[var(--color-gold)] bg-[var(--color-bg-hover)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
