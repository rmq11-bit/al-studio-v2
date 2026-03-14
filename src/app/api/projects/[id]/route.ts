import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

/** PATCH /api/projects/[id] — consumer closes their own project */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const project = await prisma.projectPost.findUnique({ where: { id } })

    if (!project || project.consumerId !== userId) {
      return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 })
    }

    const updated = await prisma.projectPost.update({
      where: { id },
      data: { status: 'CLOSED' },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/projects/:id]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
