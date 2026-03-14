import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!profile) return NextResponse.json([])

    const unavailable = await prisma.unavailableDate.findMany({
      where: { photographerId: profile.id },
      select: { date: true },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(unavailable.map((d: any) => d.date))
  } catch (err) {
    console.error('[GET /api/photographer/availability]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

/** POST — toggle a single date (block if available, unblock if blocked) */
export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { date } = await req.json()

    if (!date || !DATE_RE.test(date)) {
      return NextResponse.json({ error: 'تنسيق التاريخ غير صحيح' }, { status: 400 })
    }

    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!profile) return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })

    const existing = await prisma.unavailableDate.findUnique({
      where: { photographerId_date: { photographerId: profile.id, date } },
    })

    if (existing) {
      // Already blocked → unblock it
      await prisma.unavailableDate.delete({ where: { id: existing.id } })
      return NextResponse.json({ blocked: false })
    } else {
      // Not blocked → block it
      await prisma.unavailableDate.create({
        data: { photographerId: profile.id, date },
      })
      return NextResponse.json({ blocked: true })
    }
  } catch (err) {
    console.error('[POST /api/photographer/availability]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
