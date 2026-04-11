'use client'

import { useState } from 'react'
import { Grid3x3, EyeOff, Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import GalleryGrid from './GalleryGrid'
import type { CaseImage } from '@/types'

interface GalleryItem extends CaseImage {
  caseTitle?: string
}

interface GalleryTabsProps {
  allImages: GalleryItem[]
  beforeImages: GalleryItem[]
  afterImages: GalleryItem[]
}

interface TabDef {
  key: TabKey
  label: string
  sublabel: string
  icon: LucideIcon
  accent: 'gold' | 'red'
}

const tabs: TabDef[] = [
  { key: 'all', label: '전체', sublabel: 'All', icon: Grid3x3, accent: 'gold' },
  { key: 'before', label: '복원 전', sublabel: 'Before', icon: EyeOff, accent: 'red' },
  { key: 'after', label: '복원 후', sublabel: 'After', icon: Eye, accent: 'gold' },
]

type TabKey = 'all' | 'before' | 'after'

export default function GalleryTabs({
  allImages,
  beforeImages,
  afterImages,
}: GalleryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const imageMap: Record<TabKey, GalleryItem[]> = {
    all: allImages,
    before: beforeImages,
    after: afterImages,
  }

  return (
    <>
      {/* Tab bar */}
      <div
        className="mb-10 p-2 rounded-2xl border inline-flex flex-wrap gap-1"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          const count = imageMap[tab.key].length
          const isRed = tab.accent === 'red'
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative group flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all"
              style={{
                backgroundColor: isActive
                  ? isRed
                    ? 'rgba(197, 48, 48, 0.12)'
                    : 'rgba(212, 168, 83, 0.12)'
                  : 'transparent',
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: isActive
                    ? isRed
                      ? 'rgba(197, 48, 48, 0.18)'
                      : 'rgba(212, 168, 83, 0.18)'
                    : 'var(--color-bg-hover)',
                }}
              >
                <Icon
                  size={13}
                  style={{
                    color: isActive
                      ? isRed
                        ? 'var(--color-red)'
                        : 'var(--color-gold)'
                      : 'var(--color-text-muted)',
                  }}
                />
              </div>
              <div className="text-left leading-none">
                <div
                  className="text-[9px] tracking-[0.25em] uppercase font-medium mb-1"
                  style={{
                    color: isActive
                      ? isRed
                        ? 'var(--color-red)'
                        : 'var(--color-gold)'
                      : 'var(--color-text-muted)',
                  }}
                >
                  {tab.sublabel}
                </div>
                <div
                  className="text-sm font-bold"
                  style={{
                    color: isActive
                      ? 'var(--color-text)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {tab.label}
                  <span
                    className="ml-1.5 text-xs font-medium tabular-nums"
                    style={{
                      color: isActive
                        ? isRed
                          ? 'var(--color-red)'
                          : 'var(--color-gold)'
                        : 'var(--color-text-muted)',
                    }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <GalleryGrid images={imageMap[activeTab]} />
    </>
  )
}
