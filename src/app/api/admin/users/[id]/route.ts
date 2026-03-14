import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

/** PATCH /api/admin/users/[id] — ban or unban a user */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Prevent admin from banning themselves
    if (id === session.user.id) {
      return NextResponse.json({ error: 'لا يمكن حظر حسابك الخاص' }, { status: 400 })
    }

    const { isBanned } = await req.json()

    const updated = await prisma.user.update({
      where: { id },
      data: { isBanned: Boolean(isBanned) },
      select: { id: true, isBanned: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/admin/users/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

/** DELETE /api/admin/users/[id] — permanently delete a user */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: 'لا يمكن حذف حسابك الخاص' }, { status: 400 })
    }

    // Cascade deletes are set in the schema (onDelete: Cascade)
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/users/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
