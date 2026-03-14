'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">حدث خطأ غير متوقع</h1>
        <p className="text-gray-400 text-sm mb-8">
          عذراً، حدث خطأ في الخادم. يمكنك المحاولة مجدداً أو العودة للرئيسية.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[#C0A4A3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#A88887] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            حاول مجدداً
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
