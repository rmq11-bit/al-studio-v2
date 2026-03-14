'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CalendarDays, ChevronRight, ChevronLeft, Loader2, Info } from 'lucide-react'

const DAYS_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function AvailabilityPage() {
  const { data: session, status } = useSession()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())   // 0-indexed

  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [fetching, setFetching] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'PHOTOGRAPHER') {
      window.location.href = '/'
    }
    if (status === 'unauthenticated') window.location.href = '/auth/login'
  }, [status, session])

  const fetchBlocked = useCallback(async () => {
    const res = await fetch('/api/photographer/availability')
    if (res.ok) {
      const data: string[] = await res.json()
      setBlockedDates(new Set(data))
    }
    setFetching(false)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchBlocked()
  }, [status, fetchBlocked])

  async function toggleDate(dateStr: string) {
    // Prevent toggling past dates
    if (dateStr < today.toLocaleDateString('sv-SE')) return

    setToggling(dateStr)
    const res = await fetch('/api/photographer/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr }),
    })
    const data = await res.json()
    setToggling(null)

    if (res.ok) {
      setBlockedDates((prev) => {
        const next = new Set(prev)
        if (data.blocked) next.add(dateStr)
        else next.delete(dateStr)
        return next
      })
    }
  }

  // Build calendar grid for current month
  const firstDay = new Date(year, month, 1).getDay()   // 0=Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toLocaleDateString('sv-SE')

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  if (fetching || status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C0A4A3] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#C0A4A3]" />
            إدارة التوفر
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            اضغط على أي يوم لتحديده كغير متاح (باللون الأحمر). اضغط مرة أخرى لإلغاء التحديد.
          </p>

          {/* Info banner */}
          <div className="flex items-start gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-xs mb-5">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>كل الأيام متاحة بشكل افتراضي. حدد فقط الأيام التي لن تكون متاحاً فيها.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <h2 className="font-bold text-gray-800">
                {MONTHS_AR[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_AR.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before month start */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateStr = toYMD(year, month, day)
                const isBlocked = blockedDates.has(dateStr)
                const isPast = dateStr < todayStr
                const isToday = dateStr === todayStr
                const isToggling = toggling === dateStr

                return (
                  <button
                    key={day}
                    onClick={() => toggleDate(dateStr)}
                    disabled={isPast || isToggling}
                    className={`
                      aspect-square rounded-xl text-sm font-medium transition-all relative
                      ${isPast
                        ? 'text-gray-200 cursor-not-allowed'
                        : isBlocked
                        ? 'bg-red-100 text-red-600 hover:bg-red-200 ring-2 ring-red-300'
                        : isToday
                        ? 'bg-[#C0A4A3]/20 text-[#C0A4A3] font-bold hover:bg-[#C0A4A3]/30 ring-2 ring-[#C0A4A3]'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                    ) : (
                      day
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-100 ring-1 ring-red-300" />
                غير متاح
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#C0A4A3]/20 ring-1 ring-[#C0A4A3]" />
                اليوم
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gray-100" />
                متاح
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            {blockedDates.size} يوم محدد كغير متاح
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
