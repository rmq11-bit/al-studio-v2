'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Camera, Loader2, ExternalLink, ShieldOff, ShieldCheck, BadgeCheck, Trash2, Zap } from 'lucide-react'

interface AdminPhotographer {
  id: string
  userId: string
  hourlyRate: number
  location: string | null
  isActive: boolean
  isPro: boolean
  verifiedBadge: boolean
  createdAt: string
  user: { name: string; email: string; isBanned: boolean }
  _count: { media: number; bookings: number }
}

export default function AdminPhotographersPage() {
  const { data: session, status } = useSession()
  const [photographers, setPhotographers] = useState<AdminPhotographer[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') window.location.href = '/'
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    fetch('/api/admin/photographers')
      .then((r) => r.json())
      .then((d) => { setPhotographers(d); setLoading(false) })
  }, [status, session])

  async function patch(
    id: string,
    updates: Partial<Pick<AdminPhotographer, 'isActive' | 'isPro' | 'verifiedBadge'>>
  ) {
    setActionId(id)
    const res = await fetch(`/api/admin/photographers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setActionId(null)
    // Use the local updates object (not server response) to preserve nested user field
    if (res.ok) {
      setPhotographers((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p))
    }
  }

  async function deletePhotographer(id: string) {
    if (!confirm('حذف هذا المصور نهائياً؟ سيتم حذف جميع بياناته ووسائطه.')) return
    setActionId(id)
    const res = await fetch(`/api/admin/photographers/${id}`, { method: 'DELETE' })
    setActionId(null)
    if (res.ok) setPhotographers((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          إدارة المصورين
        </h1>
        <span className="text-sm text-gray-400">({photographers.length})</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : photographers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>لا يوجد مصورون</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['المصور', 'الموقع / السعر', 'الحالة', 'وسائط', 'حجوزات', 'باجات', 'إجراءات'].map((h) => (
                    <th key={h} className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {photographers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{p.user.name}</p>
                      <p className="text-xs text-gray-400">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 text-xs">{p.location ?? '—'}</p>
                      <p className="text-xs text-gray-400">{p.hourlyRate} ر.س/ساعة</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.user.isBanned
                          ? 'bg-red-50 text-red-600'
                          : p.isActive
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.user.isBanned ? 'محظور' : p.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p._count.media}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p._count.bookings}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.isPro && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-50 text-amber-600 font-medium">PRO</span>
                        )}
                        {p.verifiedBadge && (
                          <BadgeCheck className="w-4 h-4 text-indigo-500" />
                        )}
                        {!p.isPro && !p.verifiedBadge && (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Toggle isActive */}
                        <button
                          onClick={() => patch(p.id, { isActive: !p.isActive })}
                          disabled={actionId === p.id || p.user.isBanned}
                          title={p.isActive ? 'إيقاف الملف' : 'تفعيل الملف'}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            p.isActive
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {actionId === p.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : p.isActive
                            ? <ShieldOff className="w-3.5 h-3.5" />
                            : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>

                        {/* Toggle PRO */}
                        <button
                          onClick={() => patch(p.id, { isPro: !p.isPro })}
                          disabled={actionId === p.id}
                          title={p.isPro ? 'إلغاء PRO' : 'منح PRO'}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            p.isPro
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Verified */}
                        <button
                          onClick={() => patch(p.id, { verifiedBadge: !p.verifiedBadge })}
                          disabled={actionId === p.id}
                          title={p.verifiedBadge ? 'إلغاء التوثيق' : 'منح التوثيق'}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            p.verifiedBadge
                              ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                        </button>

                        {/* View public profile */}
                        <Link
                          href={`/photographer/${p.userId}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="عرض الملف الشخصي"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => deletePhotographer(p.id)}
                          disabled={actionId === p.id}
                          title="حذف الحساب"
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
