'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { SPECIALTY_LABELS } from '@/lib/specialties'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

export default function BrowseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') ?? '')
  const [minRate, setMinRate] = useState(searchParams.get('minRate') ?? '')
  const [maxRate, setMaxRate] = useState(searchParams.get('maxRate') ?? '')

  const hasActiveFilters = !!(q || specialty || minRate || maxRate)
  const hasAdvancedFilters = !!(specialty || minRate || maxRate)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (specialty) params.set('specialty', specialty)
    if (minRate) params.set('minRate', minRate)
    if (maxRate) params.set('maxRate', maxRate)
    startTransition(() => {
      router.push(`/browse?${params.toString()}`)
    })
  }

  function handleReset() {
    setQ('')
    setSpecialty('')
    setMinRate('')
    setMaxRate('')
    startTransition(() => router.push('/browse'))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
    >
      {/* Always visible: search + filters toggle + search button */}
      <div className="flex gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مصور..."
            className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
          />
        </div>

        {/* Advanced filters toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0 ${
            hasAdvancedFilters
              ? 'border-[#C0A4A3] bg-[#C0A4A3]/10 text-[#C0A4A3]'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">فلاتر</span>
          {hasAdvancedFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0A4A3] shrink-0" />
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Search button */}
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-[#C0A4A3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-60 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">{isPending ? 'جاري...' : 'بحث'}</span>
        </button>
      </div>

      {/* Advanced filters — collapsible */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Specialty */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                التخصص
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all bg-white"
              >
                <option value="">كل التخصصات</option>
                {Object.entries(SPECIALTY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Min rate */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                أدنى سعر (ريال/ساعة)
              </label>
              <input
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
              />
            </div>

            {/* Max rate */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                أقصى سعر (ريال/ساعة)
              </label>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                placeholder="لا حد"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {q && (
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
              بحث: {q}
              <button type="button" onClick={() => setQ('')} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {specialty && (
            <span className="flex items-center gap-1 bg-[#C0A4A3]/10 text-[#C0A4A3] text-xs px-2.5 py-1 rounded-full">
              {SPECIALTY_LABELS[specialty] ?? specialty}
              <button type="button" onClick={() => setSpecialty('')} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(minRate || maxRate) && (
            <span className="flex items-center gap-1 bg-[#C0A4A3]/10 text-[#C0A4A3] text-xs px-2.5 py-1 rounded-full">
              {minRate && `من ${minRate}`}{minRate && maxRate && ' '}{maxRate && `حتى ${maxRate}`} ريال
              <button type="button" onClick={() => { setMinRate(''); setMaxRate('') }} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium mr-auto"
          >
            مسح الكل
          </button>
        </div>
      )}
    </form>
  )
}
