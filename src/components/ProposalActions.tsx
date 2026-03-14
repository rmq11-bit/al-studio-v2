'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Props {
  proposalId: string
  projectId: string
}

export default function ProposalActions({ proposalId, projectId }: Props) {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleAction(action: 'ACCEPTED' | 'REJECTED') {
    setError('')
    setLoading(action === 'ACCEPTED' ? 'accept' : 'reject')

    const res = await fetch(`/api/proposals/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action }),
    })

    const data = await res.json()
    setLoading(null)

    if (!res.ok) {
      setError(data.error ?? 'حدث خطأ')
      return
    }

    setDone(true)
    // Reload to refresh proposal statuses and project status
    window.location.reload()
  }

  if (done) return null

  return (
    <div className="flex gap-2">
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <button
        onClick={() => handleAction('ACCEPTED')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-60"
      >
        {loading === 'accept' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5" />
        )}
        قبول
      </button>
      <button
        onClick={() => handleAction('REJECTED')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
      >
        {loading === 'reject' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <XCircle className="w-3.5 h-3.5" />
        )}
        رفض
      </button>
    </div>
  )
}
