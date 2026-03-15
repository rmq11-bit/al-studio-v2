'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Camera, Mail, Lock, LogIn, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

// ── Inner form — reads search params (must be inside Suspense) ───────────────
function LoginForm() {
  const searchParams  = useSearchParams()
  const errorParam    = searchParams.get('error')
  const verifiedParam = searchParams.get('verified')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const justVerified = verifiedParam === '1'

  useEffect(() => {
    if (errorParam === 'banned') {
      setError('تم تعليق هذا الحساب. تواصل مع الدعم للمزيد.')
    }
  }, [errorParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (!result?.ok) {
      // Check if account exists but is unverified → redirect to verify page
      const check = await fetch('/api/auth/check-verified', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await check.json()

      if (data.unverified) {
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`
        return
      }

      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      return
    }

    // ✅ Hard navigation — forces root layout to re-run and SessionProvider
    //    to fetch a fresh session. router.push() would NOT do this.
    window.location.href = '/auth/redirect'
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-800 mb-6">تسجيل الدخول</h1>

      {justVerified && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-5">
          <CheckCircle className="w-4 h-4 shrink-0" />
          تم تفعيل حسابك بنجاح! يمكنك الدخول الآن.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#C0A4A3] text-white py-3 rounded-xl font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {loading ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-5">
        ليس لديك حساب؟{' '}
        <Link href="/auth/register" className="text-[#C0A4A3] font-semibold hover:underline">
          سجّل الآن
        </Link>
      </p>
    </>
  )
}

// ── Page shell ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C0A4A3]/10 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#C0A4A3] font-bold text-2xl">
            <Camera className="w-7 h-7" />
            الإستوديو
          </Link>
          <p className="text-gray-400 text-sm mt-2">أهلاً بعودتك</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<Loader2 className="w-6 h-6 text-[#C0A4A3] animate-spin mx-auto" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
