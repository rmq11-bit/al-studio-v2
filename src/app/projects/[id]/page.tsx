import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProposalForm from '@/components/ProposalForm'
import ProposalActions from '@/components/ProposalActions'
import { Clock, Banknote, Calendar, Users, CheckCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params

  const project = await prisma.projectPost.findUnique({
    where: { id },
    include: {
      consumer: { select: { id: true, name: true } },
      proposals: {
        include: {
          photographer: {
            include: {
              user: { select: { name: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!project) notFound()

  const session = await auth()
  const role = session?.user?.role
  const userId = session?.user?.id

  const isOwner = role === 'CONSUMER' && userId === project.consumer.id

  // Find this photographer's profile id if they are a photographer
  let photographerProfileId: string | null = null
  let hasAlreadyProposed = false

  if (role === 'PHOTOGRAPHER' && userId) {
    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    photographerProfileId = profile?.id ?? null

    if (photographerProfileId) {
      hasAlreadyProposed = project.proposals.some(
        (p) => p.photographerId === photographerProfileId
      )
    }
  }

  const postedAt = new Date(project.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left: Project details ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Project header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 leading-snug">
                    {project.title}
                  </h1>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'OPEN'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {project.status === 'OPEN' ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>

                <p className="text-gray-500 leading-relaxed text-sm mb-5">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#C0A4A3]" />
                    {project.hours} ساعة
                  </span>
                  {project.budget && (
                    <span className="flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-[#C0A4A3]" />
                      ميزانية: {project.budget.toLocaleString('ar-SA')} ريال
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#C0A4A3]" />
                    {project.proposals.length} عرض
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#C0A4A3]" />
                    {postedAt}
                  </span>
                </div>
              </div>

              {/* Proposals list — visible to the project owner */}
              {isOwner && project.proposals.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#C0A4A3]" />
                    عروض المصورين ({project.proposals.length})
                  </h2>

                  <div className="space-y-4">
                    {project.proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="border border-gray-100 rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          {proposal.photographer.user.avatarUrl ? (
                            <img
                              src={proposal.photographer.user.avatarUrl}
                              alt={proposal.photographer.user.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#C0A4A3] flex items-center justify-center text-white font-bold shrink-0">
                              {proposal.photographer.user.name[0]}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-800">
                                {proposal.photographer.user.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  proposal.status === 'PENDING'
                                    ? 'bg-yellow-50 text-yellow-600'
                                    : proposal.status === 'ACCEPTED'
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {proposal.status === 'PENDING' && 'معلق'}
                                {proposal.status === 'ACCEPTED' && 'مقبول'}
                                {proposal.status === 'REJECTED' && 'مرفوض'}
                              </span>
                            </div>

                            <p className="text-[#C0A4A3] font-bold text-sm mt-0.5">
                              {proposal.price.toLocaleString('ar-SA')} ريال
                            </p>

                            {proposal.message && (
                              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                                {proposal.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Accept/Reject actions — only for PENDING proposals on OPEN projects */}
                        {proposal.status === 'PENDING' && project.status === 'OPEN' && (
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            <ProposalActions
                              proposalId={proposal.id}
                              projectId={project.id}
                            />
                          </div>
                        )}

                        {proposal.status === 'ACCEPTED' && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            تم قبول هذا العرض
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Proposal card ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="font-bold text-gray-800 mb-1">قدّم عرضك</h2>
                <p className="text-sm text-gray-400 mb-5">
                  نشر بواسطة: {project.consumer.name}
                </p>

                {/* Show form only to photographers on open projects */}
                {role === 'PHOTOGRAPHER' && project.status === 'OPEN' && photographerProfileId ? (
                  hasAlreadyProposed ? (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">قدّمت عرضاً لهذا المشروع بالفعل</p>
                    </div>
                  ) : (
                    <ProposalForm
                      projectId={project.id}
                      photographerId={photographerProfileId}
                    />
                  )
                ) : isOwner ? (
                  <p className="text-sm text-center text-gray-400 py-4">
                    هذا مشروعك — يمكنك مراجعة العروض على اليسار
                  </p>
                ) : role === 'CONSUMER' ? (
                  <p className="text-sm text-center text-gray-400 py-4">
                    لا يمكن للعملاء تقديم عروض على المشاريع
                  </p>
                ) : project.status === 'CLOSED' ? (
                  <p className="text-sm text-center text-gray-400 py-4">
                    هذا المشروع مغلق ولا يقبل عروضاً جديدة
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400 mb-3">
                      سجّل الدخول كمصور لتقديم عرضك
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
