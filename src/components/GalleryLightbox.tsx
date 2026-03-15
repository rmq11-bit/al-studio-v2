'use client'

import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: { url: string; caption: string | null }[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function GalleryLightbox({ images, currentIndex, onClose, onPrev, onNext }: Props) {
  const image = images[currentIndex]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onPrev()   // RTL: right = previous
      if (e.key === 'ArrowLeft') onNext()    // RTL: left  = next
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!image) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        aria-label="إغلاق"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 text-white/60 text-sm tabular-nums select-none">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Prev (right side in RTL) */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
          aria-label="السابق"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Next (left side in RTL) */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
          aria-label="التالي"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main image — stopPropagation so clicking image doesn't close */}
      <img
        src={image.url}
        alt={image.caption ?? 'صورة'}
        className="max-h-[90vh] max-w-[88vw] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Caption */}
      {image.caption && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm text-center max-w-xs pointer-events-none">
          {image.caption}
        </div>
      )}
    </div>
  )
}
