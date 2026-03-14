import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { MessageSquare, Calendar, FolderOpen, ChevronLeft } from 'lucide-react'

export default async function MessagesPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/auth/login')

  const role = session.user.role

  // Fetch conversations based on role
  let conversations: Awaited<ReturnType<typeof fetchForConsumer>> | Awaited<ReturnType<typeof fetchForPhotographer>> = []

  if (role === 'CONSUMER') {
    conversations = await fetchForConsumer(userId)
  } else if (role === 'PHOTOGRAPHER') {
    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (profile) conversations = await fetchForPhotographer(profile.id)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#C0A4A3]" />
            الرسائل
          </h1>

          {conversations.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-lg font-medium">لا توجد محادثات بعد</p>
              <p className="text-sm mt-1">تبدأ المحادثات عند قبول حجز أو عرض</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {conversations.map((c) => {
                const lastMsg = c.messages[0]
                const otherParty = role === 'CONSUMER'
                  ? (c as ConsumerConvo).photographer.user
                  : (c as PhotographerConvo).consumer

                const contextLabel = c.type === 'BOOKING'
                  ? `حجز · ${c.booking?.date ?? ''}`
                  : `مشروع · ${c.proposal?.project?.title ?? ''}`

                return (
                  <Link
                    key={c.id}
                    href={`/messages/${c.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Avatar */}
                    {otherParty.avatarUrl ? (
                      <img
                        src={otherParty.avatarUrl}
                        alt={otherParty.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#C0A4A3] flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {otherParty.name[0]}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800 truncate">{otherParty.name}</p>
                        {lastMsg && (
                          <time className="text-xs text-gray-400 shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleDateString('ar-SA', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        )}
                      </div>
                      <p className="text-xs text-[#C0A4A3] flex items-center gap-1 mt-0.5">
                        {c.type === 'BOOKING'
                          ? <Calendar className="w-3 h-3 shrink-0" />
                          : <FolderOpen className="w-3 h-3 shrink-0" />}
                        {contextLabel}
                      </p>
                      {lastMsg && (
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {lastMsg.body}
                        </p>
                      )}
                    </div>

                    <ChevronLeft className="w-4 h-4 text-gray-300 shrink-0" />
                  </Link>
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

// ── Typed fetchers ──────────────────────────────────────────────────────────

type ConsumerConvo = Awaited<ReturnType<typeof fetchForConsumer>>[number]
type PhotographerConvo = Awaited<ReturnType<typeof fetchForPhotographer>>[number]

function fetchForConsumer(userId: string) {
  return prisma.conversation.findMany({
    where: { consumerId: userId },
    include: {
      photographer: { include: { user: { select: { name: true, avatarUrl: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      booking: { select: { date: true, hours: true, status: true } },
      proposal: { select: { price: true, project: { select: { title: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

function fetchForPhotographer(profileId: string) {
  return prisma.conversation.findMany({
    where: { photographerId: profileId },
    include: {
      consumer: { select: { name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      booking: { select: { date: true, hours: true, status: true } },
      proposal: { select: { price: true, project: { select: { title: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}
