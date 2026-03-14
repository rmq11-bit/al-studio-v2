import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

/** GET /api/conversations/[id]/messages — fetch all messages + mark unread as read */
export async function GET(req: Request, { params }: Params) {
  try {
    const { id: conversationId } = await params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    // Verify user is a participant
    const convo = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { consumerId: true, photographerId: true },
    })

    if (!convo) return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 })

    // Build a set of valid participant user IDs
    const photographerUser = await prisma.photographerProfile.findUnique({
      where: { id: convo.photographerId },
      select: { userId: true },
    })

    const participantIds = [convo.consumerId, photographerUser?.userId].filter(Boolean)

    if (!participantIds.includes(userId)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Mark unread messages (sent by the other party) as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (err) {
    console.error('[GET /api/conversations/:id/messages]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

/** POST /api/conversations/[id]/messages — send a new message */
export async function POST(req: Request, { params }: Params) {
  try {
    const { id: conversationId } = await params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { body } = await req.json()

    if (!body?.trim()) {
      return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })
    }

    // Verify user is a participant
    const convo = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { consumerId: true, photographerId: true },
    })

    if (!convo) return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 })

    const photographerUser = await prisma.photographerProfile.findUnique({
      where: { id: convo.photographerId },
      select: { userId: true },
    })

    const participantIds = [convo.consumerId, photographerUser?.userId].filter(Boolean)

    if (!participantIds.includes(userId)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Create message and bump conversation.updatedAt in a transaction
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          body: body.trim(),
        },
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    console.error('[POST /api/conversations/:id/messages]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
