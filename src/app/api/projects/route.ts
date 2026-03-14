import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { title, description, hours, budget } = await req.json()

    if (!title?.trim() || !description?.trim() || !hours) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })
    }

    if (title.trim().length < 5) {
      return NextResponse.json({ error: 'العنوان قصير جداً' }, { status: 400 })
    }

    if (description.trim().length < 20) {
      return NextResponse.json({ error: 'الوصف قصير جداً' }, { status: 400 })
    }

    const parsedHours = parseFloat(hours)
    if (isNaN(parsedHours) || parsedHours < 1) {
      return NextResponse.json({ error: 'عدد الساعات غير صحيح' }, { status: 400 })
    }

    const parsedBudget = budget ? parseFloat(budget) : null
    if (parsedBudget !== null && (isNaN(parsedBudget) || parsedBudget < 0)) {
      return NextResponse.json({ error: 'الميزانية غير صحيحة' }, { status: 400 })
    }

    const project = await prisma.projectPost.create({
      data: {
        consumerId: userId,
        title: title.trim(),
        description: description.trim(),
        hours: parsedHours,
        budget: parsedBudget,
      },
    })

    return NextResponse.json({ id: project.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/projects]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
