import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import BookingActions from '@/components/BookingActions'
import { CalendarDays, ArrowRight, Mail, Phone, MessageSquare } from 'lucide-react'

const STATUS_MAP = {
  PENDING:   { label: 'معلق',   cls: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  ACCEPTED:  { label: 'مقبول',  cls: 'bg-green-50 text-green-600 border-green-200'   },
  REJECTED:  { label: 'مرفوض', cls: 'bg-red-50 text-red-600 border-red-200'         },
  COMPLETED: { label: 'مكتمل', cls: 'bg-gray-100 text-gray-500 border-gray-200'     },
} as const

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  ACCEPTED: 1,
  COMPLETED: 2,
  REJECTED: 3,
}

export default async function PhotographerBookingsPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect('/auth/login')

  const profile = await prisma.photographerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      bookings: {
        orderBy: { createdAt: 'desc' },
        include: {
          consumer: { select: { name: true, email: true, phone: true } },
          conversation: { select: { id: true } },
        },
      },
    },
  })

  if (!profile) redirect('/')

  // Sort: PENDING → ACCEPTED → COMPLETED → REJECTED, then by newest
  const bookings = [...profile.bookings].sort((a, b) => {
    const ao = STATUS_ORDER[a.status] ?? 99
    const bo = STATUS_ORDER[b.status] ?? 99
    if (ao !== bo) return ao - bo
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <Link
            href="/photographer/dashboard"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للوحة التحكم
          </Link>

          {/* Page header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">الحجوزات</h1>
              <p className="text-sm text-gray-400">
                {bookings.length} حجز إجمالي
                {pendingCount > 0 && (
                  <span className="mr-2 text-yellow-600 font-medium">· {pendingCount} في الانتظار</span>
                )}
              </p>
            </div>
          </div>

          {/* Empty state */}
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
              <CalendarDays className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="font-medium text-gray-400">لا توجد حجوزات بعد</p>
              <p className="text-sm text-gray-300 mt-1">ستظهر الحجوزات هنا عندما يحجزك العملاء</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const st = STATUS_MAP[b.status as keyof typeof STATUS_MAP]
                  ?? { label: b.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' }

                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                      b.status === 'PENDING'
                        ? 'border-yellow-100'
                        : b.status === 'ACCEPTED'
                        ? 'border-green-100'
                        : 'border-gray-100'
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800">{b.consumer.name}</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {b.date} · {b.hours} ساعة
                        </p>
                        {b.notes && (
                          <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                            {b.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                          {st.label}
                        </span>
                        {b.conversation && (
                          <Link
                            href={`/messages/${b.conversation.id}`}
                            className="p-1.5 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] hover:bg-[#C0A4A3]/20 transition-colors"
                            title="فتح المحادثة"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Contact info — ACCEPTED only */}
                    {b.status === 'ACCEPTED' && (
                      <div className="mt-3 pt-3 border-t border-green-100 space-y-1.5">
                        <p className="text-xs font-semibold text-green-600 mb-2">بيانات التواصل مع العميل</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <a
                            href={`mailto:${b.consumer.email}`}
                            className="hover:text-[#C0A4A3] transition-colors truncate"
                          >
                            {b.consumer.email}
                          </a>
                        </div>
                        {b.consumer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
                      <p className="mt-2 text-sm text-red-400 italic">{b.rejectionNote}</p>
                    )}

                    {/* Accept / Reject — PENDING only */}
                    {b.status === 'PENDING' && <BookingActions bookingId={b.id} />}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
