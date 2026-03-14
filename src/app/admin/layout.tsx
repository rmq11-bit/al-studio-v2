'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Users, Camera, Images,
  CalendarDays, FolderOpen, Settings, ShieldCheck, Loader2, LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/admin',               label: 'لوحة التحكم',  icon: LayoutDashboard, exact: true },
  { href: '/admin/users',         label: 'المستخدمون',   icon: Users },
  { href: '/admin/photographers', label: 'المصورون',     icon: Camera },
  { href: '/admin/media',         label: 'الوسائط',      icon: Images },
  { href: '/admin/bookings',      label: 'الحجوزات',    icon: CalendarDays },
  { href: '/admin/projects',      label: 'المشاريع',     icon: FolderOpen },
  { href: '/admin/settings',      label: 'الإعدادات',   icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/auth/login'
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') window.location.href = '/'
  }, [status, session])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  const activeItem = NAV.find((n) => n.exact ? pathname === n.href : pathname.startsWith(n.href))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="fixed top-0 right-0 bottom-0 w-60 bg-white border-l border-gray-100 flex flex-col z-40">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">لوحة الإدارة</p>
              <p className="text-[11px] text-gray-400">الاستوديو</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-3">
            {session.user.avatarUrl ? (
              <img src={session.user.avatarUrl} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                {session.user.name?.[0] ?? 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{session.user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 w-full text-xs py-2 px-3 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            العودة للموقع
          </Link>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="mr-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <p className="text-sm font-semibold text-gray-700">{activeItem?.label ?? 'الإدارة'}</p>
          <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
            مدير النظام
          </span>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
