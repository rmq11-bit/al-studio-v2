import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const photographers = await prisma.photographerProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true, isBanned: true },
        },
        _count: {
          select: { media: true, bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(photographers)
  } catch (err) {
    console.error('[GET /api/admin/photographers]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
