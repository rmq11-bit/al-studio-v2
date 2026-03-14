import Link from 'next/link'
import { Clock, Banknote, FileText, Users } from 'lucide-react'

interface Props {
  project: {
    id: string
    title: string
    description: string
    hours: number
    budget: number | null
    status: string
    createdAt: Date
    consumer: { name: string }
    _count: { proposals: number }
  }
}

export default function ProjectCard({ project }: Props) {
  const postedAt = new Date(project.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-gray-800 group-hover:text-[#C0A4A3] transition-colors line-clamp-2 leading-snug">
            {project.title}
          </h3>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
              project.status === 'OPEN'
                ? 'bg-green-50 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {project.status === 'OPEN' ? 'مفتوح' : 'مغلق'}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {project.hours} ساعة
          </span>
          {project.budget && (
            <span className="flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" />
              {project.budget.toLocaleString('ar-SA')} ريال
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {project._count.proposals} عرض
          </span>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
          <span>{project.consumer.name}</span>
          <span>{postedAt}</span>
        </div>
      </div>
    </Link>
  )
}
