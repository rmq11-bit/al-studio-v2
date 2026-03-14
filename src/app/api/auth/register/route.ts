import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

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
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 })
    }

    // ── Create user ───────────────────────────────────────────────────────────
    const passwordHash = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone?.trim() || null,
        passwordHash,
        role: role as UserRole,
        // If photographer, also create a blank profile
        photographerProfile:
          role === 'PHOTOGRAPHER'
            ? {
                create: {
                  hourlyRate: 0,
                  specialties: '[]',    // SQLite: stored as JSON string
                },
              }
            : undefined,
      },
    })

    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
