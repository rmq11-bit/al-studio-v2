'use client'

interface Props {
  /** Current value (1–5). For display mode can be a float (e.g. 4.3). */
  value: number
  /** Provide onChange to make stars interactive (input mode). */
  onChange?: (rating: number) => void
  /** Visual size */
  size?: 'sm' | 'md' | 'lg'
  /** Hover state — managed internally when onChange is provided */
  className?: string
}

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

import { useState } from 'react'

export default function RatingStars({ value, onChange, size = 'md', className = '' }: Props) {
  const [hovered, setHovered] = useState(0)
  const isInteractive = !!onChange
  const display = hovered || value

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star
        const half = !filled && display >= star - 0.5

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => isInteractive && setHovered(star)}
            onMouseLeave={() => isInteractive && setHovered(0)}
            className={`${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            aria-label={`${star} نجوم`}
          >
            <svg
              viewBox="0 0 20 20"
              className={SIZE_MAP[size]}
              fill={filled ? '#F59E0B' : half ? 'url(#half)' : 'none'}
              stroke={filled || half ? '#F59E0B' : '#D1D5DB'}
              strokeWidth="1.5"
            >
              <defs>
                <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
