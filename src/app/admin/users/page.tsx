'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Users, ShieldOff, ShieldCheck, Trash2, Loader2, Search, Crown, ShieldX } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  isBanned: boolean
  createdAt: string
  _count: { sentMessages: number; projectPosts: number }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') window.location.href = '/'
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => { setUsers(d); setLoading(false) })
  }, [status, session])

  // ── Generic PATCH helper ────────────────────────────────────────────────
  async function patchUser(id: string, body: Record<string, unknown>) {
    setActionId(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    setActionId(null)
    return res
  }

  async function toggleBan(user: AdminUser) {
    const res = await patchUser(user.id, { isBanned: !user.isBanned })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u))
    }
  }

  async function toggleAdmin(user: AdminUser) {
    const newRole = user.role === 'ADMIN' ? 'CONSUMER' : 'ADMIN'
    const label   = newRole === 'ADMIN' ? 'ترقية إلى أدمن' : 'إلغاء صلاحيات الأدمن'
    if (!confirm(`${label} لـ ${user.name}؟`)) return
    const res = await patchUser(user.id, { role: newRole })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u))
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) return
    setActionId(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setActionId(null)
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'أدمن', PHOTOGRAPHER: 'مصور', CONSUMER: 'عميل',
  }

  const filtered = search
    ? users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const currentAdminId = session?.user?.id

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          إدارة المستخدمين
        </h1>
        <span className="text-sm text-gray-400">({users.length})</span>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث باسم أو بريد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['المستخدم', 'الدور', 'الحالة', 'الانضمام', 'إجراءات'].map((h) => (
                    <th key={h} className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">لا توجد نتائج</td>
                  </tr>
                )}
                {filtered.map((user) => {
                  const isSelf    = user.id === currentAdminId
                  const isLoading = actionId === user.id

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN'        ? 'bg-indigo-100 text-indigo-700'
                          : user.role === 'PHOTOGRAPHER' ? 'bg-[#C0A4A3]/10 text-[#C0A4A3]'
                          : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isBanned ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {user.isBanned ? 'محظور' : 'نشط'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="text-xs text-gray-300">حسابك</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {/* Ban / Unban */}
                            <button
                              onClick={() => toggleBan(user)}
                              disabled={isLoading}
                              title={user.isBanned ? 'رفع الحظر' : 'حظر'}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                user.isBanned
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              }`}
                            >
                              {isLoading
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : user.isBanned
                                ? <ShieldCheck className="w-3.5 h-3.5" />
                                : <ShieldOff className="w-3.5 h-3.5" />}
                            </button>

                            {/* Promote / Demote Admin */}
                            <button
                              onClick={() => toggleAdmin(user)}
                              disabled={isLoading}
                              title={user.role === 'ADMIN' ? 'إلغاء صلاحيات الأدمن' : 'ترقية إلى أدمن'}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                user.role === 'ADMIN'
                                  ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {user.role === 'ADMIN'
                                ? <ShieldX className="w-3.5 h-3.5" />
                                : <Crown className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={isLoading}
                              title="حذف"
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
