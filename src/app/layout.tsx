import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'الإستوديو - منصة المصورين',
  description: 'ابحث عن المصور المناسب لمشروعك',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ✅ We do NOT call auth() here and do NOT pass a session prop to SessionProvider.
  //    This prevents the stale-session bug: passing a server-fetched session caches
  //    it in React's tree and never refreshes after soft navigation (router.push).
  //    The client-side SessionProvider fetches /api/auth/session itself and stays fresh.
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-gray-50 text-gray-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
