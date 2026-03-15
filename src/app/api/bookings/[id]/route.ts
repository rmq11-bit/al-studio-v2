import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/bookings/[id]
 *
 * PHOTOGRAPHER:
 *   PENDING  → ACCEPTED  (creates conversation)
 *   PENDING  → REJECTED  (optional rejectionNote)
 *   ACCEPTED → COMPLETED (photographer confirms session done)
 *
 * CONSUMER:
 *   ACCEPTED → COMPLETED (consumer confirms session done)
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id
    const role   = session?.user?.role

    if (!userId || (role !== 'PHOTOGRAPHER' && role !== 'CONSUMER')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { status, rejectionNote } = await req.json()

    // ── PHOTOGRAPHER branch ────────────────────────────────────────────────
    if (role === 'PHOTOGRAPHER') {
      if (!['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
        return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
      }

      const profile = await prisma.photographerProfile.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (!profile) {
        return NextResponse.json({ error: 'الملف الشخصي غير موجود' }, { status: 404 })
      }

      const booking = await prisma.booking.findUnique({ where: { id } })
      if (!booking || booking.photographerId !== profile.id) {
        return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 })
      }

      if (status === 'COMPLETED') {
        if (booking.status !== 'ACCEPTED') {
          return NextResponse.json({ error: 'يجب أن يكون الحجز مقبولاً أولاً' }, { status: 409 })
        }
      } else {
        if (booking.status !== 'PENDING') {
          return NextResponse.json({ error: 'لا يمكن تعديل حجز تمت معالجته' }, { status: 409 })
        }
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: {
          status,
          rejectionNote: status === 'REJECTED' ? (rejectionNote?.trim() || null) : null,
        },
      })

      let conversationId: string | null = null
      if (status === 'ACCEPTED') {
        const conversation = await prisma.conversation.upsert({
          where:  { bookingId: id },
          create: {
            type:           'BOOKING',
            consumerId:     booking.consumerId,
            photographerId: profile.id,
            bookingId:      id,
          },
          update: {},
        })
        conversationId = conversation.id
      }

      return NextResponse.json({ ...updated, conversationId })
    }

    // ── CONSUMER branch — mark ACCEPTED booking as COMPLETED ───────────────
    if (status !== 'COMPLETED') {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking || booking.consumerId !== userId) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 })
    }
    if (booking.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'يجب أن يكون الحجز مقبولاً أولاً' }, { status: 409 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'COMPLETED' },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/bookings/:id]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

/**
 * DELETE /api/bookings/[id]
 * Consumer cancels a PENDING booking (hard delete — nothing has happened yet).
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    const userId  = session?.user?.id

    if (!userId || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking || booking.consumerId !== userId) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 })
    }
    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'لا يمكن إلغاء حجز تمت معالجته' }, { status: 409 })
    }

    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/bookings/:id]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
