'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FolderOpen, Clock, Banknote, FileText, Send, AlertCircle } from 'lucide-react'

export default function NewProjectPage() {
  const { data: session, status } = useSession()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState(1)
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not a consumer (done client-side; proxy handles server-side)
  if (status === 'authenticated' && session.user.role !== 'CONSUMER') {
    window.location.href = '/'
    return null
  }

  if (status === 'unauthenticated') {
    window.location.href = '/auth/login'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (title.trim().length < 5) {
      setError('العنوان قصير جداً — 5 أحرف على الأقل')
      return
    }

    if (description.trim().length < 20) {
      setError('الوصف قصير جداً — 20 حرفاً على الأقل')
      return
    }

    setLoading(true)

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        hours,
        budget: budget ? parseFloat(budget) : null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'حدث خطأ أثناء النشر')
      return
    }

    // Hard navigation to the new project page
    window.location.href = `/projects/${data.id}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-[#C0A4A3]" />
              نشر مشروع جديد
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              صف مشروعك وسيتواصل معك المصورون المناسبون
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#C0A4A3]" />
                  عنوان المشروع
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={5}
                  maxLength={100}
                  placeholder="مثال: تصوير حفل زفاف في الرياض"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  وصف المشروع
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={20}
                  rows={5}
                  placeholder="اشرح تفاصيل المناسبة، الموقع، عدد الضيوف، نوع الصور المطلوبة..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-left" dir="ltr">
                  {description.length} / 2000
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    max={24}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                  />
                </div>

                {/* Budget (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-[#C0A4A3]" />
                    الميزانية (ريال) — اختياري
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    placeholder="غير محدد"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#C0A4A3] text-white py-3 rounded-xl font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-60 mt-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'جاري النشر...' : 'نشر المشروع'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
