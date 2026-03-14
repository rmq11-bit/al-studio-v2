import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { del } from '@vercel/blob'

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try { await del(media.url) } catch { /* best-effort */ }
    }

    await prisma.media.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/media/:id]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
