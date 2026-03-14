import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Camera, Users, Target, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#C0A4A3]/10 text-[#C0A4A3] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Camera className="w-4 h-4" />
              من نحن
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">عن الإستوديو</h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              منصة متكاملة تجمع العملاء بأفضل المصورين المحترفين في المملكة العربية السعودية
            </p>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-[#C0A4A3]/10 to-white rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C0A4A3] text-white flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">مهمتنا</h2>
                <p className="text-gray-600 leading-relaxed">
                  نسعى إلى تبسيط عملية التواصل بين العملاء والمصورين المحترفين، وتوفير بيئة موثوقة وشفافة تُمكّن أصحاب المواهب من عرض أعمالهم والوصول إلى فرص أوسع، بينما يحصل العملاء على خدمة تصوير احترافية تلبّي تطلعاتهم.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {[
              {
                icon: <Camera className="w-5 h-5" />,
                title: 'الجودة أولاً',
                desc: 'نعمل على ضمان أعلى مستويات الجودة من خلال تقييمات حقيقية ومعارض أعمال موثّقة.',
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: 'مجتمع المصورين',
                desc: 'نؤمن بأن المصور المحترف يستحق منصة تُبرز موهبته وتربطه بالعملاء المناسبين.',
              },
              {
                icon: <Heart className="w-5 h-5" />,
                title: 'تجربة سلسة',
                desc: 'نحرص على أن تكون كل خطوة — من البحث حتى الحجز — سهلة وممتعة لكلا الطرفين.',
              },
              {
                icon: <Target className="w-5 h-5" />,
                title: 'شفافية كاملة',
                desc: 'التقييمات الحقيقية وإظهار الأسعار بوضوح يضمنان ثقة متبادلة بين العميل والمصور.',
              },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">قصتنا</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
              <p>
                وُلدت فكرة الإستوديو من تحدٍّ حقيقي يعيشه كثير من الناس: كيف تجد مصوراً محترفاً موثوقاً دون الحاجة إلى البحث المضني في وسائل التواصل الاجتماعي أو الاعتماد على التوصيات الشفهية فقط؟
              </p>
              <p>
                أردنا بناء منصة تجمع في مكان واحد: معرض أعمال المصور، تقييمات العملاء السابقين، أسعاره، وإمكانية التواصل المباشر معه والحجز عبر المنصة — كل ذلك بسهولة وشفافية.
              </p>
              <p>
                اليوم، الإستوديو هو الوجهة المفضلة للعملاء الباحثين عن مصورين محترفين في المملكة، وللمصورين الساعين إلى بناء حضور احترافي رقمي وتوسيع قاعدة عملائهم.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
