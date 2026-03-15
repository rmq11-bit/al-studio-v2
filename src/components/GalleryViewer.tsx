'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import GalleryLightbox from './GalleryLightbox'

interface MediaItem {
  id: string
  url: string
  caption: string | null
}

export default function GalleryViewer({ media }: { media: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const total = media.length

  const handlePrev = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + total) % total : null))
  const handleNext = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % total : null))
  const handleClose = () => setLightboxIndex(null)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-300">
        <ImageIcon className="w-12 h-12 mb-3" />
        <p className="text-sm">لا توجد صور في المعرض بعد</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {media.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setLightboxIndex(idx)}
            className="aspect-square rounded-xl overflow-hidden group/img focus:outline-none focus:ring-2 focus:ring-[#C0A4A3]/50 cursor-zoom-in"
            aria-label={m.caption ?? `صورة ${idx + 1}`}
          >
            <img
              src={m.url}
              alt={m.caption ?? 'صورة'}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={media}
          currentIndex={lightboxIndex}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  )
}
