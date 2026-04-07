'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { RelatedVideo } from '@/types'
import VideoPlayer from '@/components/VideoPlayer'

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
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
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
                    <div className="w-full h-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
                      <Play size={32} className="text-[var(--color-text-muted)]" />
                    </div>
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
            </motion.div>
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
