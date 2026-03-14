import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

/** PATCH /api/admin/photographers/[id] — update isActive, isPro, or verifiedBadge */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { isActive, isPro, verifiedBadge } = body

    const updated = await prisma.photographerProfile.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isPro !== undefined && { isPro: Boolean(isPro) }),
        ...(verifiedBadge !== undefined && { verifiedBadge: Boolean(verifiedBadge) }),
      },
      select: { id: true, isActive: true, isPro: true, verifiedBadge: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/admin/photographers/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

/** DELETE /api/admin/photographers/[id] — delete photographer's user account (cascades everything) */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const { id } = await params

    // Look up the userId so we can delete the User (which cascades to PhotographerProfile + Media)
    const profile = await prisma.photographerProfile.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'المصور غير موجود' }, { status: 404 })
    }

    // Prevent admin from deleting their own account
    if (profile.userId === session.user.id) {
      return NextResponse.json({ error: 'لا يمكن حذف حسابك الخاص' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: profile.userId } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/photographers/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
