'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [isFocused, setIsFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('search', value.trim())
      } else {
        params.delete('search')
      }
      const qs = params.toString()
      router.push(qs ? `/cases?${qs}` : '/cases')
    },
    [router, searchParams],
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateSearch(query)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, updateSearch])

  const clearSearch = () => {
    setQuery('')
    updateSearch('')
    inputRef.current?.focus()
  }

  return (
    <label
      className={`group relative flex items-center rounded-xl border transition-all duration-300 ${
        isFocused
          ? 'shadow-[0_0_0_3px_rgba(212,168,83,0.12)]'
          : 'hover:border-[var(--color-border-hover)]'
      }`}
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: isFocused
          ? 'var(--color-gold)'
          : 'var(--color-border)',
      }}
    >
      <div
        className="flex items-center justify-center w-12 flex-shrink-0 transition-colors"
        style={{
          color: isFocused ? 'var(--color-gold)' : 'var(--color-text-muted)',
        }}
      >
        <Search size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="제목, 내용, 기관명으로 검색..."
        className="flex-1 pr-3 py-3.5 bg-transparent text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none"
        style={{ color: 'var(--color-text)' }}
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="mr-2 p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
          aria-label="검색어 지우기"
        >
          <X size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      )}
      {!query && (
        <kbd
          className="hidden sm:inline-flex mr-3 items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider border opacity-50"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          검색
        </kbd>
      )}
    </label>
  )
}
