'use client'

import { useState } from 'react'
import RatingStars from './RatingStars'
import { Star, Send, CheckCircle, Loader2, ChevronDown } from 'lucide-react'

interface ExistingReview {
  rating: number
  comment: string | null
}

interface Props {
  bookingId: string
  photographerName: string
  existingReview: ExistingReview | null
}

export default function ReviewButton({ bookingId, photographerName, existingReview }: Props) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [review, setReview] = useState<ExistingReview | null>(existingReview)
  const [error, setError] = useState('')

  // ── Already reviewed ──────────────────────────────────────────────────────
  if (review) {
    return (
      <div className="flex items-center gap-1.5">
        <RatingStars value={review.rating} size="sm" />
        {review.comment && (
          <span className="text-[10px] text-gray-400 italic truncate max-w-[100px]">
            {review.comment}
          </span>
        )}
      </div>
    )
  }

  // ── Post-submission confirmation ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        تم التقييم
      </div>
    )
  }

  // ── Review form ───────────────────────────────────────────────────────────
  if (open) {
    return (
      <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2.5 text-sm">
        <p className="font-semibold text-gray-700 text-xs">تقييم {photographerName}</p>

        {/* Star picker */}
        <div className="flex items-center gap-2">
          <RatingStars value={rating} onChange={setRating} size="md" />
          {rating > 0 && (
            <span className="text-xs text-amber-600 font-medium">
              {['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'][rating]}
            </span>
          )}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقاً (اختياري)..."
          rows={2}
          maxLength={300}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 resize-none"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={submitting || rating === 0}
            onClick={async () => {
              if (rating === 0) { setError('اختر تقييماً من 1 إلى 5 نجوم'); return }
              setSubmitting(true)
              setError('')
              try {
                const res = await fetch('/api/reviews', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ bookingId, rating, comment: comment.trim() || null }),
                })
                const data = await res.json()
                if (!res.ok) { setError(data.error ?? 'حدث خطأ'); setSubmitting(false); return }
                setReview({ rating, comment: comment.trim() || null })
                setSubmitted(true)
              } catch {
                setError('حدث خطأ في الشبكة')
                setSubmitting(false)
              }
            }}
            className="flex items-center gap-1.5 bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {submitting
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Send className="w-3 h-3" />}
            إرسال التقييم
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    )
  }

  // ── Trigger button ────────────────────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-1 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
    >
      <Star className="w-3 h-3" />
      تقييم
    </button>
  )
}
