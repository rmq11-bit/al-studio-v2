import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

const VALID_ROLES = ['ADMIN', 'PHOTOGRAPHER', 'CONSUMER'] as const

/** PATCH /api/admin/users/[id] — ban/unban OR change role */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Prevent admin from modifying their own account via this endpoint
    if (id === session.user.id) {
      return NextResponse.json({ error: 'لا يمكن تعديل حسابك الخاص من هنا' }, { status: 400 })
    }

    const body = await req.json()
    const { isBanned, role } = body

    // Build the update payload — only include provided fields
    const data: Record<string, unknown> = {}

    if (isBanned !== undefined) {
      data.isBanned = Boolean(isBanned)
    }

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: 'دور غير صحيح' }, { status: 400 })
      }
      data.role = role
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, isBanned: true, role: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/admin/users/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

/** DELETE /api/admin/users/[id] — permanently delete a user */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: 'لا يمكن حذف حسابك الخاص' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/users/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
