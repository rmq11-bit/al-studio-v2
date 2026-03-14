'use client'

import { useState } from 'react'
import { Banknote, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  projectId: string
  photographerId: string
}

export default function ProposalForm({ projectId, photographerId }: Props) {
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('أدخل سعراً صحيحاً')
      return
    }

    setLoading(true)

    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, photographerId, price: parsedPrice, message }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'حدث خطأ أثناء إرسال العرض')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="font-bold text-gray-800">تم إرسال عرضك!</p>
        <p className="text-sm text-gray-400 mt-1">
          سيتواصل معك العميل عند قبول العرض.
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-[#C0A4A3]" />
          سعر العرض (ريال)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="1"
          placeholder="مثال: 500"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-[#C0A4A3]" />
          رسالة للعميل (اختياري)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="اشرح لماذا أنت المصور المناسب لهذا المشروع..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-[#C0A4A3] text-white py-3 rounded-xl font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-60"
      >
        <Send className="w-4 h-4" />
        {loading ? 'جاري الإرسال...' : 'إرسال العرض'}
      </button>
    </form>
  )
}
