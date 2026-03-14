'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FolderOpen, Trash2, Loader2, ExternalLink } from 'lucide-react'

interface AdminProject {
  id: string
  title: string
  status: string
  hours: number
  budget: number | null
  createdAt: string
  consumer: { name: string; email: string }
  _count: { proposals: number }
}

export default function AdminProjectsPage() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') window.location.href = '/'
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    fetch('/api/admin/projects').then((r) => r.json()).then((d) => { setProjects(d); setLoading(false) })
  }, [status, session])

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا المشروع نهائياً؟')) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-600" />
          إدارة المشاريع
        </h1>
        <span className="text-sm text-gray-400">({projects.length})</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>لا توجد مشاريع</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['المشروع', 'العميل', 'الحالة', 'العروض', 'التاريخ', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-medium text-gray-800 truncate">{project.title}</p>
                      <p className="text-xs text-gray-400">{project.hours} ساعة</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{project.consumer.name}</p>
                      <p className="text-xs text-gray-400">{project.consumer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'OPEN' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {project.status === 'OPEN' ? 'مفتوح' : 'مغلق'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{project._count.proposals}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="عرض"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={deletingId === project.id}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deletingId === project.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
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
