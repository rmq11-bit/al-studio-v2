import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { del } from '@vercel/blob'

interface Params {
  params: Promise<{ mediaId: string }>
}

/** DELETE /api/photographer/media/[mediaId] — remove a media item */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { mediaId } = await params
    const session = await auth()
    const userId = session?.user?.id
    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!profile) return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })

    const media = await prisma.media.findUnique({ where: { id: mediaId } })

    if (!media || media.photographerId !== profile.id) {
      return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })
    }

    // Delete from Vercel Blob (best-effort — don't fail if blob missing)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(media.url)
      } catch {
        // Blob might not exist; continue with DB deletion
      }
    }

    await prisma.media.delete({ where: { id: mediaId } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/photographer/media/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
