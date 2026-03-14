'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Images, Upload, Trash2, Loader2, AlertCircle, X, CheckCircle } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  caption: string | null
  type: string
  createdAt: string
}

export default function MediaManagementPage() {
  const { data: session, status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [media, setMedia] = useState<MediaItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'PHOTOGRAPHER') {
      window.location.href = '/'
    }
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/photographer/media')
      .then((r) => r.json())
      .then((data) => { setMedia(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [status])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  function clearSelection() {
    setSelectedFile(null)
    setPreview(null)
    setCaption('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleUpload() {
    if (!selectedFile) return
    setError('')
    setSuccess('')
    setUploading(true)

    const fd = new FormData()
    fd.append('file', selectedFile)
    if (caption.trim()) fd.append('caption', caption.trim())

    const res = await fetch('/api/photographer/media', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)

    if (!res.ok) {
      setError(data.error ?? 'فشل الرفع')
      return
    }

    setMedia((prev) => [data, ...prev])
    setSuccess('تم رفع الصورة بنجاح')
    clearSelection()
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/photographer/media/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) {
      setMedia((prev) => prev.filter((m) => m.id !== id))
    } else {
      setError('فشل حذف الصورة')
    }
  }

  if (fetching || status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C0A4A3] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Images className="w-6 h-6 text-[#C0A4A3]" />
            معرض الأعمال
            <span className="text-sm font-normal text-gray-400 mr-2">({media.length} / 30)</span>
          </h1>

          {/* Upload card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C0A4A3]" />
              رفع صورة جديدة
            </h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />{success}
              </div>
            )}

            {!preview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-10 cursor-pointer hover:border-[#C0A4A3]/50 hover:bg-[#C0A4A3]/5 transition-all">
                <Upload className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">اضغط لاختيار صورة</p>
                <p className="text-xs text-gray-400 mt-1">JPG، PNG، WEBP — حتى 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Preview */}
                <div className="relative shrink-0">
                  <img
                    src={preview}
                    alt="معاينة"
                    className="w-40 h-40 object-cover rounded-xl border border-gray-100"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Caption + upload button */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      وصف الصورة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="مثال: حفل زفاف في الرياض"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-[#C0A4A3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'جاري الرفع...' : 'رفع الصورة'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gallery grid */}
          {media.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <Images className="w-16 h-16 mx-auto mb-3" />
              <p className="text-sm">لا توجد صور بعد — ارفع أول صورة</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {media.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.caption ?? 'صورة'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
                      title="حذف"
                    >
                      {deletingId === item.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
