import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

/** PATCH /api/bookings/[id] — photographer accepts or rejects a booking */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { status, rejectionNote } = await req.json()

    if (!['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    // Verify the booking belongs to this photographer
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

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'لا يمكن تعديل حجز تمت معالجته' }, { status: 409 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        rejectionNote: status === 'REJECTED' ? (rejectionNote?.trim() || null) : null,
      },
    })

    // On acceptance: create a conversation linking photographer ↔ consumer.
    // Uses upsert so re-accepting (edge case) never creates a duplicate.
    // No conversation is created on rejection.
    let conversationId: string | null = null
    if (status === 'ACCEPTED') {
      const conversation = await prisma.conversation.upsert({
        where:  { bookingId: id },
        create: {
          type:          'BOOKING',
          consumerId:    booking.consumerId,
          photographerId: profile.id,
          bookingId:     id,
        },
        update: {}, // already exists — nothing to change
      })
      conversationId = conversation.id
    }

    return NextResponse.json({ ...updated, conversationId })
  } catch (err) {
    console.error('[PATCH /api/bookings/:id]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
