'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CalendarDays, Loader2 } from 'lucide-react'

interface AdminBooking {
  id: string
  date: string
  hours: number
  status: string
  notes: string | null
  createdAt: string
  consumer: { name: string; email: string }
  photographer: { user: { name: string } }
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'معلق',   cls: 'bg-yellow-50 text-yellow-600' },
  ACCEPTED:  { label: 'مقبول',  cls: 'bg-green-50 text-green-600' },
  REJECTED:  { label: 'مرفوض', cls: 'bg-red-50 text-red-600' },
  COMPLETED: { label: 'مكتمل', cls: 'bg-blue-50 text-blue-600' },
}

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']

export default function AdminBookingsPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') window.location.href = '/'
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((d) => { setBookings(d); setLoading(false) })
  }, [status, session])

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
          إدارة الحجوزات
        </h1>
        <span className="text-sm text-gray-400">({bookings.length})</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'ALL' ? 'الكل' : STATUS_MAP[s]?.label}
            {s !== 'ALL' && (
              <span className="mr-1 opacity-60">
                ({bookings.filter((b) => b.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>لا توجد حجوزات</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['العميل', 'المصور', 'التاريخ', 'الساعات', 'الحالة', 'التسجيل'].map((h) => (
                    <th key={h} className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{b.consumer.name}</p>
                      <p className="text-xs text-gray-400">{b.consumer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{b.photographer.user.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{b.date}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{b.hours} ساعة</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[b.status]?.cls}`}>
                        {STATUS_MAP[b.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(b.createdAt).toLocaleDateString('ar-SA')}
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
