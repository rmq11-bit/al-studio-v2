'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Camera, CheckCircle, AlertCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react'

// ── Inner component — reads search params (must be inside Suspense) ───────────
function VerifyEmailForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') ?? ''

  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [resending, setResending]   = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  useEffect(() => {
    if (!email) router.replace('/auth/register')
  }, [email, router])

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next  = [...otp]
    next[index] = digit
    setOtp(next)
    setError('')
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
    if (digit && index === 5) {
      const full = [...next].join('')
      if (full.length === 6) submitOtp(full)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    pasted.split('').forEach((d, i) => { next[i] = d })
    setOtp(next)
    const lastIdx = Math.min(pasted.length - 1, 5)
    inputRefs.current[lastIdx]?.focus()
    if (pasted.length === 6) submitOtp(pasted)
  }

  async function submitOtp(code: string) {
    if (loading) return
    setLoading(true)
    setError('')
    const res  = await fetch('/api/auth/verify-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: code }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.replace('/auth/login?verified=1'), 2000)
    } else {
      setError(data.error ?? 'حدث خطأ، حاول مجدداً')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitOtp(otp.join(''))
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return
    setResending(true)
    setError('')
    const res  = await fetch('/api/auth/resend-verification', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setResending(false)
    if (res.ok) {
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else if (res.status === 429) {
      const match = data.error?.match(/\d+/)
      setResendCooldown(match ? parseInt(match[0]) : 60)
    } else {
      setError(data.error ?? 'فشل إعادة الإرسال')
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">تم التحقق بنجاح! 🎉</h2>
        <p className="text-gray-400 text-sm">جاري تحويلك لتسجيل الدخول...</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-800 mb-2">أدخل رمز التحقق</h1>
      <p className="text-sm text-gray-400 mb-7">
        أرسلنا رمزاً مكوناً من 6 أرقام إلى{' '}
        <span className="font-semibold text-gray-600 break-all">{email}</span>
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className="flex gap-2 justify-center mb-6"
          style={{ direction: 'ltr' }}
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-11 h-14 text-center text-xl font-bold border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                digit
                  ? 'border-[#C0A4A3] ring-1 ring-[#C0A4A3]/30 bg-[#C0A4A3]/5'
                  : 'border-gray-200 focus:border-[#C0A4A3] focus:ring-[#C0A4A3]/20'
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="w-full flex items-center justify-center gap-2 bg-[#C0A4A3] text-white py-3 rounded-xl font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-50 mb-4"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'جاري التحقق...' : 'تحقق'}
        </button>
      </form>

      <div className="text-center">
        {resendCooldown > 0 ? (
          <p className="text-sm text-gray-400">
            يمكنك إعادة الإرسال بعد{' '}
            <span className="font-semibold text-gray-600 tabular-nums">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-sm text-[#C0A4A3] hover:text-[#A88887] font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
          </button>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          العودة للتسجيل
        </Link>
      </div>
    </>
  )
}

// ── Page shell ────────────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C0A4A3]/10 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#C0A4A3] font-bold text-2xl">
            <Camera className="w-7 h-7" />
            الإستوديو
          </Link>
          <p className="text-gray-400 text-sm mt-2">تحقق من بريدك الإلكتروني</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<Loader2 className="w-6 h-6 text-[#C0A4A3] animate-spin mx-auto" />}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
