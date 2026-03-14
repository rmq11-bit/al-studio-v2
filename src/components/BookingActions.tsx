'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

interface BookingActionsProps {
  bookingId: string
}

export default function BookingActions({ bookingId }: BookingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')

  async function handleAccept() {
    setLoading('accept')
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!showRejectForm) {
      setShowRejectForm(true)
      return
    }
    setLoading('reject')
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionNote }),
      })
      router.refresh()
    } finally {
      setLoading(null)
      setShowRejectForm(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-yellow-100 space-y-2">
      {showRejectForm && (
        <textarea
          value={rejectionNote}
          onChange={(e) => setRejectionNote(e.target.value)}
          placeholder="سبب الرفض (اختياري)"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#C0A4A3]/30"
          rows={2}
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {loading === 'accept' ? 'جاري...' : 'قبول'}
        </button>
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          {loading === 'reject' ? 'جاري...' : showRejectForm ? 'تأكيد الرفض' : 'رفض'}
        </button>
      </div>
    </div>
  )
}
