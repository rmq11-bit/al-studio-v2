import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId || session.user.role !== 'PHOTOGRAPHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Guard: Vercel Blob requires BLOB_READ_WRITE_TOKEN
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'رفع الملفات غير مُفعَّل في هذه البيئة — أضف BLOB_READ_WRITE_TOKEN' },
        { status: 503 }
      )
    }

    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true, _count: { select: { media: true } } },
    })

    if (!profile) return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })

    // Limit per photographer
    const MAX_MEDIA = 30
    if (profile._count.media >= MAX_MEDIA) {
      return NextResponse.json(
        { error: `الحد الأقصى ${MAX_MEDIA} صورة لكل مصور` },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const caption = (formData.get('caption') as string | null)?.trim() || null

    if (!file) return NextResponse.json({ error: 'لم يتم إرفاق ملف' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم (jpg, png, webp, gif فقط)' }, { status: 400 })
    }

    const MAX_SIZE_MB = 10
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `حجم الملف يتجاوز ${MAX_SIZE_MB}MB` }, { status: 400 })
    }

    // Upload to Vercel Blob
    const filename = `photographers/${profile.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const blob = await put(filename, file, { access: 'public' })

    const media = await prisma.media.create({
      data: {
        photographerId: profile.id,
        type: 'image',
        url: blob.url,
        caption,
      },
    })

    return NextResponse.json(media, { status: 201 })
  } catch (err) {
    console.error('[POST /api/photographer/media]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

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

    const media = await prisma.media.findMany({
      where: { photographerId: profile.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(media)
  } catch (err) {
    console.error('[GET /api/photographer/media]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
