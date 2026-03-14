import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, Users, Star, Camera, CheckCircle, ArrowLeft } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#C0A4A3]/10 text-[#C0A4A3] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Camera className="w-4 h-4" />
              دليل الاستخدام
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">كيف يعمل الإستوديو؟</h1>
            <p className="text-gray-500 text-lg">
              دليل بسيط لكل من العملاء والمصورين
            </p>
          </div>

          {/* For clients */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#C0A4A3] text-white rounded-xl text-sm font-bold flex items-center justify-center">١</span>
              للعملاء — ابحث واحجز بسهولة
            </h2>

            <div className="space-y-4">
              {[
                {
                  icon: <Search className="w-5 h-5" />,
                  step: 'تصفح المصورين',
                  desc: 'استخدم فلاتر البحث للعثور على المصور المناسب — حسب التخصص (أفراح، تجاري، سينمائي...)، الموقع، أو النطاق السعري.',
                },
                {
                  icon: <Users className="w-5 h-5" />,
                  step: 'تفحّص الملفات الشخصية',
                  desc: 'اطّلع على معرض الأعمال، تقرأ التقييمات من عملاء سابقين، وتعرّف على أسلوب المصور قبل التواصل.',
                },
                {
                  icon: <Camera className="w-5 h-5" />,
                  step: 'أرسل طلب حجز',
                  desc: 'حدد التاريخ وعدد الساعات وأضف تفاصيل المناسبة، ثم أرسل طلب الحجز للمصور مباشرة.',
                },
                {
                  icon: <CheckCircle className="w-5 h-5" />,
                  step: 'أكمل وقيّم',
                  desc: 'بعد انتهاء جلسة التصوير، شارك تقييمك الحقيقي لمساعدة العملاء الآخرين في اختياراتهم.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">{item.step}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-[#C0A4A3] text-white px-7 py-3 rounded-2xl font-semibold hover:bg-[#A88887] transition-colors"
              >
                <Search className="w-4 h-4" />
                ابحث عن مصور الآن
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-10" />

          {/* For photographers */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#C0A4A3] text-white rounded-xl text-sm font-bold flex items-center justify-center">٢</span>
              للمصورين — ابنِ حضورك واستقبل الحجوزات
            </h2>

            <div className="space-y-4">
              {[
                {
                  icon: <Camera className="w-5 h-5" />,
                  step: 'أنشئ ملفك الشخصي مجاناً',
                  desc: 'سجّل حسابك، أضف نبذة عنك، حدد تخصصاتك وأسعارك، وارفع أفضل أعمالك في معرض الصور.',
                },
                {
                  icon: <Users className="w-5 h-5" />,
                  step: 'استقبل الحجوزات',
                  desc: 'سيتواصل معك العملاء عبر المنصة. بإمكانك قبول الحجز أو رفضه مع إمكانية التراسل المباشر.',
                },
                {
                  icon: <Star className="w-5 h-5" />,
                  step: 'اكسب التقييمات وارتقِ',
                  desc: 'كل حجز مكتمل هو فرصة لتقييم جديد يرفع ترتيبك في نتائج البحث ويزيد ثقة العملاء بك.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">{item.step}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 border-2 border-[#C0A4A3] text-[#C0A4A3] px-7 py-3 rounded-2xl font-semibold hover:bg-[#C0A4A3]/5 transition-colors"
              >
                سجّل كمصور مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
