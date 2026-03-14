import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// ── POST /api/reviews ─────────────────────────────────────────────────────────
// Consumer submits a rating after a booking is COMPLETED.
export async function POST(req: Request) {
  try {
    const session = await auth()
    const consumerId = session?.user?.id

    if (!consumerId || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { bookingId, rating, comment } = await req.json()

    // ── Validate inputs ────────────────────────────────────────────────────
    if (!bookingId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
    }

    // ── Verify booking belongs to this consumer and is COMPLETED ──────────
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { consumerId: true, photographerId: true, status: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 })
    }

    if (booking.consumerId !== consumerId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'يمكن التقييم فقط بعد اكتمال الحجز' }, { status: 400 })
    }

    // ── Check no existing review ───────────────────────────────────────────
    const existing = await prisma.review.findUnique({ where: { bookingId } })
    if (existing) {
      return NextResponse.json({ error: 'تم تقييم هذا الحجز مسبقاً' }, { status: 409 })
    }

    // ── Create review ──────────────────────────────────────────────────────
    const review = await prisma.review.create({
      data: {
        bookingId,
        consumerId,
        photographerId: booking.photographerId,
        rating: Math.round(rating),
        comment: comment?.trim() || null,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    console.error('[POST /api/reviews]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
