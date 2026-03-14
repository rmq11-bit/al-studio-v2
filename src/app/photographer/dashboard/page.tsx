import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  Camera,
  Images,
  CalendarDays,
  MessageSquare,
  Star,
  TrendingUp,
  UserCog,
  CalendarOff,
  Mail,
  Phone,
} from 'lucide-react'
import { SPECIALTY_LABELS } from '@/lib/specialties'

const STATUS_MAP = {
  PENDING:   { label: 'معلق',   cls: 'bg-yellow-50 text-yellow-600' },
  ACCEPTED:  { label: 'مقبول',  cls: 'bg-green-50 text-green-600'  },
  REJECTED:  { label: 'مرفوض', cls: 'bg-red-50 text-red-600'      },
  COMPLETED: { label: 'مكتمل', cls: 'bg-gray-100 text-gray-500'   },
} as const

export default async function PhotographerDashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect('/auth/login')

  const profile = await prisma.photographerProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      media: { orderBy: { createdAt: 'desc' }, take: 6 },
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          consumer: { select: { name: true, email: true, phone: true } },
          conversation: { select: { id: true } },
        },
      },
      reviews: { select: { rating: true } },
      _count: { select: { media: true, bookings: true, proposals: true } },
    },
  })

  if (!profile) redirect('/')

  const pendingBookings  = profile.bookings.filter((b) => b.status === 'PENDING').length
  const acceptedBookings = profile.bookings.filter((b) => b.status === 'ACCEPTED').length
  const reviewCount = profile.reviews.length
  const avgRating = reviewCount
    ? profile.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Welcome bar */}
          <div className="flex items-center gap-4 mb-8">
            {profile.user.avatarUrl ? (
              <img
                src={profile.user.avatarUrl}
                alt={profile.user.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#C0A4A3]/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#C0A4A3] flex items-center justify-center text-white text-xl font-bold">
                {(profile.user.name ?? '؟')[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                أهلاً، {profile.user.name} 👋
              </h1>
              <p className="text-gray-400 text-sm">{profile.user.email}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { href: '/photographer/profile',      icon: <UserCog className="w-5 h-5" />,    label: 'تعديل الملف الشخصي', desc: 'التخصصات، السعر، النبذة' },
              { href: '/photographer/media',         icon: <Images className="w-5 h-5" />,     label: 'معرض الأعمال',       desc: 'رفع وإدارة الصور'      },
              { href: '/photographer/availability',  icon: <CalendarOff className="w-5 h-5" />, label: 'التوفر',             desc: 'حدد أيام الغياب'       },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#C0A4A3]/40 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center group-hover:bg-[#C0A4A3] group-hover:text-white transition-colors shrink-0">
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{action.label}</p>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Photos stat */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{profile._count.media}</p>
                <p className="text-xs text-gray-400">الصور</p>
              </div>
            </div>

            {/* Bookings stat — clickable */}
            <Link
              href="/photographer/bookings"
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-[#C0A4A3]/40 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center group-hover:bg-[#C0A4A3] group-hover:text-white transition-colors">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-800">{profile._count.bookings}</p>
                  {pendingBookings > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full font-semibold">
                      {pendingBookings} جديد
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">الحجوزات</p>
              </div>
            </Link>

            {/* Proposals stat */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{profile._count.proposals}</p>
                <p className="text-xs text-gray-400">العروض</p>
              </div>
            </div>

            {/* Avg rating stat */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{avgRating ? avgRating.toFixed(1) : '—'}</p>
                <p className="text-xs text-gray-400">متوسط التقييم</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Profile Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-[#C0A4A3]" />
                <h2 className="font-bold text-gray-800">ملف المصور</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">السعر بالساعة</span>
                  <span className="font-semibold">{profile.hourlyRate.toLocaleString('ar-SA')} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">الموقع</span>
                  <span className="font-semibold">{profile.location ?? '—'}</span>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">التخصصات</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialties.length === 0 ? (
                      <span className="text-gray-300 text-xs">لم تُحدَّد بعد</span>
                    ) : (
                      profile.specialties.map((s) => (
                        <span
                          key={s}
                          className="bg-[#C0A4A3]/10 text-[#C0A4A3] px-2 py-0.5 rounded-full text-xs font-medium"
                        >
                          {SPECIALTY_LABELS[s] ?? s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#C0A4A3]" />
                  <h2 className="font-bold text-gray-800">الحجوزات</h2>
                  <span className="text-xs text-gray-400">({profile.bookings.length})</span>
                </div>
                <Link
                  href="/photographer/bookings"
                  className="text-xs text-[#C0A4A3] hover:text-[#A88887] font-medium transition-colors flex items-center gap-1"
                >
                  عرض الكل ←
                </Link>
              </div>

              {profile.bookings.length === 0 ? (
                <p className="text-gray-300 text-sm text-center py-6">لا توجد حجوزات بعد</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {profile.bookings.map((b) => {
                    const st = STATUS_MAP[b.status as keyof typeof STATUS_MAP]
                      ?? { label: b.status, cls: 'bg-gray-100 text-gray-500' }
                    return (
                      <div
                        key={b.id}
                        className={`rounded-xl p-3 border transition-colors ${
                          b.status === 'ACCEPTED'
                            ? 'border-green-100 bg-green-50/30'
                            : 'border-gray-50 bg-gray-50/50'
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 text-sm">{b.consumer.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>
                              {st.label}
                            </span>
                            {b.conversation && (
                              <Link
                                href={`/messages/${b.conversation.id}`}
                                className="p-1 rounded-lg bg-[#C0A4A3]/10 text-[#C0A4A3] hover:bg-[#C0A4A3]/20 transition-colors"
                                title="فتح المحادثة"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Date / hours */}
                        <p className="text-xs text-gray-400">{b.date} · {b.hours} ساعة</p>

                        {/* ── Contact info — only for ACCEPTED bookings ── */}
                        {b.status === 'ACCEPTED' && (
                          <div className="mt-2 pt-2 border-t border-green-100 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                              <a
                                href={`mailto:${b.consumer.email}`}
                                className="hover:text-[#C0A4A3] transition-colors truncate"
                              >
                                {b.consumer.email}
                              </a>
                            </div>
                            {b.consumer.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                <a
                                  href={`tel:${b.consumer.phone}`}
                                  className="hover:text-[#C0A4A3] transition-colors"
                                  dir="ltr"
                                >
                                  {b.consumer.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Rejection note */}
                        {b.status === 'REJECTED' && b.rejectionNote && (
                          <p className="mt-1.5 text-[10px] text-red-400 italic">{b.rejectionNote}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Media Gallery Preview */}
          {profile.media.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Images className="w-5 h-5 text-[#C0A4A3]" />
                <h2 className="font-bold text-gray-800">معرض الأعمال</h2>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {profile.media.map((m) => (
                  <img
                    key={m.id}
                    src={m.url}
                    alt={m.caption ?? 'صورة'}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
