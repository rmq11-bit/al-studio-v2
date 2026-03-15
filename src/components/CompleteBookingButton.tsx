'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  bookingId: string
  /** Called after the server confirms COMPLETED so the parent can re-render */
  onCompleted?: () => void
}

export default function CompleteBookingButton({ bookingId, onCompleted }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  async function handleComplete() {
    if (!confirm('هل تأكد أن الجلسة انتهت وتريد تمييز هذا الحجز كمكتمل؟')) return
    setLoading(true)

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: 'COMPLETED' }),
    })

    setLoading(false)

    if (res.ok) {
      setDone(true)
      onCompleted?.()
      // Reload so status badges refresh without a full rearchitecture
      setTimeout(() => window.location.reload(), 800)
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
        <CheckCircle className="w-3.5 h-3.5" />
        تم التأكيد
      </span>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <CheckCircle className="w-3.5 h-3.5" />}
      تأكيد اكتمال الجلسة
    </button>
  )
}
