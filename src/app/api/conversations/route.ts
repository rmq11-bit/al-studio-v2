import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/conversations
 * Returns all conversations for the current user.
 * Works for both CONSUMER and PHOTOGRAPHER roles.
 */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const role = session.user.role

    let conversations

    if (role === 'CONSUMER') {
      conversations = await prisma.conversation.findMany({
        where: { consumerId: userId },
        include: {
          photographer: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          booking: { select: { date: true, hours: true, status: true } },
          proposal: {
            select: {
              price: true,
              status: true,
              project: { select: { title: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
    } else if (role === 'PHOTOGRAPHER') {
      const profile = await prisma.photographerProfile.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (!profile) return NextResponse.json([])

      conversations = await prisma.conversation.findMany({
        where: { photographerId: profile.id },
        include: {
          consumer: { select: { name: true, avatarUrl: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          booking: { select: { date: true, hours: true, status: true } },
          proposal: {
            select: {
              price: true,
              status: true,
              project: { select: { title: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
    } else {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    return NextResponse.json(conversations)
  } catch (err) {
    console.error('[GET /api/conversations]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
