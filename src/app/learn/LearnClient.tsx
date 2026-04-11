'use client'

import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { Play, X, Check, Clock, List, FileText, AlignLeft, Loader2 } from 'lucide-react'
import type { RelatedVideo, VideoFrame, VideoTranscript } from '@/types'
import VideoPlayer, { type VideoPlayerHandle } from '@/components/VideoPlayer'

interface LearnClientProps {
  videos: RelatedVideo[]
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

type SideTab = 'timeline' | 'transcript' | 'related'

// ─── Timeline Tab ───────────────────────────────────────────────
const TimelineTab = memo(function TimelineTab({
  frames,
  duration,
  activeIdx,
  onSeek,
}: {
  frames: VideoFrame[]
  duration: number
  activeIdx: number
  onSeek: (seconds: number) => void
}) {
  if (!frames.length || !duration) {
    return (
      <p
        className="text-xs text-center py-8"
        style={{ color: 'var(--color-text-muted)' }}
      >
        타임라인 정보가 없습니다
      </p>
    )
  }

  return (
    <div className="p-3 space-y-2">
      {frames.map((frame, idx) => {
        const timeSec = (frame.timestamp_percent / 100) * duration
        const isActive = idx === activeIdx
        return (
          <button
            key={frame.id}
            onClick={() => onSeek(timeSec)}
            className="w-full flex gap-3 p-2 rounded-lg text-left transition-colors hover:bg-white/5"
            style={{
              backgroundColor: isActive
                ? 'rgba(212, 168, 83, 0.1)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(212, 168, 83, 0.3)'
                : '1px solid transparent',
            }}
          >
            <div className="flex-shrink-0 relative w-28 aspect-video rounded overflow-hidden">
              <img
                src={frame.frame_url}
                alt={frame.caption || ''}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                  <Play size={18} className="text-white" fill="currentColor" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-mono mb-1"
                style={{
                  color: isActive
                    ? 'var(--color-gold)'
                    : 'var(--color-text-muted)',
                }}
              >
                {formatTimestamp(timeSec)}
              </div>
              <div
                className="text-xs leading-relaxed line-clamp-3"
                style={{
                  color: isActive
                    ? 'var(--color-text)'
                    : 'var(--color-text-secondary)',
                }}
              >
                {frame.caption}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
})

// ─── Transcript Tab ─────────────────────────────────────────────
const TranscriptTab = memo(function TranscriptTab({
  transcripts,
  activeIdx,
  onSeek,
}: {
  transcripts: VideoTranscript[]
  activeIdx: number
  onSeek: (seconds: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Block auto-scroll for a window after user clicks a line, so the
  // layout doesn't shift under their cursor and steal subsequent clicks.
  const suppressScrollUntilRef = useRef(0)

  // Auto-scroll active line into view (only when fully off-screen)
  useEffect(() => {
    if (activeIdx < 0 || !containerRef.current) return
    if (performance.now() < suppressScrollUntilRef.current) return

    const container = containerRef.current
    const el = container.querySelector<HTMLButtonElement>(
      `[data-idx="${activeIdx}"]`
    )
    if (!el) return

    // Skip scrolling if the line is already visible in the viewport
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const fullyVisible =
      elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom
    if (fullyVisible) return

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeIdx])

  const handleClick = (seconds: number) => {
    // Block auto-scroll for 2 seconds after a click so the cursor stays put
    suppressScrollUntilRef.current = performance.now() + 2000
    onSeek(seconds)
  }

  if (!transcripts.length) {
    return (
      <p
        className="text-xs text-center py-8"
        style={{ color: 'var(--color-text-muted)' }}
      >
        스크립트가 없습니다
      </p>
    )
  }

  return (
    <div ref={containerRef} className="p-3 space-y-1">
      {transcripts.map((t, idx) => {
        const isActive = idx === activeIdx
        return (
          <button
            key={t.id}
            data-idx={idx}
            onClick={() => handleClick(t.start_seconds)}
            className="w-full flex gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-white/5"
            style={{
              backgroundColor: isActive
                ? 'rgba(212, 168, 83, 0.12)'
                : 'transparent',
            }}
          >
            <div
              className="flex-shrink-0 text-[11px] font-mono pt-0.5"
              style={{
                color: isActive
                  ? 'var(--color-gold)'
                  : 'var(--color-text-muted)',
                minWidth: '36px',
              }}
            >
              {formatTimestamp(t.start_seconds)}
            </div>
            <div
              className="text-xs leading-relaxed flex-1"
              style={{
                color: isActive
                  ? 'var(--color-text)'
                  : 'var(--color-text-secondary)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {t.text}
            </div>
          </button>
        )
      })}
    </div>
  )
})

// ─── Related Tab ────────────────────────────────────────────────
const RelatedTab = memo(function RelatedTab({
  videos,
  currentVideoId,
  onSelect,
}: {
  videos: RelatedVideo[]
  currentVideoId: string | null
  onSelect: (v: RelatedVideo) => void
}) {
  const [pendingId, setPendingId] = useState<string | null>(null)

  // Clear the pending state once the parent has actually switched
  useEffect(() => {
    if (pendingId && currentVideoId === pendingId) {
      const t = setTimeout(() => setPendingId(null), 400)
      return () => clearTimeout(t)
    }
  }, [currentVideoId, pendingId])

  const handleClick = (v: RelatedVideo) => {
    if (v.id === currentVideoId) return // already playing
    setPendingId(v.id)
    // Give the user a moment of visual feedback before swapping the video
    setTimeout(() => {
      onSelect(v)
    }, 180)
  }

  return (
    <div className="p-3 space-y-2">
      {videos.map((v) => {
        const isPending = pendingId === v.id
        const isCurrent = v.id === currentVideoId && !isPending
        const isHighlighted = isPending || isCurrent
        return (
          <button
            key={v.id}
            onClick={() => handleClick(v)}
            disabled={isCurrent}
            className="w-full flex gap-3 p-2 rounded-lg text-left transition-colors hover:bg-white/5 disabled:cursor-default"
            style={{
              backgroundColor: isHighlighted
                ? 'rgba(212, 168, 83, 0.12)'
                : 'transparent',
              border: isHighlighted
                ? '1px solid rgba(212, 168, 83, 0.4)'
                : '1px solid transparent',
            }}
          >
            <div className="flex-shrink-0 relative w-28 aspect-video rounded overflow-hidden">
              {v.thumbnail_url ? (
                <img
                  src={v.thumbnail_url}
                  alt={v.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <Play size={16} className="text-white/40" />
                </div>
              )}
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                  <Loader2
                    size={20}
                    className="animate-spin"
                    style={{ color: 'var(--color-gold)' }}
                  />
                </div>
              )}
              {isCurrent && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-gold)' }}
                  >
                    <Play size={10} className="text-black" fill="currentColor" />
                    <span className="text-[9px] font-bold text-black">재생 중</span>
                  </div>
                </div>
              )}
              {v.duration_seconds && !isCurrent && (
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] text-white font-medium">
                  {formatDuration(v.duration_seconds)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="text-xs font-semibold line-clamp-2 mb-1"
                style={{
                  color: isHighlighted
                    ? 'var(--color-gold)'
                    : 'var(--color-text)',
                }}
              >
                {v.title}
              </h4>
              <p
                className="text-[11px] line-clamp-2 leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {isPending
                  ? '재생 준비 중...'
                  : isCurrent
                  ? '현재 재생 중인 영상입니다'
                  : v.summary}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
})

// ─── Sidebar (memoized) ─────────────────────────────────────────
interface SidebarProps {
  video: RelatedVideo
  relatedVideos: RelatedVideo[]
  activeChapterIdx: number
  activeTranscriptIdx: number
  currentVideoId: string
  onSeek: (seconds: number) => void
  onSelectRelated: (v: RelatedVideo) => void
}

const Sidebar = memo(function Sidebar({
  video,
  relatedVideos,
  activeChapterIdx,
  activeTranscriptIdx,
  currentVideoId,
  onSeek,
  onSelectRelated,
}: SidebarProps) {
  const [tab, setTab] = useState<SideTab>('timeline')

  const frames = video.video_frames ?? []
  const transcripts = video.video_transcripts ?? []
  const duration = video.duration_seconds ?? 0

  return (
    <aside
      className="lg:w-96 lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l flex flex-col"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h3 className="text-sm font-bold flex items-center gap-2">
          <List size={16} style={{ color: 'var(--color-gold)' }} />
          영상 정보
        </h3>
      </div>
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setTab('timeline')}
          className="flex-1 px-3 py-3 text-xs font-medium transition-colors relative"
          style={{
            color: tab === 'timeline' ? 'var(--color-gold)' : 'var(--color-text-muted)',
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            <FileText size={13} />
            타임라인
          </span>
          {tab === 'timeline' && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          )}
        </button>
        <button
          onClick={() => setTab('transcript')}
          className="flex-1 px-3 py-3 text-xs font-medium transition-colors relative"
          style={{
            color: tab === 'transcript' ? 'var(--color-gold)' : 'var(--color-text-muted)',
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            <AlignLeft size={13} />
            스크립트
          </span>
          {tab === 'transcript' && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          )}
        </button>
        <button
          onClick={() => setTab('related')}
          className="flex-1 px-3 py-3 text-xs font-medium transition-colors relative"
          style={{
            color: tab === 'related' ? 'var(--color-gold)' : 'var(--color-text-muted)',
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Play size={13} />
            관련 영상
          </span>
          {tab === 'related' && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--color-gold)' }}
            />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-220px)]">
        {tab === 'timeline' && (
          <TimelineTab
            frames={frames}
            duration={duration}
            activeIdx={activeChapterIdx}
            onSeek={onSeek}
          />
        )}
        {tab === 'transcript' && (
          <TranscriptTab
            transcripts={transcripts}
            activeIdx={activeTranscriptIdx}
            onSeek={onSeek}
          />
        )}
        {tab === 'related' && (
          <RelatedTab
            videos={relatedVideos}
            currentVideoId={currentVideoId}
            onSelect={onSelectRelated}
          />
        )}
      </div>
    </aside>
  )
})

// ─── Main Component ─────────────────────────────────────────────
export default function LearnClient({ videos }: LearnClientProps) {
  const [activeVideo, setActiveVideo] = useState<RelatedVideo | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState<VideoFrame | null>(null)
  // Throttled active indices — updated ~2x per second instead of 60x
  const [activeChapterIdx, setActiveChapterIdx] = useState(-1)
  const [activeTranscriptIdx, setActiveTranscriptIdx] = useState(-1)
  const playerRef = useRef<VideoPlayerHandle>(null)
  const lastUpdateRef = useRef(0)
  // Suppress auto-update for a moment after user click so the throttled
  // time-update callback doesn't overwrite the immediate selection.
  const userActionAtRef = useRef(0)

  const closeModal = () => {
    setActiveVideo(null)
    setShowPlayer(false)
    setSelectedFrame(null)
    setActiveChapterIdx(-1)
    setActiveTranscriptIdx(-1)
  }

  // Compute active chapter/transcript indices from a given time
  const computeActiveIndices = useCallback(
    (currentTime: number, video: RelatedVideo) => {
      const frames = video.video_frames ?? []
      const dur = video.duration_seconds ?? 0
      let newChapterIdx = -1
      if (frames.length && dur) {
        frames.forEach((frame, idx) => {
          const frameTime = (frame.timestamp_percent / 100) * dur
          if (currentTime >= frameTime) newChapterIdx = idx
        })
      }
      const transcripts = video.video_transcripts ?? []
      let newTranscriptIdx = -1
      if (transcripts.length) {
        transcripts.forEach((t, idx) => {
          if (currentTime >= t.start_seconds) newTranscriptIdx = idx
        })
      }
      return { chapterIdx: newChapterIdx, transcriptIdx: newTranscriptIdx }
    },
    []
  )

  // Keep activeVideo in a ref so callbacks don't need to be recreated
  // every time the video changes — this prevents VideoPlayer from getting
  // a new onTimeChange identity and avoids unrelated rerenders.
  const activeVideoRef = useRef<RelatedVideo | null>(null)
  useEffect(() => {
    activeVideoRef.current = activeVideo
  }, [activeVideo])

  const handleSeek = useCallback(
    (seconds: number) => {
      // Mark this as a user action so time-update throttling doesn't fight it
      userActionAtRef.current = performance.now()
      playerRef.current?.seekTo(seconds)

      // Immediately set the active indices for snappy feedback
      const video = activeVideoRef.current
      if (video) {
        const { chapterIdx, transcriptIdx } = computeActiveIndices(seconds, video)
        // React 18 auto-batches these in event handlers
        setActiveChapterIdx(chapterIdx)
        setActiveTranscriptIdx(transcriptIdx)
      }
    },
    [computeActiveIndices]
  )

  const handleTimeChange = useCallback(
    (currentTime: number) => {
      // Skip auto-update briefly after a user click so the click-set value
      // isn't overwritten by stale time-updates from before the seek lands
      const now = performance.now()
      if (now - userActionAtRef.current < 800) return
      // Throttle: update at most every 250ms
      if (now - lastUpdateRef.current < 250) return
      lastUpdateRef.current = now

      const video = activeVideoRef.current
      if (!video) return

      const { chapterIdx, transcriptIdx } = computeActiveIndices(currentTime, video)
      setActiveChapterIdx((prev) => (prev !== chapterIdx ? chapterIdx : prev))
      setActiveTranscriptIdx((prev) =>
        prev !== transcriptIdx ? transcriptIdx : prev
      )
    },
    [computeActiveIndices]
  )

  const handleSelectRelated = useCallback((v: RelatedVideo) => {
    setActiveVideo(v)
    setShowPlayer(true)
    setActiveChapterIdx(-1)
    setActiveTranscriptIdx(-1)
    lastUpdateRef.current = 0
    userActionAtRef.current = 0
  }, [])

  // Show all videos in the related list in their original order so
  // clicking one keeps focus in the same spot. The currently playing
  // video stays at its original position and is just visually marked.
  const relatedVideos = videos

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
        <p
          className="text-base md:text-lg max-w-2xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
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
                onClick={() => {
                  setActiveVideo(video)
                  setShowPlayer(true)
                }}
                className="w-full text-left group rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all h-full flex flex-col"
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
                    <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-neutral-900 flex items-center justify-center">
                      <Play size={40} className="text-[var(--color-gold)]/60" />
                    </div>
                  )}
                  {video.duration_seconds && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm flex items-center gap-1">
                      <Clock size={12} className="text-white/80" />
                      <span className="text-xs text-white font-medium">
                        {formatDuration(video.duration_seconds)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/60 border-2 border-[var(--color-gold)] flex items-center justify-center">
                      <Play size={22} className="text-[var(--color-gold)] ml-0.5" />
                    </div>
                  </div>
                </div>
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
          className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="min-h-full flex items-start justify-center sm:p-4 sm:py-8">
            <div
              className="w-full max-w-7xl sm:rounded-2xl overflow-hidden sm:shadow-2xl relative"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                aria-label="닫기"
              >
                <X size={20} />
              </button>

              {showPlayer ? (
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Video player + info */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-black">
                      <VideoPlayer
                        ref={playerRef}
                        key={activeVideo.id}
                        src={activeVideo.video_url}
                        hdSrc={activeVideo.hd_video_url}
                        title={activeVideo.title}
                        poster={activeVideo.thumbnail_url || undefined}
                        autoPlay
                        onTimeChange={handleTimeChange}
                      />
                    </div>
                    <div className="p-5 md:p-6">
                      <h2 className="text-xl md:text-2xl font-bold mb-2">
                        {activeVideo.title}
                      </h2>
                      {activeVideo.duration_seconds && (
                        <div
                          className="flex items-center gap-2 text-sm mb-4"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Clock size={14} />
                          <span>{formatDuration(activeVideo.duration_seconds)}</span>
                        </div>
                      )}
                      {activeVideo.summary && (
                        <p
                          className="text-sm md:text-base leading-relaxed mb-5"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {activeVideo.summary}
                        </p>
                      )}
                      {activeVideo.key_points && activeVideo.key_points.length > 0 && (
                        <div>
                          <h3
                            className="text-xs tracking-[0.15em] uppercase mb-3 font-medium"
                            style={{ color: 'var(--color-gold)' }}
                          >
                            핵심 포인트
                          </h3>
                          <ul className="space-y-2">
                            {activeVideo.key_points.map((point, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 text-sm"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                <div
                                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                                  style={{
                                    backgroundColor: 'var(--color-gold)',
                                    color: '#000',
                                  }}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <Sidebar
                    video={activeVideo}
                    relatedVideos={relatedVideos}
                    activeChapterIdx={activeChapterIdx}
                    activeTranscriptIdx={activeTranscriptIdx}
                    currentVideoId={activeVideo.id}
                    onSeek={handleSeek}
                    onSelectRelated={handleSelectRelated}
                  />
                </div>
              ) : (
                <>
                  <div className="relative aspect-video bg-black">
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
                  </div>

                  <div className="p-6 md:p-8">
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
                              <span className="text-sm md:text-base leading-relaxed">
                                {point}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Frame detail lightbox */}
      {selectedFrame && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95"
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
