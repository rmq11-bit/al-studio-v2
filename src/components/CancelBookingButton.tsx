'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Props {
  bookingId: string
}

export default function CancelBookingButton({ bookingId }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('هل تريد إلغاء طلب الحجز هذا؟')) return
    setLoading(true)

    const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })

    setLoading(false)

    if (res.ok) {
      window.location.reload()
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <X className="w-3.5 h-3.5" />}
      إلغاء الطلب
    </button>
  )
}
