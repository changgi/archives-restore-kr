'use client'

import { useState } from 'react'
import { Play, Droplets, Flame, Package, Scissors, BookOpen, Film, Layers, Shield } from 'lucide-react'
import type { RelatedVideo } from '@/types'
import VideoPlayer from '@/components/VideoPlayer'

const VIDEO_ICONS = [Droplets, Flame, Package, Scissors, BookOpen, Film, Layers, Shield]
const VIDEO_GRADIENTS = [
  'from-amber-900/90 via-amber-800/70 to-neutral-900',
  'from-rose-900/90 via-rose-800/70 to-neutral-900',
  'from-emerald-900/90 via-emerald-800/70 to-neutral-900',
  'from-blue-900/90 via-blue-800/70 to-neutral-900',
  'from-purple-900/90 via-purple-800/70 to-neutral-900',
  'from-teal-900/90 via-teal-800/70 to-neutral-900',
  'from-orange-900/90 via-orange-800/70 to-neutral-900',
  'from-indigo-900/90 via-indigo-800/70 to-neutral-900',
]

interface LearnClientProps {
  videos: RelatedVideo[]
}

export default function LearnClient({ videos }: LearnClientProps) {
  const [activeVideo, setActiveVideo] = useState<RelatedVideo | null>(null)

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <p
          className="text-sm tracking-[0.2em] uppercase mb-3"
          style={{ color: 'var(--color-gold)' }}
        >
          Conservation Education
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          <span style={{ color: 'var(--color-gold)' }}>보존</span>교육
        </h1>
        <p className="text-base md:text-lg max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          기록물 보존과 복원의 과정을 영상으로 확인하세요.
          전문가의 복원 기술과 과정을 생생하게 체험할 수 있습니다.
        </p>
      </section>

      {/* Video Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, i) => (
            <div
              key={video.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <button
                onClick={() => setActiveVideo(video)}
                className="w-full text-left group rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    (() => {
                      const IconComponent = VIDEO_ICONS[i % VIDEO_ICONS.length]
                      const gradient = VIDEO_GRADIENTS[i % VIDEO_GRADIENTS.length]
                      return (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                          {/* Background icon */}
                          <IconComponent
                            size={80}
                            className="text-white/10 absolute"
                            strokeWidth={1}
                          />
                          {/* Number badge */}
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/40 border border-white/10">
                            <span className="text-xs font-bold text-[var(--color-gold)] tracking-wider">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                          {/* Center icon */}
                          <IconComponent
                            size={36}
                            className="text-white/40 relative z-10"
                            strokeWidth={1.5}
                          />
                        </div>
                      )
                    })()
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 border-2 border-[var(--color-gold)] flex items-center justify-center">
                      <Play size={20} className="text-[var(--color-gold)] ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
                    {video.title}
                  </h3>
                </div>
              </button>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-lg">아직 등록된 교육 영상이 없습니다.</p>
          </div>
        )}
      </section>

      {/* Modal player */}
      {activeVideo && (
        <VideoPlayer
          src={activeVideo.video_url}
          title={activeVideo.title}
          poster={activeVideo.thumbnail_url || undefined}
          modal
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  )
}
