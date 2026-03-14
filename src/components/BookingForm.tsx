'use client'

import { useState } from 'react'
import { CalendarDays, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  photographerId: string
  consumerId: string
  blockedDates: string[]       // YYYY-MM-DD strings — dates the photographer is unavailable
  hourlyRate: number
}

export default function BookingForm({
  photographerId,
  consumerId,
  blockedDates,
  hourlyRate,
}: Props) {
  const [date, setDate] = useState('')
  const [hours, setHours] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Today in YYYY-MM-DD (local time, not UTC)
  const today = new Date().toLocaleDateString('sv-SE') // sv-SE gives YYYY-MM-DD

  const isBlocked = blockedDates.includes(date)
  const totalCost = hours * hourlyRate

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) { setError('اختر تاريخاً للحجز'); return }
    if (isBlocked) { setError('هذا التاريخ غير متاح'); return }

    setError('')
    setLoading(true)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photographerId, consumerId, date, hours, notes }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'حدث خطأ أثناء الحجز')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="font-bold text-gray-800">تم إرسال طلب الحجز!</p>
        <p className="text-sm text-gray-400 mt-1">
          سيتواصل معك المصور خلال 24 ساعة للتأكيد.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2.5 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-[#C0A4A3]" />
          تاريخ الجلسة
        </label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          required
          className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
            isBlocked
              ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:border-[#C0A4A3] focus:ring-[#C0A4A3]/20'
          }`}
        />
        {isBlocked && (
          <p className="text-xs text-red-500 mt-1">هذا التاريخ غير متاح — اختر تاريخاً آخر</p>
        )}
      </div>

      {/* Hours */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#C0A4A3]" />
          عدد الساعات
        </label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={12}
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#C0A4A3]" />
          ملاحظات (اختياري)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="أخبر المصور بتفاصيل المناسبة أو متطلباتك..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all resize-none"
        />
      </div>

      {/* Cost preview */}
      {date && !isBlocked && (
        <div className="bg-[#C0A4A3]/5 rounded-xl px-4 py-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>{hourlyRate.toLocaleString('ar-SA')} ريال × {hours} ساعة</span>
            <span className="font-bold text-gray-800">
              {totalCost.toLocaleString('ar-SA')} ريال
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || isBlocked}
        className="bg-[#C0A4A3] text-white py-3 rounded-xl font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-60"
      >
        {loading ? 'جاري الإرسال...' : 'إرسال طلب الحجز'}
      </button>
    </form>
  )
}
