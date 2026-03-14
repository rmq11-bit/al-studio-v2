'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Images, Trash2, Loader2 } from 'lucide-react'

interface AdminMedia {
  id: string
  url: string
  caption: string | null
  type: string
  createdAt: string
  photographer: { user: { name: string } }
}

export default function AdminMediaPage() {
  const { data: session, status } = useSession()
  const [media, setMedia] = useState<AdminMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') window.location.href = '/'
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    fetch('/api/admin/media').then((r) => r.json()).then((d) => { setMedia(d); setLoading(false) })
  }, [status, session])

  async function handleDelete(id: string) {
    if (!confirm('حذف هذه الصورة نهائياً؟')) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Images className="w-5 h-5 text-indigo-600" />
          إدارة الوسائط
        </h1>
        <span className="text-sm text-gray-400">({media.length})</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : media.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Images className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>لا توجد صور</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={item.url}
                alt={item.caption ?? 'صورة'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-[10px] text-center font-medium truncate w-full px-1">
                  {item.photographer.user.name}
                </p>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deletingId === item.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
