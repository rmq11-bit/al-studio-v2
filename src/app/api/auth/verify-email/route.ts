import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** POST /api/auth/verify-email — validate OTP and mark email as verified */
export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'البريد الإلكتروني والرمز مطلوبان' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id:                          true,
        emailVerified:               true,
        emailVerificationToken:      true,
        emailVerificationExpiresAt:  true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true })
    }

    // Check token
    if (!user.emailVerificationToken || user.emailVerificationToken !== otp) {
      return NextResponse.json({ error: 'الرمز غير صحيح' }, { status: 400 })
    }

    // Check expiry
    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      return NextResponse.json({ error: 'انتهت صلاحية الرمز، يرجى طلب رمز جديد' }, { status: 400 })
    }

    // Mark verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified:              true,
        emailVerificationToken:     null,
        emailVerificationExpiresAt: null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[verify-email]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
