import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import ChatView from '@/components/ChatView'
import Link from 'next/link'
import { ArrowRight, Calendar, FolderOpen, Clock, Banknote } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/auth/login')

  const role = session.user.role

  // Load conversation with full context
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      consumer: { select: { id: true, name: true, avatarUrl: true } },
      photographer: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      booking: { select: { id: true, date: true, hours: true, status: true, notes: true } },
      proposal: {
        include: {
          project: { select: { id: true, title: true, description: true } },
        },
      },
    },
  })

  if (!conversation) notFound()

  // Verify the current user is a participant
  const photographerUserId = conversation.photographer.user.id
  const consumerUserId = conversation.consumer.id

  if (userId !== photographerUserId && userId !== consumerUserId) {
    redirect('/messages')
  }

  // Determine the "other party" from the current user's perspective
  const isConsumer = userId === consumerUserId
  const otherParty = isConsumer
    ? { name: conversation.photographer.user.name, avatarUrl: conversation.photographer.user.avatarUrl }
    : { name: conversation.consumer.name, avatarUrl: conversation.consumer.avatarUrl }

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full overflow-hidden">
        {/* Conversation header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <Link href="/messages" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>

          {otherParty.avatarUrl ? (
            <img
              src={otherParty.avatarUrl}
              alt={otherParty.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#C0A4A3] flex items-center justify-center text-white font-bold shrink-0">
              {otherParty.name[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{otherParty.name}</p>

            {/* Context banner */}
            {conversation.type === 'BOOKING' && conversation.booking && (
              <p className="text-xs text-[#C0A4A3] flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {conversation.booking.date} ·{' '}
                <Clock className="w-3 h-3 mr-1" />
                {conversation.booking.hours} ساعة ·{' '}
                <span
                  className={`font-semibold ${
                    conversation.booking.status === 'ACCEPTED'
                      ? 'text-green-600'
                      : conversation.booking.status === 'REJECTED'
                      ? 'text-red-500'
                      : 'text-yellow-600'
                  }`}
                >
                  {conversation.booking.status === 'PENDING' && 'معلق'}
                  {conversation.booking.status === 'ACCEPTED' && 'مقبول'}
                  {conversation.booking.status === 'REJECTED' && 'مرفوض'}
                  {conversation.booking.status === 'COMPLETED' && 'مكتمل'}
                </span>
              </p>
            )}

            {conversation.type === 'PROPOSAL' && conversation.proposal && (
              <p className="text-xs text-[#C0A4A3] flex items-center gap-1 mt-0.5">
                <FolderOpen className="w-3 h-3" />
                {conversation.proposal.project.title} ·{' '}
                <Banknote className="w-3 h-3 mr-1" />
                {conversation.proposal.price.toLocaleString('ar-SA')} ريال
              </p>
            )}
          </div>
        </div>

        {/* Chat — client component handles messages + send */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ChatView
            conversationId={id}
            currentUserId={userId}
            currentUserName={session.user.name ?? ''}
          />
        </div>
      </div>
    </div>
  )
}
