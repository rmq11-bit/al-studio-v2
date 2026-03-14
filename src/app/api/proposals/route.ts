import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { projectId, photographerId, price, message } = await req.json()

    if (!projectId || !photographerId || !price) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })
    }

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: 'السعر غير صحيح' }, { status: 400 })
    }

    // Verify photographer profile belongs to session user
    const profile = await prisma.photographerProfile.findUnique({
      where: { id: photographerId },
      select: { id: true, userId: true },
    })

    if (!profile || profile.userId !== userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Verify project is open
    const project = await prisma.projectPost.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    })

    if (!project || project.status !== 'OPEN') {
      return NextResponse.json({ error: 'المشروع غير متاح' }, { status: 404 })
    }

    // Check for duplicate proposal (@@unique on [projectId, photographerId])
    const existing = await prisma.proposal.findUnique({
      where: { projectId_photographerId: { projectId, photographerId } },
    })

    if (existing) {
      return NextResponse.json({ error: 'قدّمت عرضاً لهذا المشروع بالفعل' }, { status: 409 })
    }

    const proposal = await prisma.proposal.create({
      data: {
        projectId,
        photographerId,
        price: parsedPrice,
        message: message?.trim() || null,
      },
    })

    return NextResponse.json({ id: proposal.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/proposals]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
