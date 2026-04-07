'use client'

import { useState } from 'react'
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

const tabs = [
  { key: 'all', label: '전체' },
  { key: 'before', label: '복원 전' },
  { key: 'after', label: '복원 후' },
] as const

type TabKey = typeof tabs[number]['key']

export default function GalleryTabs({ allImages, beforeImages, afterImages }: GalleryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const imageMap: Record<TabKey, GalleryItem[]> = {
    all: allImages,
    before: beforeImages,
    after: afterImages,
  }

  return (
    <>
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'text-black'
                : 'text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-gold)]/30'
            }`}
            style={activeTab === tab.key ? { backgroundColor: 'var(--color-gold)' } : undefined}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-70">({imageMap[tab.key].length})</span>
          </button>
        ))}
      </div>
      <GalleryGrid images={imageMap[activeTab]} />
    </>
  )
}
