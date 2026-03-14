import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProjectCard from '@/components/ProjectCard'
import Link from 'next/link'
import { FolderOpen, Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const session = await auth()
  const role = session?.user?.role

  const projects = await prisma.projectPost.findMany({
    where: { status: 'OPEN' },
    include: {
      consumer: { select: { name: true } },
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">المشاريع المتاحة</h1>
              <p className="text-gray-400 mt-1 text-sm">
                {projects.length} مشروع مفتوح بانتظار عروض المصورين
              </p>
            </div>

            {/* Only consumers can post projects */}
            {role === 'CONSUMER' && (
              <Link
                href="/projects/new"
                className="flex items-center gap-2 bg-[#C0A4A3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#A88887] transition-colors"
              >
                <Plus className="w-4 h-4" />
                نشر مشروع
              </Link>
            )}
          </div>

          {/* Project grid */}
          {projects.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <FolderOpen className="w-14 h-14 mx-auto mb-4 text-gray-200" />
              <p className="text-xl font-medium">لا توجد مشاريع مفتوحة حالياً</p>
              {role === 'CONSUMER' && (
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 mt-4 text-[#C0A4A3] font-semibold hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  كن أول من ينشر مشروعاً
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
