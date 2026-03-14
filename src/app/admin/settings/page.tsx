'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings, Loader2, Database, HardDrive, Info } from 'lucide-react'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') window.location.href = '/'
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const info = [
    { label: 'اسم المنصة',     value: 'الاستوديو',      icon: <Info className="w-4 h-4" /> },
    { label: 'إصدار التطبيق', value: '1.0.0',           icon: <Info className="w-4 h-4" /> },
    { label: 'قاعدة البيانات', value: 'LibSQL / Turso',  icon: <Database className="w-4 h-4" /> },
    { label: 'تخزين الوسائط', value: 'Vercel Blob',     icon: <HardDrive className="w-4 h-4" /> },
    { label: 'المشرف الحالي',  value: session?.user.name ?? '—', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          الإعدادات
        </h1>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-700">معلومات المنصة</p>
          </div>
          <div className="divide-y divide-gray-50">
            {info.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="text-gray-300">{row.icon}</span>
                  {row.label}
                </div>
                <span className="font-medium text-gray-800 text-sm">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-indigo-50 rounded-2xl p-5 text-center">
          <p className="text-sm text-indigo-400 font-medium">المزيد من الإعدادات قريباً</p>
          <p className="text-xs text-indigo-300 mt-1">إعدادات المنصة والتخصيص ستكون متاحة في الإصدار القادم</p>
        </div>
      </div>
    </div>
  )
}
