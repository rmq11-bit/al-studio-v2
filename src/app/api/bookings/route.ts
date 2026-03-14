import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    // ── Auth guard ────────────────────────────────────────────────────────────
    if (!userId || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { photographerId, date, hours, notes } = await req.json()

    // ── Validation ────────────────────────────────────────────────────────────
    if (!photographerId || !date || !hours) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'تنسيق التاريخ غير صحيح' }, { status: 400 })
    }

    // Validate date is in the future (compare strings — works because YYYY-MM-DD is lexicographically sortable)
    const today = new Date().toLocaleDateString('sv-SE')
    if (date < today) {
      return NextResponse.json({ error: 'لا يمكن الحجز في تاريخ سابق' }, { status: 400 })
    }

    const parsedHours = parseFloat(hours)
    if (isNaN(parsedHours) || parsedHours < 1 || parsedHours > 12) {
      return NextResponse.json({ error: 'عدد الساعات غير صحيح' }, { status: 400 })
    }

    // ── Check photographer exists and is active ────────────────────────────
    const photographer = await prisma.photographerProfile.findUnique({
      where: { id: photographerId },
      select: { id: true, isActive: true },
    })

    if (!photographer || !photographer.isActive) {
      return NextResponse.json({ error: 'المصور غير موجود' }, { status: 404 })
    }

    // ── Check date is not blocked ─────────────────────────────────────────
    const blocked = await prisma.unavailableDate.findUnique({
      where: { photographerId_date: { photographerId, date } },
    })

    if (blocked) {
      return NextResponse.json({ error: 'هذا التاريخ غير متاح' }, { status: 409 })
    }

    // ── Check for duplicate pending booking on same date ──────────────────
    const duplicate = await prisma.booking.findFirst({
      where: {
        consumerId: userId,
        photographerId,
        date,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    })

    if (duplicate) {
      return NextResponse.json(
        { error: 'لديك حجز قائم بالفعل مع هذا المصور في نفس التاريخ' },
        { status: 409 }
      )
    }

    // ── Create booking ────────────────────────────────────────────────────
    const booking = await prisma.booking.create({
      data: {
        consumerId: userId,
        photographerId,
        date,
        hours: parsedHours,
        notes: notes?.trim() || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ id: booking.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/bookings]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const role = session.user.role

    // Return bookings relevant to this user's role
    if (role === 'CONSUMER') {
      const bookings = await prisma.booking.findMany({
        where: { consumerId: userId },
        include: {
          photographer: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(bookings)
    }

    if (role === 'PHOTOGRAPHER') {
      const profile = await prisma.photographerProfile.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (!profile) return NextResponse.json([])

      const bookings = await prisma.booking.findMany({
        where: { photographerId: profile.id },
        include: {
          consumer: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(bookings)
    }

    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  } catch (err) {
    console.error('[GET /api/bookings]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
