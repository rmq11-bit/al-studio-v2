'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Users, Images, FolderOpen, CalendarDays, ShieldCheck,
  TrendingUp, Camera, Loader2, Clock,
} from 'lucide-react'

/* ─── types ─────────────────────────────────────────── */

interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  isBanned: boolean
  createdAt: string
}

interface RecentPhotographer {
  id: string
  hourlyRate: number
  location: string | null
  isActive: boolean
  createdAt: string
  user: { name: string; email: string }
  _count: { media: number }
}

interface RecentMedia {
  id: string
  url: string
  caption: string | null
  createdAt: string
  photographer: { user: { name: string } }
}

interface Stats {
  totalUsers: number
  totalPhotographers: number
  totalConsumers: number
  totalMedia: number
  totalProjects: number
  totalBookings: number
  pendingBookings: number
  recentUsers: RecentUser[]
  recentPhotographers: RecentPhotographer[]
  recentMedia: RecentMedia[]
}

/* ─── role badges ────────────────────────────────────── */
const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'أدمن', PHOTOGRAPHER: 'مصور', CONSUMER: 'عميل',
}
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-indigo-100 text-indigo-700',
  PHOTOGRAPHER: 'bg-[#C0A4A3]/10 text-[#C0A4A3]',
  CONSUMER: 'bg-emerald-50 text-emerald-700',
}

/* ─── component ─────────────────────────────────────── */

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') window.location.href = '/'
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats)
  }, [status, session])

  if (status === 'loading' || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  /* stat cards */
  const statCards = [
    { label: 'إجمالي المستخدمين',  value: stats.totalUsers,         icon: <Users className="w-5 h-5" />,       color: 'text-indigo-600 bg-indigo-50' },
    { label: 'مصورون',              value: stats.totalPhotographers,  icon: <Camera className="w-5 h-5" />,      color: 'text-[#C0A4A3] bg-[#C0A4A3]/10' },
    { label: 'عملاء',               value: stats.totalConsumers,      icon: <Users className="w-5 h-5" />,       color: 'text-emerald-600 bg-emerald-50' },
    { label: 'صور مرفوعة',          value: stats.totalMedia,          icon: <Images className="w-5 h-5" />,      color: 'text-amber-600 bg-amber-50' },
    { label: 'مشاريع',              value: stats.totalProjects,       icon: <FolderOpen className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
    { label: 'حجوزات',              value: stats.totalBookings,       icon: <CalendarDays className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
    { label: 'حجوزات معلقة',        value: stats.pendingBookings,     icon: <TrendingUp className="w-5 h-5" />,  color: 'text-orange-600 bg-orange-50' },
  ]

  /* quick-access nav cards */
  const navLinks = [
    { href: '/admin/users',         label: 'إدارة المستخدمين', icon: <Users className="w-5 h-5" />,        desc: 'عرض، حظر، وحذف الحسابات' },
    { href: '/admin/photographers', label: 'إدارة المصورين',   icon: <Camera className="w-5 h-5" />,      desc: 'تفعيل ووقف حسابات المصورين' },
    { href: '/admin/media',         label: 'إدارة الوسائط',    icon: <Images className="w-5 h-5" />,      desc: 'مراجعة وحذف الصور' },
    { href: '/admin/projects',      label: 'إدارة المشاريع',   icon: <FolderOpen className="w-5 h-5" />,  desc: 'مراجعة وحذف المشاريع' },
    { href: '/admin/bookings',      label: 'إدارة الحجوزات',   icon: <CalendarDays className="w-5 h-5" />, desc: 'عرض جميع الحجوزات' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
        نظرة عامة
      </h1>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value.toLocaleString('ar-SA')}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick-access nav cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {navLinks.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {n.icon}
            </div>
            <p className="font-bold text-gray-800">{n.label}</p>
            <p className="text-sm text-gray-400 mt-1">{n.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── Recent Users  &  Recent Photographers (side by side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <p className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              آخر المستخدمين
            </p>
            <Link
              href="/admin/users"
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              عرض الكل
            </Link>
          </div>

          {stats.recentUsers.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">لا يوجد مستخدمون بعد</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors"
                >
                  {/* avatar + name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                      {u.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* badges + date */}
                  <div className="flex items-center gap-2 shrink-0 mr-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLOR[u.role]}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                    {u.isBanned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-500">
                        محظور
                      </span>
                    )}
                    <span className="text-[10px] text-gray-300 hidden sm:block">
                      {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Photographers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <p className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C0A4A3]" />
              آخر المصورين المسجلين
            </p>
            <Link
              href="/admin/photographers"
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              عرض الكل
            </Link>
          </div>

          {stats.recentPhotographers.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">لا يوجد مصورون بعد</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentPhotographers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors"
                >
                  {/* avatar + name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#C0A4A3]/10 flex items-center justify-center text-[#C0A4A3] text-xs font-bold shrink-0">
                      {p.user.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.user.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {p.location ?? p.user.email}
                      </p>
                    </div>
                  </div>

                  {/* status + media count + date */}
                  <div className="flex items-center gap-2 shrink-0 mr-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      p.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'نشط' : 'موقوف'}
                    </span>
                    <span className="text-[10px] text-gray-400">{p._count.media} صورة</span>
                    <span className="text-[10px] text-gray-300 hidden sm:block">
                      {new Date(p.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Media Uploads ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <p className="font-semibold text-gray-700 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            آخر الصور المرفوعة
          </p>
          <Link
            href="/admin/media"
            className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            عرض الكل
          </Link>
        </div>

        {stats.recentMedia.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            <Images className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            لا توجد صور بعد
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6">
            {stats.recentMedia.map((m) => (
              <div key={m.id} className="group relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={m.url}
                  alt={m.caption ?? 'صورة'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* hover overlay: uploader name */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-[10px] font-medium truncate w-full leading-tight">
                    {m.photographer.user.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
