import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SPECIALTY_KEYS } from '@/lib/specialties'

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, bio: true, avatarUrl: true, phone: true } } },
    })

    if (!profile) return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })

    return NextResponse.json(profile)
  } catch (err) {
    console.error('[GET /api/photographer/profile]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { name, bio, phone, location, hourlyRate, specialties, avatarUrl } = await req.json()

    // Validate specialties — only known keys allowed
    if (!Array.isArray(specialties) || specialties.length === 0) {
      return NextResponse.json({ error: 'اختر تخصصاً واحداً على الأقل' }, { status: 400 })
    }
    const invalidKeys = specialties.filter((s: string) => !SPECIALTY_KEYS.includes(s))
    if (invalidKeys.length > 0) {
      return NextResponse.json({ error: 'تخصصات غير صحيحة' }, { status: 400 })
    }

    const parsedRate = parseFloat(hourlyRate)
    if (isNaN(parsedRate) || parsedRate < 0) {
      return NextResponse.json({ error: 'السعر غير صحيح' }, { status: 400 })
    }

    // Update user name / bio / avatar + photographer profile in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          name: name?.trim() || undefined,
          bio: bio?.trim() || null,
          phone: phone?.trim() || null,
          avatarUrl: avatarUrl?.trim() || null,
        },
      }),
      prisma.photographerProfile.update({
        where: { userId },
        data: {
          hourlyRate: parsedRate,
          specialties: JSON.stringify(specialties), // SQLite: stored as JSON string
          location: location?.trim() || null,
        },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/photographer/profile]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
