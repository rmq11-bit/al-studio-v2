'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  Camera,
  LayoutDashboard,
  Search,
  FolderOpen,
  MessageSquare,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const role = session?.user?.role

  async function handleLogout() {
    await signOut({ redirect: false })
    window.location.href = '/'
  }

  const getDashboardHref = () => {
    if (role === 'PHOTOGRAPHER') return '/photographer/dashboard'
    if (role === 'CONSUMER') return '/consumer/dashboard'
    if (role === 'ADMIN') return '/admin'
    return '/'
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#C0A4A3]">
          <Camera className="w-6 h-6" />
          <span>الإستوديو</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/browse" className="flex items-center gap-1.5 hover:text-[#C0A4A3] transition-colors">
            <Search className="w-4 h-4" />
            تصفح المصورين
          </Link>
          <Link href="/projects" className="flex items-center gap-1.5 hover:text-[#C0A4A3] transition-colors">
            <FolderOpen className="w-4 h-4" />
            المشاريع
          </Link>
          {session && (
            <>
              <Link href="/messages" className="flex items-center gap-1.5 hover:text-[#C0A4A3] transition-colors">
                <MessageSquare className="w-4 h-4" />
                الرسائل
              </Link>
              <Link href={getDashboardHref()} className="flex items-center gap-1.5 hover:text-[#C0A4A3] transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                لوحتي
              </Link>
              {role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                  أدمن
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              {session.user.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  alt={session.user.name ?? ''}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#C0A4A3]/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#C0A4A3] flex items-center justify-center text-white text-xs font-bold">
                  {(session.user.name ?? '؟')[0]}
                </div>
              )}
              <span className="text-sm text-gray-700">{session.user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#C0A4A3] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                دخول
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-1.5 bg-[#C0A4A3] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#A88887] transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                تسجيل
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-500"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm font-medium text-gray-700">
          <Link href="/browse" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
            <Search className="w-4 h-4" /> تصفح المصورين
          </Link>
          <Link href="/projects" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> المشاريع
          </Link>
          {session ? (
            <>
              <Link href="/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> الرسائل
              </Link>
              <Link href={getDashboardHref()} onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> لوحتي
              </Link>
              {role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-indigo-600">
                  <ShieldCheck className="w-4 h-4" /> أدمن
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                <LogOut className="w-4 h-4" /> خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> دخول
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-[#C0A4A3]">
                <UserPlus className="w-4 h-4" /> تسجيل
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
