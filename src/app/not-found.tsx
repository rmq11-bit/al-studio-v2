import Link from 'next/link'
import { Camera, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C0A4A3]/10 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 text-[#C0A4A3] font-bold text-xl mb-8">
          <Camera className="w-6 h-6" />
          الإستوديو
        </Link>

        {/* 404 */}
        <div className="text-8xl font-black text-[#C0A4A3]/20 mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">الصفحة غير موجودة</h1>
        <p className="text-gray-400 text-sm mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#C0A4A3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#A88887] transition-colors"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </Link>
          <Link
            href="/browse"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            تصفح المصورين
          </Link>
        </div>
      </div>
    </div>
  )
}
