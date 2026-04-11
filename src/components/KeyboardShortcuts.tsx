'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Keyboard } from 'lucide-react'

interface Shortcut {
  keys: string[]
  label: string
  action: () => void
  section?: string
}

export default function KeyboardShortcuts() {
  const router = useRouter()
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    const isTyping = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false
      const tag = target.tagName
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      )
    }

    // Sequence tracker for "g + ?" combos
    let lastKey = ''
    let lastKeyAt = 0

    const shortcuts: Shortcut[] = [
      {
        keys: ['/'],
        label: '검색 포커스',
        section: '탐색',
        action: () => {
          const input = document.querySelector<HTMLInputElement>(
            'input[type="text"]',
          )
          if (input) {
            input.focus()
            input.select()
          } else {
            router.push('/cases')
          }
        },
      },
      {
        keys: ['g', 'h'],
        label: '홈',
        section: '이동',
        action: () => router.push('/'),
      },
      {
        keys: ['g', 'c'],
        label: '복원 사례',
        section: '이동',
        action: () => router.push('/cases'),
      },
      {
        keys: ['g', 's'],
        label: '기획전시',
        section: '이동',
        action: () => router.push('/stories'),
      },
      {
        keys: ['g', 'l'],
        label: '보존교육',
        section: '이동',
        action: () => router.push('/learn'),
      },
      {
        keys: ['g', 't'],
        label: '타임라인',
        section: '이동',
        action: () => router.push('/timeline'),
      },
      {
        keys: ['g', 'a'],
        label: '갤러리',
        section: '이동',
        action: () => router.push('/gallery'),
      },
      {
        keys: ['?'],
        label: '단축키 도움말',
        section: '기타',
        action: () => setHelpOpen((v) => !v),
      },
    ]

    const handleKey = (e: KeyboardEvent) => {
      // Escape always closes the help dialog
      if (e.key === 'Escape' && helpOpen) {
        setHelpOpen(false)
        return
      }
      if (isTyping(e.target)) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const now = performance.now()
      const key = e.key

      // "?" opens help
      if (key === '?') {
        e.preventDefault()
        setHelpOpen((v) => !v)
        return
      }

      // "/" focuses search
      if (key === '/') {
        e.preventDefault()
        shortcuts.find((s) => s.keys[0] === '/')?.action()
        return
      }

      // Sequence: "g" then another letter (g+h, g+c, ...)
      if (lastKey === 'g' && now - lastKeyAt < 1200) {
        const combo = shortcuts.find(
          (s) => s.keys.length === 2 && s.keys[0] === 'g' && s.keys[1] === key,
        )
        if (combo) {
          e.preventDefault()
          combo.action()
        }
        lastKey = ''
        lastKeyAt = 0
        return
      }

      // First key of a sequence
      if (key === 'g') {
        lastKey = 'g'
        lastKeyAt = now
      } else {
        lastKey = ''
        lastKeyAt = 0
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [router, helpOpen])

  // Group for display
  const shortcutGroups = [
    {
      section: '탐색',
      items: [{ keys: ['/'], label: '검색창에 포커스' }],
    },
    {
      section: '이동',
      items: [
        { keys: ['g', 'h'], label: '홈' },
        { keys: ['g', 'c'], label: '복원 사례' },
        { keys: ['g', 's'], label: '기획전시' },
        { keys: ['g', 'l'], label: '보존교육' },
        { keys: ['g', 't'], label: '타임라인' },
        { keys: ['g', 'a'], label: '갤러리' },
      ],
    },
    {
      section: '기타',
      items: [
        { keys: ['?'], label: '이 도움말 열기/닫기' },
        { keys: ['Esc'], label: '모달/팝오버 닫기' },
      ],
    },
  ]

  if (!helpOpen) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setHelpOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="키보드 단축키"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border overflow-hidden animate-fade-in"
        style={{
          backgroundColor: 'rgba(15, 15, 15, 0.98)',
          borderColor: 'var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: 'rgba(212, 168, 83, 0.08)',
                borderColor: 'rgba(212, 168, 83, 0.3)',
              }}
            >
              <Keyboard
                size={15}
                style={{ color: 'var(--color-gold)' }}
              />
            </div>
            <div>
              <p
                className="text-[9px] tracking-[0.3em] uppercase font-medium leading-none mb-1"
                style={{ color: 'var(--color-gold)' }}
              >
                Shortcuts
              </p>
              <p className="text-sm font-bold leading-none">키보드 단축키</p>
            </div>
          </div>
          <button
            onClick={() => setHelpOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="닫기"
          >
            <X size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.section}>
              <p
                className="text-[9px] tracking-[0.25em] uppercase font-medium mb-3"
                style={{ color: 'var(--color-gold)' }}
              >
                {group.section}
              </p>
              <ul className="space-y-1">
                {group.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-2"
                  >
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {item.label}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.keys.map((key, ki) => (
                        <kbd
                          key={ki}
                          className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-xs font-mono font-bold border"
                          style={{
                            backgroundColor: 'var(--color-bg-card)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-gold)',
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="px-5 py-3 border-t text-[10px] text-center"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          언제든 <kbd className="px-1 font-mono text-[var(--color-gold)]">?</kbd>{' '}
          를 눌러 이 창을 다시 열 수 있습니다
        </div>
      </div>
    </div>
  )
}
