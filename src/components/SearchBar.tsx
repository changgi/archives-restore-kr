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

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('search', value.trim())
      } else {
        params.delete('search')
      }
      router.push(`/cases?${params.toString()}`)
    },
    [router, searchParams]
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
  }

  return (
    <div
      className={`relative flex items-center rounded-xl border transition-all duration-300 ${
        isFocused
          ? 'border-[var(--color-gold)] shadow-[0_0_0_2px_rgba(212,168,83,0.15)]'
          : 'border-[var(--color-border)]'
      }`}
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <Search
        size={18}
        className="absolute left-3"
        style={{ color: isFocused ? 'var(--color-gold)' : 'var(--color-text-muted)' }}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="복원 사례 검색..."
        className="w-full pl-10 pr-10 py-3 bg-transparent text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none"
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-3 p-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <X size={16} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      )}
    </div>
  )
}
