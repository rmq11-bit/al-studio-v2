import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role } = await req.json()

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    if (!['PHOTOGRAPHER', 'CONSUMER'].includes(role)) {
      return NextResponse.json({ error: 'نوع الحساب غير صحيح' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
    }

    // ── Duplicate check ───────────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // If account exists but is unverified, allow re-sending OTP
      if (!existing.emailVerified) {
        const otp     = generateOTP()
        const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 min
        await prisma.user.update({
          where: { id: existing.id },
          data: { emailVerificationToken: otp, emailVerificationExpiresAt: expires },
        })
        await sendVerificationEmail(email, existing.name, otp)
        return NextResponse.json(
          { id: existing.id, requiresVerification: true },
          { status: 200 }
        )
      }
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 })
    }

    // ── Create user ───────────────────────────────────────────────────────────
    const passwordHash = await hash(password, 12)
    const otp          = generateOTP()
    const expires      = new Date(Date.now() + 15 * 60 * 1000)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone:                    phone?.trim() || null,
        passwordHash,
        role,
        emailVerified:            false,
        emailVerificationToken:   otp,
        emailVerificationExpiresAt: expires,
        photographerProfile:
          role === 'PHOTOGRAPHER'
            ? { create: { hourlyRate: 0, specialties: '[]' } }
            : undefined,
      },
    })

    // ── Send verification email ───────────────────────────────────────────────
    await sendVerificationEmail(email, name, otp)

    return NextResponse.json(
      { id: user.id, requiresVerification: true },
      { status: 201 }
    )
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
