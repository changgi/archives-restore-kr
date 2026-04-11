'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, EyeOff, Eye, MoveHorizontal } from 'lucide-react'

interface ImageCompareSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeAlt?: string
  afterAlt?: string
}

export default function ImageCompareSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = '복원 전',
  afterAlt = '복원 후',
}: ImageCompareSliderProps) {
  const [position, setPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
    setHasInteracted(true)
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      updatePosition(e.clientX)
    },
    [updatePosition],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      updatePosition(e.touches[0].clientX)
    },
    [updatePosition],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      updatePosition(clientX)
    }

    const handleUp = () => setIsDragging(false)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: true })
    window.addEventListener('touchend', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, updatePosition])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setPosition((p) => Math.max(0, p - 2))
      setHasInteracted(true)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setPosition((p) => Math.min(100, p + 2))
      setHasInteracted(true)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setPosition(0)
      setHasInteracted(true)
    } else if (e.key === 'End') {
      e.preventDefault()
      setPosition(100)
      setHasInteracted(true)
    }
  }, [])

  return (
    <div className="space-y-3">
      {/* Slider surface */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl select-none border ${
          isDragging ? 'cursor-grabbing' : 'cursor-col-resize'
        }`}
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="복원 전후 비교 슬라이더 (화살표 키로 조절)"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* After image (full background) */}
        <img
          src={afterSrc}
          alt={afterAlt}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={beforeSrc}
            alt={beforeAlt}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Top-left Before pill */}
        <div
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase backdrop-blur-md border pointer-events-none"
          style={{
            backgroundColor: 'rgba(197, 48, 48, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
          }}
        >
          <EyeOff size={11} />
          <span>Before · 복원 전</span>
        </div>

        {/* Top-right After pill */}
        <div
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase backdrop-blur-md border pointer-events-none"
          style={{
            backgroundColor: 'rgba(212, 168, 83, 0.95)',
            borderColor: 'rgba(0, 0, 0, 0.15)',
            color: '#000',
          }}
        >
          <Eye size={11} />
          <span>After · 복원 후</span>
        </div>

        {/* Divider line with glow */}
        <div
          className="absolute top-0 bottom-0 w-0.5 z-10 pointer-events-none"
          style={{
            left: `${position}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-gold)',
            boxShadow:
              '0 0 0 1px rgba(212, 168, 83, 0.3), 0 0 20px 4px rgba(212, 168, 83, 0.25)',
          }}
        >
          {/* Handle ring */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center border-2 backdrop-blur-md transition-all ${
              !hasInteracted ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              borderColor: 'var(--color-gold)',
              boxShadow: isDragging
                ? '0 0 0 6px rgba(212, 168, 83, 0.2)'
                : '0 0 0 3px rgba(212, 168, 83, 0.12)',
            }}
          >
            <div className="flex items-center gap-0.5">
              <ChevronLeft
                size={14}
                strokeWidth={2.5}
                style={{ color: 'var(--color-gold)' }}
              />
              <ChevronRight
                size={14}
                strokeWidth={2.5}
                style={{ color: 'var(--color-gold)' }}
              />
            </div>
          </div>
        </div>

        {/* Drag hint (hidden after first interaction) */}
        {!hasInteracted && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium backdrop-blur-md border pointer-events-none animate-fade-in"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderColor: 'rgba(212, 168, 83, 0.3)',
              color: 'var(--color-gold)',
            }}
          >
            <MoveHorizontal size={11} />
            <span>좌우로 드래그하여 비교</span>
          </div>
        )}
      </div>

      {/* Bottom scale */}
      <div
        className="flex items-center justify-between text-[10px] font-mono tabular-nums tracking-wider px-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span>0%</span>
        <span
          className="font-bold"
          style={{ color: 'var(--color-gold)' }}
        >
          {Math.round(position)}%
        </span>
        <span>100%</span>
      </div>
    </div>
  )
}
