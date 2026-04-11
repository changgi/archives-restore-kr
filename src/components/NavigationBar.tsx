'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon, Archive } from 'lucide-react'
import { useT } from '@/i18n/LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const pathname = usePathname()
  const t = useT()

  const navLinks = [
    { href: '/cases', label: t.nav.cases },
    { href: '/stories', label: t.nav.stories },
    { href: '/learn', label: t.nav.learn },
    { href: '/timeline', label: t.nav.timeline },
    { href: '/gallery', label: t.nav.gallery },
    { href: '/about', label: t.nav.about },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read from localStorage on mount
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change — this is a genuine effect
  // responding to external state (url), not a cascading render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- responding to pathname change
    setIsOpen(false)
  }, [pathname])

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
          ? 'py-2 backdrop-blur-xl bg-[var(--color-bg)]/85 border-b border-[var(--color-border)] shadow-sm'
          : 'py-3 bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors"
            style={{
              backgroundColor: 'rgba(212, 168, 83, 0.08)',
              borderColor: 'rgba(212, 168, 83, 0.25)',
            }}
          >
            <Archive
              size={17}
              style={{ color: 'var(--color-gold)' }}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-[9px] tracking-[0.25em] uppercase font-medium mb-0.5"
              style={{ color: 'var(--color-gold)' }}
            >
              Archives KR
            </span>
            <span className="text-base font-bold">
              <span style={{ color: 'var(--color-gold)' }}>기록</span>
              <span style={{ color: 'var(--color-text)' }}>유산</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 lg:px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  color: isActive
                    ? 'var(--color-gold)'
                    : 'var(--color-text-secondary)',
                }}
              >
                <span className="hover:text-[var(--color-text)] transition-colors">
                  {link.label}
                </span>
                {isActive && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 h-px w-5"
                    style={{ backgroundColor: 'var(--color-gold)' }}
                  />
                )}
              </Link>
            )
          })}
          <div
            className="mx-2 h-5 w-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          <LanguageSwitcher />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-bg-hover)] transition-colors"
            aria-label={t.nav.theme}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1">
          <LanguageSwitcher compact />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
            aria-label={t.nav.theme}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
            aria-label={t.nav.menu}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-b animate-fade-in"
          style={{
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="px-4 py-4 space-y-0.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive
                      ? 'var(--color-gold)'
                      : 'var(--color-text-secondary)',
                    backgroundColor: isActive
                      ? 'rgba(212, 168, 83, 0.08)'
                      : 'transparent',
                  }}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: 'var(--color-gold)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
