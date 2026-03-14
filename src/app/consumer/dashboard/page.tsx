import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import ReviewButton from '@/components/ReviewButton'
import { Search, CalendarDays, FolderOpen, Plus, ArrowLeft } from 'lucide-react'

const STATUS_MAP = {
  PENDING:   { label: 'معلق',   cls: 'bg-yellow-50 text-yellow-600' },
  ACCEPTED:  { label: 'مقبول',  cls: 'bg-green-50 text-green-600'  },
  REJECTED:  { label: 'مرفوض', cls: 'bg-red-50 text-red-600'      },
  COMPLETED: { label: 'مكتمل', cls: 'bg-gray-100 text-gray-500'   },
} as const

export default async function ConsumerDashboardPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/auth/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookingsAsConsumer: {
        orderBy: { createdAt: 'desc' },
        include: {
          photographer: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
          conversation: { select: { id: true } },
          // Fetch existing review so ReviewButton can display it without a fetch
          review: { select: { id: true, rating: true, comment: true } },
        },
      },
      projectPosts: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { proposals: true } } },
      },
      _count: { select: { bookingsAsConsumer: true, projectPosts: true } },
    },
  })

  if (!user) redirect('/auth/login')

  const pendingCount  = user.bookingsAsConsumer.filter(b => b.status === 'PENDING').length
  const acceptedCount = user.bookingsAsConsumer.filter(b => b.status === 'ACCEPTED').length

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">أهلاً، {user.name} 👋</h1>
            <p className="text-gray-400 text-sm mt-1">مرحباً بك في لوحة التحكم</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <CalendarDays className="w-5 h-5" />, label: 'حجوزاتي', value: user._count.bookingsAsConsumer },
              { icon: <span className="text-base">⏳</span>,  label: 'معلقة',   value: pendingCount  },
              { icon: <span className="text-base">✅</span>,  label: 'مقبولة',  value: acceptedCount },
              { icon: <FolderOpen className="w-5 h-5" />,    label: 'مشاريعي', value: user._count.projectPosts    },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/browse" className="flex items-center gap-3 bg-[#C0A4A3] text-white p-4 rounded-2xl hover:bg-[#A88887] transition-colors">
              <Search className="w-6 h-6 shrink-0" />
              <div><p className="font-bold text-sm">تصفح المصورين</p><p className="text-xs text-white/70">ابحث عن مصور مناسب</p></div>
            </Link>
            <Link href="/projects/new" className="flex items-center gap-3 bg-white border-2 border-[#C0A4A3] text-[#C0A4A3] p-4 rounded-2xl hover:bg-[#C0A4A3]/5 transition-colors">
              <Plus className="w-6 h-6 shrink-0" />
              <div><p className="font-bold text-sm">نشر مشروع</p><p className="text-xs text-[#C0A4A3]/70">استقبل عروضاً من المصورين</p></div>
            </Link>
          </div>

          {/* ── All Booking Requests ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#C0A4A3]" />
                طلبات الحجز
                <span className="text-xs text-gray-400 font-normal">({user.bookingsAsConsumer.length})</span>
              </h2>
            </div>

            {user.bookingsAsConsumer.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <CalendarDays className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">لم ترسل أي طلب حجز بعد</p>
                <Link href="/browse" className="text-[#C0A4A3] text-xs mt-2 inline-block hover:underline">
                  تصفح المصورين واحجز الآن
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {user.bookingsAsConsumer.map(b => {
                  const st = STATUS_MAP[b.status as keyof typeof STATUS_MAP] ?? { label: b.status, cls: 'bg-gray-100 text-gray-500' }
                  return (
                    <div key={b.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {b.photographer.user.avatarUrl ? (
                          <img src={b.photographer.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#C0A4A3] flex items-center justify-center text-white font-bold shrink-0">
                            {b.photographer.user.name[0]}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{b.photographer.user.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {b.date} · {b.hours} ساعة
                            {b.notes && <span className="mr-1">· <span className="text-gray-500 italic">{b.notes.slice(0, 40)}{b.notes.length > 40 ? '…' : ''}</span></span>}
                          </p>
                        </div>

                        {/* Status + rejection note */}
                        <div className="shrink-0 text-left flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                          {b.status === 'REJECTED' && b.rejectionNote && (
                            <span className="text-[10px] text-red-400 max-w-[120px] text-right truncate">{b.rejectionNote}</span>
                          )}
                        </div>

                        {/* Chat link */}
                        {b.conversation && (
                          <Link href={`/messages/${b.conversation.id}`} className="shrink-0 text-[#C0A4A3] hover:text-[#A88887] transition-colors" title="فتح المحادثة">
                            <ArrowLeft className="w-4 h-4" />
                          </Link>
                        )}
                      </div>

                      {/* Review row — only for COMPLETED bookings */}
                      {b.status === 'COMPLETED' && (
                        <div className="mt-2 pr-13">
                          <ReviewButton
                            bookingId={b.id}
                            photographerName={b.photographer.user.name}
                            existingReview={b.review
                              ? { rating: b.review.rating, comment: b.review.comment }
                              : null
                            }
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Projects */}
          {user.projectPosts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#C0A4A3]" />
                  مشاريعي
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {user.projectPosts.map(p => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p._count.proposals} عرض</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'OPEN' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'OPEN' ? 'مفتوح' : 'مغلق'}
                      </span>
                      <ArrowLeft className="w-4 h-4 text-gray-300" />
                    </div>
                  </Link>
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
