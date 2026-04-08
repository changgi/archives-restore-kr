'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  RotateCcw,
} from 'lucide-react'
import type { OriginalDocument, DocumentPage } from '@/types'

interface DocumentViewerProps {
  documents: (OriginalDocument & { document_pages: DocumentPage[] })[]
  storyTitle: string
}

export default function DocumentViewer({ documents, storyTitle }: DocumentViewerProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const selectedDoc = documents[selectedDocIndex]
  const pages = selectedDoc?.document_pages
    ?.slice()
    .sort((a, b) => a.page_number - b.page_number) || []
  const currentPageData = pages[currentPage]
  const totalPages = pages.length

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page)
      setImageLoaded(false)
    }
  }, [totalPages])

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage])
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage])

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.25, 3)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.25, 0.5)), [])
  const resetZoom = useCallback(() => setZoom(1), [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevPage()
          break
        case 'ArrowRight':
          nextPage()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen()
            setIsFullscreen(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevPage, nextPage, zoomIn, zoomOut, isFullscreen])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPage()
      else prevPage()
    }
    setTouchStart(null)
  }

  // Document selection
  const selectDocument = (index: number) => {
    setSelectedDocIndex(index)
    setCurrentPage(0)
    setZoom(1)
    setImageLoaded(false)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p style={{ color: 'var(--color-text-muted)' }}>원문 자료가 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex h-screen bg-neutral-950 text-white overflow-hidden"
    >
      {/* Sidebar */}
      <div
        className={`
          ${sidebarOpen ? 'w-72' : 'w-0'}
          transition-all duration-300 flex-shrink-0 overflow-hidden
          border-r border-white/10 bg-neutral-900
          ${sidebarOpen ? 'md:w-72' : 'md:w-0'}
        `}
      >
        <div className="w-72 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10">
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-gold)' }}>
              원문 자료
            </p>
            <h2 className="text-sm font-medium text-white/80 line-clamp-2">
              {storyTitle}
            </h2>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto p-2">
            {documents.map((doc, i) => (
              <button
                key={doc.id}
                onClick={() => selectDocument(i)}
                className={`
                  w-full text-left p-3 rounded-lg mb-1 transition-all
                  ${i === selectedDocIndex
                    ? 'bg-white/10 border border-white/20'
                    : 'hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-bold
                      ${i === selectedDocIndex ? 'bg-[var(--color-gold)] text-black' : 'bg-white/10 text-white/50'}
                    `}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium line-clamp-2 ${i === selectedDocIndex ? 'text-white' : 'text-white/70'}`}>
                      {doc.title}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-white/40 mt-1 line-clamp-1">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-white/30 mt-1">
                      {doc.document_pages?.length || 0}p
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/80 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <span className="text-sm text-white/60 hidden sm:inline truncate max-w-[200px]">
              {selectedDoc?.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <button onClick={zoomOut} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="축소">
              <ZoomOut size={16} />
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 rounded text-xs text-white/60 hover:bg-white/10 transition-colors min-w-[50px] text-center"
              title="배율 초기화"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={zoomIn} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="확대">
              <ZoomIn size={16} />
            </button>

            <div className="w-px h-5 bg-white/20 mx-1" />

            <button onClick={resetZoom} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="원래 크기">
              <RotateCcw size={16} />
            </button>
            <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="전체화면">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* Page indicator */}
          <div className="text-sm text-white/60">
            <span className="text-white font-medium">{currentPage + 1}</span>
            <span> / {totalPages}</span>
          </div>
        </div>

        {/* Image Viewer */}
        <div
          ref={imageContainerRef}
          className="flex-1 overflow-auto flex items-center justify-center relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Nav button - Left */}
          {currentPage > 0 && (
            <button
              onClick={prevPage}
              className="absolute left-2 md:left-4 z-10 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 transition-all group"
              title="이전 페이지"
            >
              <ChevronLeft size={24} className="text-white/70 group-hover:text-white" />
            </button>
          )}

          {/* Nav button - Right */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={nextPage}
              className="absolute right-2 md:right-4 z-10 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 transition-all group"
              title="다음 페이지"
            >
              <ChevronRight size={24} className="text-white/70 group-hover:text-white" />
            </button>
          )}

          {/* Page Image */}
          {currentPageData ? (
            <div
              className="p-4 md:p-8 transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              {!imageLoaded && (
                <div className="flex items-center justify-center w-[600px] max-w-full aspect-[3/4]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-white/40">페이지 로딩 중...</p>
                  </div>
                </div>
              )}
              <img
                src={currentPageData.image_url}
                alt={currentPageData.alt_text || `${selectedDoc?.title} - ${currentPageData.page_number}페이지`}
                className={`max-h-[80vh] w-auto shadow-2xl rounded transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/40">페이지를 선택하세요</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 border-t border-white/10 bg-neutral-900/80">
            <div className="flex gap-2 p-2 overflow-x-auto">
              {pages.map((page, i) => (
                <button
                  key={page.id}
                  onClick={() => goToPage(i)}
                  className={`
                    flex-shrink-0 w-14 h-18 md:w-16 md:h-20 rounded overflow-hidden
                    border-2 transition-all relative group
                    ${i === currentPage
                      ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/50'
                      : 'border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <img
                    src={page.image_url}
                    alt={`${page.page_number}p`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className={`
                    absolute inset-0 flex items-end justify-center pb-0.5
                    ${i === currentPage ? 'bg-black/30' : 'bg-black/50 group-hover:bg-black/30'}
                  `}>
                    <span className="text-[10px] font-medium text-white/80">{page.page_number}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
