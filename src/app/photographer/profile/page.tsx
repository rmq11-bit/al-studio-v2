'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SPECIALTY_LABELS, SPECIALTY_KEYS } from '@/lib/specialties'
import {
  User, MapPin, Clock, FileText, Phone, Save, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react'

interface Profile {
  hourlyRate: number
  specialties: string[]
  location: string | null
  bio: string | null
  user: { name: string; bio: string | null; avatarUrl: string | null; phone: string | null }
}

export default function PhotographerProfileEditPage() {
  const { data: session, status } = useSession()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fetching, setFetching] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [hourlyRate, setHourlyRate] = useState(0)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Redirect if wrong role
  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'PHOTOGRAPHER') {
      window.location.href = '/'
    }
    if (status === 'unauthenticated') {
      window.location.href = '/auth/login'
    }
  }, [status, session])

  // Fetch current profile
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/photographer/profile')
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data)
        setName(data.user.name ?? '')
        setBio(data.user.bio ?? '')
        setPhone(data.user.phone ?? '')
        setLocation(data.location ?? '')
        setHourlyRate(data.hourlyRate)
        setSelectedSpecialties(data.specialties)
        setAvatarUrl(data.user.avatarUrl ?? '')
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [status])

  function toggleSpecialty(key: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (hourlyRate < 0) { setError('السعر لا يمكن أن يكون سالباً'); return }
    if (selectedSpecialties.length === 0) { setError('اختر تخصصاً واحداً على الأقل'); return }

    setSaving(true)

    const res = await fetch('/api/photographer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        location: location.trim() || null,
        hourlyRate,
        specialties: selectedSpecialties,
        avatarUrl: avatarUrl.trim() || null,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'حدث خطأ'); return }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-[#C0A4A3]" />
            تعديل الملف الشخصي
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                تم حفظ التغييرات بنجاح
              </div>
            )}

            {/* Personal info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">المعلومات الشخصية</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    required minLength={2}
                    className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">نبذة شخصية</label>
                <div className="relative">
                  <FileText className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={bio} onChange={(e) => setBio(e.target.value)}
                    rows={3} maxLength={500}
                    placeholder="اكتب نبذة مختصرة عن نفسك وخبرتك..."
                    className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all resize-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-left" dir="ltr">{bio.length} / 500</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  رقم الجوال
                  <span className="text-gray-400 font-normal mr-1">(اختياري)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">رابط الصورة الشخصية (URL)</label>
                <input
                  type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                />
              </div>
            </div>

            {/* Professional info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">المعلومات المهنية</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#C0A4A3]" />
                    السعر بالساعة (ريال)
                  </label>
                  <input
                    type="number" value={hourlyRate}
                    onChange={(e) => setHourlyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={0} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C0A4A3]" />
                    الموقع
                  </label>
                  <input
                    type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="الرياض، جدة..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">التخصصات</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_KEYS.map((key) => (
                    <button
                      key={key} type="button" onClick={() => toggleSpecialty(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        selectedSpecialties.includes(key)
                          ? 'border-[#C0A4A3] bg-[#C0A4A3] text-white'
                          : 'border-gray-200 text-gray-500 hover:border-[#C0A4A3]/50'
                      }`}
                    >
                      {SPECIALTY_LABELS[key]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#C0A4A3] text-white py-3 rounded-xl font-semibold hover:bg-[#A88887] transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
