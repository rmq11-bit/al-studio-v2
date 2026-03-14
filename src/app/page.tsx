import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, Camera, Star, Shield, ArrowLeft, CheckCircle, Users, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#C0A4A3]/10 via-white to-gray-50 py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-3xl font-bold text-[#C0A4A3] tracking-wider mb-5">
              الإستوديو
            </p>

            <div className="inline-flex items-center gap-2 bg-[#C0A4A3]/10 text-[#C0A4A3] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Camera className="w-4 h-4" />
              المنصة الأولى للمصورين المحترفين في المملكة
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-5 leading-tight">
              اكتشف مصورك المثالي
              <br />
              <span className="text-[#C0A4A3]">واحجز في دقائق</span>
            </h1>

            <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              الإستوديو يجمعك بأفضل المصورين المحترفين في المملكة العربية السعودية —
              أفراح، مناسبات، تجاري، سينمائي، وأكثر.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/browse"
                className="flex items-center justify-center gap-2 bg-[#C0A4A3] text-white px-9 py-4 rounded-2xl font-semibold hover:bg-[#A88887] transition-colors text-base shadow-lg shadow-[#C0A4A3]/25"
              >
                <Search className="w-5 h-5" />
                ابدأ البحث الآن
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 border-2 border-[#C0A4A3] text-[#C0A4A3] px-9 py-4 rounded-2xl font-semibold hover:bg-[#C0A4A3]/5 transition-colors text-base"
              >
                سجّل كمصور مجاناً
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                مصورون موثّقون
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                تقييمات حقيقية
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                تواصل مباشر وآمن
              </span>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">لماذا يختار العملاء الإستوديو؟</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">
                منصة متكاملة تجمع بين سهولة الوصول وجودة المصورين المحترفين
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Search className="w-8 h-8 text-[#C0A4A3]" />,
                  title: 'بحث ذكي وسريع',
                  desc: 'فلتر المصورين حسب التخصص، الموقع، والسعر. تصفّح معرض أعمالهم وتقييماتهم قبل أي قرار.',
                },
                {
                  icon: <Star className="w-8 h-8 text-[#C0A4A3]" />,
                  title: 'مصورون موثّقون ومتميزون',
                  desc: 'كل مصور يعرض أعماله الحقيقية مع تقييمات من عملاء سبق التعامل معهم — شفافية تامة.',
                },
                {
                  icon: <Shield className="w-8 h-8 text-[#C0A4A3]" />,
                  title: 'تواصل مباشر وآمن',
                  desc: 'راسل المصور مباشرة، تفاوض على التفاصيل، وأدر حجزك بالكامل من مكان واحد.',
                },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#C0A4A3]/20 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-[#C0A4A3]/10 flex items-center justify-center mb-5">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────────── */}
        <section className="bg-gray-50/80 border-y border-gray-100 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">كيف يعمل الإستوديو؟</h2>
              <p className="text-gray-400 text-base">ثلاث خطوات بسيطة تفصلك عن مصورك المثالي</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '١',
                  icon: <Search className="w-6 h-6" />,
                  title: 'تصفح المصورين',
                  desc: 'ابحث وفلتر حسب التخصص والموقع والسعر. شاهد أعمال كل مصور وتقييماته.',
                },
                {
                  step: '٢',
                  icon: <Users className="w-6 h-6" />,
                  title: 'تواصل واحجز',
                  desc: 'راسل المصور مباشرة، حدد التاريخ والتفاصيل، وأرسل طلب الحجز.',
                },
                {
                  step: '٣',
                  icon: <Clock className="w-6 h-6" />,
                  title: 'استمتع بنتائج احترافية',
                  desc: 'أكمل جلسة التصوير وشارك تجربتك عبر تقييم حقيقي يفيد المصور والعملاء.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="relative inline-block mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#C0A4A3] text-white flex items-center justify-center mx-auto">
                      {item.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-[#C0A4A3] text-[#C0A4A3] rounded-full text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-[#C0A4A3] text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-[#A88887] transition-colors"
              >
                <Search className="w-5 h-5" />
                ابحث عن مصور الآن
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA for photographers ─────────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#C0A4A3] to-[#A88887] rounded-3xl p-10 text-center text-white">
              <Camera className="w-14 h-14 mx-auto mb-5 opacity-90" />
              <h2 className="text-3xl font-bold mb-3">مصور محترف؟ انضم إلينا اليوم</h2>
              <p className="text-white/80 text-base mb-8 max-w-xl mx-auto leading-relaxed">
                أنشئ ملفك الشخصي مجاناً، اعرض أعمالك، واستقبل الحجوزات من العملاء في جميع أنحاء المملكة العربية السعودية.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-[#C0A4A3] px-9 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-colors text-base shadow-lg"
              >
                <Camera className="w-5 h-5" />
                أنشئ ملفك المجاني الآن
              </Link>
              <p className="text-white/60 text-sm mt-4">مجاني تماماً · لا يلزم إدخال بطاقة ائتمان</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
