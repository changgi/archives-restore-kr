'use client'

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  modal?: boolean
  onClose?: () => void
  onTimeChange?: (currentTime: number) => void
}

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void
  play: () => void
  pause: () => void
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  { src, poster, title, modal = false, onClose, onTimeChange },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds
        videoRef.current.play()
        setPlaying(true)
      }
    },
    play: () => {
      videoRef.current?.play()
      setPlaying(true)
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

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }, [])

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
        src={src}
        poster={poster || undefined}
        className="w-full h-full aspect-video object-contain bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div
          className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2 group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full rounded-full transition-all"
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
