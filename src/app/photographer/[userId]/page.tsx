import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingForm from '@/components/BookingForm'
import RatingStars from '@/components/RatingStars'
import { MapPin, Clock, Star, ImageIcon, CheckCircle, BadgeCheck } from 'lucide-react'
import { SPECIALTY_LABELS } from '@/lib/specialties'
import GalleryViewer from '@/components/GalleryViewer'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function PhotographerProfilePage({ params }: PageProps) {
  const { userId } = await params

  const photographer = await prisma.photographerProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, bio: true } },
      media: { orderBy: { createdAt: 'desc' } },
      unavailableDates: { select: { date: true } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          consumer: { select: { name: true } },
        },
      },
      _count: {
        select: {
          bookings: { where: { status: 'COMPLETED' } },
        },
      },
    },
  })

  if (!photographer || !photographer.isActive) notFound()

  const session = await auth()
  const viewerRole = session?.user?.role
  const viewerId = session?.user?.id

  const canBook = viewerRole === 'CONSUMER'
  const blockedDates = photographer.unavailableDates.map((d) => d.date)

  // ── Computed stats ─────────────────────────────────────────────────────────
  const reviewCount = photographer.reviews.length
  const avgRating = reviewCount
    ? photographer.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : null
  const completedBookings = photographer._count.bookings

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left column: profile info ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Profile header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {photographer.user.avatarUrl ? (
                    <img
                      src={photographer.user.avatarUrl}
                      alt={photographer.user.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#C0A4A3]/20 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#C0A4A3] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0">
                      {photographer.user.name[0]}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-gray-800">
                        {photographer.user.name}
                      </h1>
                      {photographer.isPro && (
                        <span className="bg-amber-400 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                          PRO
                        </span>
                      )}
                      {photographer.verifiedBadge && (
                        <span className="flex items-center gap-0.5 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-xs font-semibold">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          موثّق
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                      {photographer.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {photographer.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {photographer.hourlyRate.toLocaleString('ar-SA')} ريال/ساعة
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {photographer.specialties.map((s) => (
                        <span
                          key={s}
                          className="bg-[#C0A4A3]/10 text-[#C0A4A3] px-2.5 py-0.5 rounded-full text-xs font-medium"
                        >
                          {SPECIALTY_LABELS[s] ?? s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {photographer.user.bio && (
                  <p className="text-gray-500 text-sm leading-relaxed mt-4 pt-4 border-t border-gray-100">
                    {photographer.user.bio}
                  </p>
                )}
              </div>

              {/* ── Stats row ── */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-800">{completedBookings}</p>
                  <p className="text-xs text-gray-400 mt-0.5">جلسة مكتملة</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-800">
                    {avgRating ? avgRating.toFixed(1) : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">متوسط التقييم</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-4 h-4 text-amber-200" />
                  </div>
                  <p className="text-xl font-bold text-gray-800">{reviewCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">تقييم</p>
                </div>
              </div>

              {/* Media gallery */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-[#C0A4A3]" />
                  <h2 className="font-bold text-gray-800">معرض الأعمال</h2>
                  <span className="text-xs text-gray-400 mr-auto">
                    {photographer.media.length} صورة
                  </span>
                </div>

                <GalleryViewer media={photographer.media} />
              </div>

              {/* ── Reviews section ── */}
              {reviewCount > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-5">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <h2 className="font-bold text-gray-800">التقييمات</h2>
                    <span className="text-xs text-gray-400">({reviewCount})</span>
                    {avgRating && (
                      <div className="mr-auto flex items-center gap-1.5">
                        <RatingStars value={avgRating} size="sm" />
                        <span className="text-sm font-bold text-gray-700">{avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {photographer.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {/* Anonymous avatar */}
                            <div className="w-8 h-8 rounded-full bg-[#C0A4A3]/20 flex items-center justify-center text-[#C0A4A3] font-bold text-sm shrink-0">
                              {review.consumer.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-700">
                                {review.consumer.name.split(' ')[0]}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                          <RatingStars value={review.rating} size="sm" />
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-gray-500 leading-relaxed pr-10">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column: booking card ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="font-bold text-gray-800 mb-1">احجز الآن</h2>
                <p className="text-sm text-gray-400 mb-5">
                  {photographer.hourlyRate.toLocaleString('ar-SA')} ريال لكل ساعة
                </p>

                {canBook && viewerId ? (
                  <BookingForm
                    photographerId={photographer.id}
                    consumerId={viewerId}
                    blockedDates={blockedDates}
                    hourlyRate={photographer.hourlyRate}
                  />
                ) : viewerRole === 'PHOTOGRAPHER' ? (
                  <p className="text-sm text-center text-gray-400 py-4">
                    لا يمكن للمصورين حجز مصورين آخرين
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400 mb-3">
                      سجّل الدخول كعميل لحجز هذا المصور
                    </p>
                    <a
                      href="/auth/login"
                      className="block bg-[#C0A4A3] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#A88887] transition-colors"
                    >
                      تسجيل الدخول
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
