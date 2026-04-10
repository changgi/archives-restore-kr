'use client'

import { useState } from 'react'
import { Play, X, Check, Clock } from 'lucide-react'
import type { RelatedVideo, VideoFrame } from '@/types'
import VideoPlayer from '@/components/VideoPlayer'

interface LearnClientProps {
  videos: RelatedVideo[]
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function LearnClient({ videos }: LearnClientProps) {
  const [activeVideo, setActiveVideo] = useState<RelatedVideo | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState<VideoFrame | null>(null)

  const closeModal = () => {
    setActiveVideo(null)
    setShowPlayer(false)
    setSelectedFrame(null)
  }

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
          각 영상의 핵심 내용과 주요 장면을 AI가 분석하여 요약했습니다.
        </p>
      </section>

      {/* Video Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <div
              key={video.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <button
                onClick={() => setActiveVideo(video)}
                className="w-full text-left group rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-neutral-900 flex items-center justify-center">
                      <Play size={40} className="text-[var(--color-gold)]/60" />
                    </div>
                  )}
                  {/* Duration badge */}
                  {video.duration_seconds && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm flex items-center gap-1">
                      <Clock size={12} className="text-white/80" />
                      <span className="text-xs text-white font-medium">
                        {formatDuration(video.duration_seconds)}
                      </span>
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/60 border-2 border-[var(--color-gold)] flex items-center justify-center">
                      <Play size={22} className="text-[var(--color-gold)] ml-0.5" />
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
                    {video.title}
                  </h3>
                  {video.summary && (
                    <p
                      className="text-xs leading-relaxed line-clamp-3 flex-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {video.summary}
                    </p>
                  )}
                  <div
                    className="mt-3 pt-3 border-t text-xs font-medium"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-gold)',
                    }}
                  >
                    자세히 보기 →
                  </div>
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

      {/* Detail Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="min-h-full flex items-start justify-center p-4 py-12">
            <div
              className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                aria-label="닫기"
              >
                <X size={20} />
              </button>

              {/* Hero thumbnail or player */}
              <div className="relative aspect-video bg-black">
                {showPlayer ? (
                  <VideoPlayer
                    src={activeVideo.video_url}
                    title={activeVideo.title}
                    poster={activeVideo.thumbnail_url || undefined}
                  />
                ) : (
                  <>
                    {activeVideo.thumbnail_url && (
                      <img
                        src={activeVideo.thumbnail_url}
                        alt={activeVideo.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <button
                      onClick={() => setShowPlayer(true)}
                      className="absolute inset-0 flex items-center justify-center group"
                      aria-label="영상 재생"
                    >
                      <div className="w-20 h-20 rounded-full bg-black/60 border-2 border-[var(--color-gold)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play size={36} className="text-[var(--color-gold)] ml-1" />
                      </div>
                    </button>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {activeVideo.title}
                      </h2>
                      {activeVideo.duration_seconds && (
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <Clock size={14} />
                          <span>{formatDuration(activeVideo.duration_seconds)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Body */}
              <div className="p-6 md:p-8">
                {/* Summary */}
                {activeVideo.summary && (
                  <div className="mb-8">
                    <h3
                      className="text-sm tracking-[0.15em] uppercase mb-3 font-medium"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      영상 요약
                    </h3>
                    <p
                      className="text-base md:text-lg leading-relaxed"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {activeVideo.summary}
                    </p>
                  </div>
                )}

                {/* Key points */}
                {activeVideo.key_points && activeVideo.key_points.length > 0 && (
                  <div className="mb-8">
                    <h3
                      className="text-sm tracking-[0.15em] uppercase mb-4 font-medium"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      핵심 포인트
                    </h3>
                    <ul className="space-y-3">
                      {activeVideo.key_points.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <div
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                            style={{
                              backgroundColor: 'var(--color-gold)',
                              color: '#000',
                            }}
                          >
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-sm md:text-base leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Frame gallery */}
                {activeVideo.video_frames && activeVideo.video_frames.length > 0 && (
                  <div>
                    <h3
                      className="text-sm tracking-[0.15em] uppercase mb-4 font-medium"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      주요 장면
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {activeVideo.video_frames.map((frame) => (
                        <button
                          key={frame.id}
                          onClick={() => setSelectedFrame(frame)}
                          className="group text-left"
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-[var(--color-border)] group-hover:border-[var(--color-gold)] transition-colors">
                            <img
                              src={frame.frame_url}
                              alt={frame.caption || ''}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div
                              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{
                                backgroundColor: 'var(--color-gold)',
                                color: '#000',
                              }}
                            >
                              {frame.timestamp_percent}%
                            </div>
                          </div>
                          {frame.caption && (
                            <p
                              className="mt-2 text-xs line-clamp-2 leading-relaxed"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {frame.caption}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frame detail lightbox */}
      {selectedFrame && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95"
          onClick={() => setSelectedFrame(null)}
        >
          <button
            onClick={() => setSelectedFrame(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
          <div className="max-w-5xl w-full">
            <img
              src={selectedFrame.frame_url}
              alt={selectedFrame.caption || ''}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            {selectedFrame.caption && (
              <div className="mt-4 text-center">
                <p className="text-white/90 text-lg">{selectedFrame.caption}</p>
                <p className="text-[var(--color-gold)] text-sm mt-1">
                  {selectedFrame.timestamp_percent}% 지점
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
