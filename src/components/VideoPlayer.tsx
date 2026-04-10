'use client'

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Loader2 } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  hdSrc?: string | null
  poster?: string
  title?: string
  modal?: boolean
  autoPlay?: boolean
  onClose?: () => void
  onTimeChange?: (currentTime: number) => void
}

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void
  play: () => void
  pause: () => void
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  { src, hdSrc, poster, title, modal = false, autoPlay = false, onClose, onTimeChange },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffering, setBuffering] = useState(false)
  const [bufferingLong, setBufferingLong] = useState(false)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [quality, setQuality] = useState<'sd' | 'hd'>('sd')
  // Pending seek time used when seekTo() is called before metadata loads
  const pendingSeekRef = useRef<number | null>(null)
  // We always want to play after a user-triggered seek finishes
  const playAfterSeekRef = useRef(false)
  // Timer to show "longer than usual" message
  const longBufferTimerRef = useRef<number | null>(null)
  // Used when switching quality — remember position + play state
  const qualitySwitchRef = useRef<{ time: number; wasPlaying: boolean } | null>(null)

  const currentSrc = quality === 'hd' && hdSrc ? hdSrc : src

  const handleQualityToggle = useCallback(() => {
    if (!hdSrc) return
    const v = videoRef.current
    if (v) {
      qualitySwitchRef.current = {
        time: v.currentTime,
        wasPlaying: !v.paused,
      }
    }
    setQuality((q) => (q === 'sd' ? 'hd' : 'sd'))
  }, [hdSrc])

  // Tries to play and gracefully handles autoplay rejection by retrying muted
  const safePlay = (video: HTMLVideoElement) => {
    const p = video.play()
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Autoplay blocked — retry muted (most browsers allow muted autoplay)
        try {
          video.muted = true
          video.play().catch(() => {
            /* still blocked, user must click play */
          })
        } catch {
          /* ignore */
        }
      })
    }
    setPlaying(true)
  }

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      const video = videoRef.current
      if (!video) return
      // Mark that we want to play once the seek lands
      playAfterSeekRef.current = true
      // If metadata isn't loaded yet, defer the seek
      if (!video.duration || isNaN(video.duration)) {
        pendingSeekRef.current = seconds
        safePlay(video)
        return
      }
      // Show buffering immediately if jumping ahead of buffered range
      try {
        const buffered = video.buffered
        let isBuffered = false
        for (let i = 0; i < buffered.length; i++) {
          if (seconds >= buffered.start(i) && seconds <= buffered.end(i)) {
            isBuffered = true
            break
          }
        }
        if (!isBuffered) setBuffering(true)
      } catch {
        /* ignore */
      }
      try {
        video.currentTime = seconds
      } catch {
        pendingSeekRef.current = seconds
      }
      safePlay(video)
    },
    play: () => {
      const v = videoRef.current
      if (v) safePlay(v)
    },
    pause: () => {
      videoRef.current?.pause()
      setPlaying(false)
    },
  }))

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(pct)
    onTimeChange?.(videoRef.current.currentTime)
  }, [onTimeChange])

  const updateBuffered = useCallback(() => {
    const v = videoRef.current
    if (!v || !v.duration) return
    try {
      const buf = v.buffered
      if (buf.length > 0) {
        const end = buf.end(buf.length - 1)
        setBufferedPercent((end / v.duration) * 100)
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Helpers to manage the "long buffer" timer
  const startBuffering = useCallback(() => {
    setBuffering(true)
    if (longBufferTimerRef.current) clearTimeout(longBufferTimerRef.current)
    longBufferTimerRef.current = window.setTimeout(() => {
      setBufferingLong(true)
    }, 4000)
  }, [])

  const stopBuffering = useCallback(() => {
    setBuffering(false)
    setBufferingLong(false)
    if (longBufferTimerRef.current) {
      clearTimeout(longBufferTimerRef.current)
      longBufferTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (longBufferTimerRef.current) clearTimeout(longBufferTimerRef.current)
    }
  }, [])

  // Buffering events
  const handleWaiting = useCallback(() => startBuffering(), [startBuffering])
  const handlePlaying = useCallback(() => stopBuffering(), [stopBuffering])
  const handleCanPlay = useCallback(() => {
    stopBuffering()
    // If a user-triggered seek was pending playback, ensure we play
    if (playAfterSeekRef.current && videoRef.current) {
      playAfterSeekRef.current = false
      safePlay(videoRef.current)
    }
  }, [stopBuffering])
  const handleSeeking = useCallback(() => startBuffering(), [startBuffering])
  const handleSeeked = useCallback(() => {
    // If video is ready, hide buffering; otherwise wait for canplay
    const v = videoRef.current
    if (v && v.readyState >= 3) {
      stopBuffering()
      if (playAfterSeekRef.current) {
        playAfterSeekRef.current = false
        safePlay(v)
      }
    }
  }, [stopBuffering])

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration)
    // Restore position after a quality switch
    if (qualitySwitchRef.current) {
      const { time, wasPlaying } = qualitySwitchRef.current
      try {
        v.currentTime = time
      } catch {
        /* ignore */
      }
      if (wasPlaying) safePlay(v)
      qualitySwitchRef.current = null
      return
    }
    // Apply any seek that was requested before metadata was ready
    if (pendingSeekRef.current !== null) {
      try {
        v.currentTime = pendingSeekRef.current
      } catch {
        /* ignore */
      }
      pendingSeekRef.current = null
    }
    if (autoPlay && v.paused) {
      safePlay(v)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * videoRef.current.duration
  }, [])

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [modal])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const player = (
    <div className={`relative rounded-xl overflow-hidden bg-black ${modal ? 'w-full max-w-4xl' : 'w-full h-full'}`}>
      {title && modal && (
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <h3 className="text-white font-medium text-sm">{title}</h3>
        </div>
      )}

      <video
        ref={videoRef}
        src={currentSrc}
        poster={poster || undefined}
        className="w-full h-full aspect-video object-contain bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onCanPlay={handleCanPlay}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onProgress={updateBuffered}
        onLoadedData={updateBuffered}
        autoPlay={autoPlay}
        preload="auto"
        playsInline
      />

      {/* Buffering spinner overlay */}
      {buffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="flex flex-col items-center gap-3 max-w-xs px-6 text-center">
            <Loader2
              size={48}
              className="animate-spin"
              style={{ color: 'var(--color-gold)' }}
            />
            <span className="text-sm text-white font-medium">불러오는 중...</span>
            {bufferingLong && (
              <span className="text-xs text-white/70 leading-relaxed">
                해당 구간을 다운로드하고 있습니다.
                <br />
                네트워크에 따라 잠시 시간이 걸릴 수 있어요.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div
          className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2 group"
          onClick={handleProgressClick}
        >
          {/* Buffered range */}
          <div
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Playback progress */}
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: 'var(--color-gold)' }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="text-white hover:text-[var(--color-gold)] transition-colors"
            aria-label={playing ? '일시정지' : '재생'}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <span className="text-xs text-white/70">
            {formatTime((progress / 100) * duration)} / {formatTime(duration)}
          </span>
          {hdSrc && (
            <button
              onClick={handleQualityToggle}
              className="ml-auto px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-colors border"
              style={{
                color: quality === 'hd' ? '#000' : 'var(--color-gold)',
                backgroundColor:
                  quality === 'hd' ? 'var(--color-gold)' : 'rgba(0,0,0,0.4)',
                borderColor: 'var(--color-gold)',
              }}
              aria-label="화질 전환"
              title={
                quality === 'hd'
                  ? '480p로 전환 (빠름)'
                  : '원본 화질로 전환 (느림, 외부 서버)'
              }
            >
              {quality === 'hd' ? 'HD' : '480P'}
            </button>
          )}
        </div>
      </div>

      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-10"
          aria-label="재생"
        >
          <div className="w-16 h-16 rounded-full bg-black/50 border-2 border-[var(--color-gold)] flex items-center justify-center hover:scale-110 transition-transform">
            <Play size={28} className="text-[var(--color-gold)] ml-1" />
          </div>
        </button>
      )}

      {modal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 text-white/70 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <X size={24} />
        </button>
      )}
    </div>
  )

  if (modal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-4xl"
          >
            {player}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return player
})

export default VideoPlayer
