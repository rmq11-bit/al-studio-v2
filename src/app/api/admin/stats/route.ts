import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const [
      totalUsers,
      totalPhotographers,
      totalConsumers,
      totalMedia,
      totalProjects,
      totalBookings,
      pendingBookings,
      recentUsers,
      recentPhotographers,
      recentMedia,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PHOTOGRAPHER' } }),
      prisma.user.count({ where: { role: 'CONSUMER' } }),
      prisma.media.count(),
      prisma.projectPost.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),

      // Recent activity — last 5 users
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBanned: true,
          createdAt: true,
        },
      }),

      // Recent activity — last 5 photographer sign-ups
      prisma.photographerProfile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          hourlyRate: true,
          location: true,
          isActive: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { media: true } },
        },
      }),

      // Recent activity — last 6 media uploads
      prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          url: true,
          caption: true,
          createdAt: true,
          photographer: {
            select: { user: { select: { name: true } } },
          },
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalPhotographers,
      totalConsumers,
      totalMedia,
      totalProjects,
      totalBookings,
      pendingBookings,
      recentUsers,
      recentPhotographers,
      recentMedia,
    })
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
