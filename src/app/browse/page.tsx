import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PhotographerCard from '@/components/PhotographerCard'
import BrowseFilters from '@/components/BrowseFilters'
import { Camera } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    specialty?: string
    minRate?: string
    maxRate?: string
    q?: string
  }>
}

async function PhotographerList({
  searchParams,
}: {
  searchParams: Awaited<PageProps['searchParams']>
}) {
  // ── Build Prisma where clause ─────────────────────────────────────────────
  const where: Record<string, unknown> = { isActive: true }

  // Note: specialty filter is applied in-memory after fetch (SQLite has no array `has` filter)
  const rateFilter: Record<string, number> = {}
  if (searchParams.minRate) {
    const v = parseFloat(searchParams.minRate)
    if (!isNaN(v)) rateFilter.gte = v
  }
  if (searchParams.maxRate) {
    const v = parseFloat(searchParams.maxRate)
    if (!isNaN(v)) rateFilter.lte = v
  }
  if (Object.keys(rateFilter).length > 0) where.hourlyRate = rateFilter

  let photographers = await prisma.photographerProfile.findMany({
    where,
    include: {
      user: { select: { name: true, avatarUrl: true } },
      media: { take: 4, orderBy: { createdAt: 'desc' } },
      // Fetch only ratings for computing avg — minimal data
      reviews: { select: { rating: true } },
      // Count completed bookings for ranking
      _count: {
        select: {
          bookings: { where: { status: 'COMPLETED' } },
        },
      },
    },
  })

  // In-memory filters (name search + specialty)
  if (searchParams.q) {
    const lower = searchParams.q.toLowerCase()
    photographers = photographers.filter((p) =>
      p.user.name.toLowerCase().includes(lower)
    )
  }
  if (searchParams.specialty) {
    photographers = photographers.filter((p) =>
      (p.specialties as unknown as string[]).includes(searchParams.specialty!)
    )
  }

  if (photographers.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <Camera className="w-14 h-14 mx-auto mb-4 text-gray-200" />
        <p className="text-xl font-medium">لا يوجد مصورون يطابقون البحث</p>
        <p className="text-sm mt-2">حاول تغيير معايير البحث أو إزالة الفلاتر</p>
      </div>
    )
  }

  // ── Compute per-photographer scores ──────────────────────────────────────
  const withScores = photographers.map((p) => {
    const reviewCount = p.reviews.length
    const avgRating = reviewCount
      ? p.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0
    return { ...p, avgRating, reviewCount, completedCount: p._count.bookings }
  })

  // ── Ranking: PRO → searchPriority → verifiedBadge → avgRating → completed ─
  withScores.sort((a, b) => {
    // 1. PRO photographers first
    if (a.isPro !== b.isPro) return a.isPro ? -1 : 1
    // 2. Higher search priority first (admin-controlled boost)
    if (a.searchPriority !== b.searchPriority) return b.searchPriority - a.searchPriority
    // 3. Verified badge
    if (a.verifiedBadge !== b.verifiedBadge) return a.verifiedBadge ? -1 : 1
    // 4. Higher avg rating first
    if (Math.abs(a.avgRating - b.avgRating) > 0.09) return b.avgRating - a.avgRating
    // 5. More completed bookings (activity signal)
    return b.completedCount - a.completedCount
  })

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4">
        {withScores.length} مصور متاح
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {withScores.map((p) => (
          <PhotographerCard
            key={p.id}
            photographer={p}
            avgRating={p.avgRating > 0 ? p.avgRating : null}
            reviewCount={p.reviewCount}
          />
        ))}
      </div>
    </div>
  )
}

// Detailed skeleton that mirrors PhotographerCard structure
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
    </div>
  )
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">تصفح المصورين</h1>
            <p className="text-gray-400 mt-1 text-sm">ابحث عن المصور المناسب لمشروعك</p>
          </div>

          <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100 mb-6" />}>
            <BrowseFilters />
          </Suspense>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            }
          >
            <PhotographerList searchParams={resolvedParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
