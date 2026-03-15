import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendVerificationEmail } from '@/lib/email'

/** POST /api/auth/resend-verification — throttled OTP resend */
export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id:                         true,
        name:                       true,
        emailVerified:              true,
        emailVerificationExpiresAt: true,
      },
    })

    if (!user) {
      // Don't reveal whether user exists — return success anyway
      return NextResponse.json({ ok: true })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'البريد الإلكتروني محقق بالفعل' }, { status: 400 })
    }

    // ── Rate limit: must wait 60 s between resends ────────────────────────────
    const COOLDOWN_MS  = 60 * 1000
    const TOKEN_TTL_MS = 15 * 60 * 1000

    if (user.emailVerificationExpiresAt) {
      const issuedAt   = user.emailVerificationExpiresAt.getTime() - TOKEN_TTL_MS
      const elapsed    = Date.now() - issuedAt
      if (elapsed < COOLDOWN_MS) {
        const wait = Math.ceil((COOLDOWN_MS - elapsed) / 1000)
        return NextResponse.json(
          { error: `انتظر ${wait} ثانية قبل إعادة الإرسال` },
          { status: 429 }
        )
      }
    }

    const otp     = generateOTP()
    const expires = new Date(Date.now() + TOKEN_TTL_MS)

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: otp, emailVerificationExpiresAt: expires },
    })

    await sendVerificationEmail(email, user.name, otp)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[resend-verification]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
