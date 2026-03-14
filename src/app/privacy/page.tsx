import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#C0A4A3]/10 text-[#C0A4A3] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              الخصوصية والأمان
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">سياسة الخصوصية</h1>
            <p className="text-gray-400 text-sm">آخر تحديث: مارس 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8 text-gray-600 leading-relaxed text-sm">

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">١. المعلومات التي نجمعها</h2>
              <p className="mb-3">
                عند تسجيلك في منصة الإستوديو، نجمع المعلومات الأساسية التالية:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-gray-500">
                <li>الاسم وعنوان البريد الإلكتروني</li>
                <li>رقم الجوال (اختياري)</li>
                <li>الصورة الشخصية (اختيارية)</li>
                <li>معلومات الملف المهني للمصورين (التخصصات، الأسعار، الموقع)</li>
                <li>الصور والأعمال المرفوعة في معرض المصور</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٢. كيف نستخدم معلوماتك</h2>
              <p className="mb-3">نستخدم المعلومات التي نجمعها من أجل:</p>
              <ul className="space-y-1.5 list-disc list-inside text-gray-500">
                <li>تمكينك من استخدام خدمات المنصة (الحجز، التراسل، التقييم)</li>
                <li>عرض ملفك الشخصي للعملاء المحتملين (للمصورين)</li>
                <li>التواصل معك بشأن حسابك أو طلباتك</li>
                <li>تحسين جودة الخدمة وتجربة المستخدم</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٣. مشاركة المعلومات</h2>
              <p>
                لا نبيع معلوماتك الشخصية لأي طرف ثالث. قد نشارك المعلومات الضرورية فقط مع مزودي الخدمة التقنية (مثل استضافة البيانات) الذين يساعدون في تشغيل المنصة، وذلك وفق اتفاقيات خصوصية صارمة.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٤. حماية بياناتك</h2>
              <p>
                نحرص على حماية بياناتك بأفضل الممارسات الأمنية، بما يشمل تشفير كلمات المرور وحماية الاتصالات. ومع ذلك، لا يمكن ضمان أمان مطلق لأي منصة رقمية، لذا ننصح باختيار كلمة مرور قوية وعدم مشاركتها.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٥. حقوقك</h2>
              <p className="mb-3">يحق لك في أي وقت:</p>
              <ul className="space-y-1.5 list-disc list-inside text-gray-500">
                <li>الاطلاع على بياناتك المخزّنة لدينا</li>
                <li>تعديل أو تحديث معلوماتك الشخصية من خلال الإعدادات</li>
                <li>طلب حذف حسابك ومعلوماتك بشكل نهائي</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٦. التواصل بشأن الخصوصية</h2>
              <p>
                لأي استفسار حول هذه السياسة أو ممارسات الخصوصية لدينا، تواصل معنا عبر:{' '}
                <a href="mailto:privacy@alstudio.sa" className="text-[#C0A4A3] hover:underline">
                  privacy@alstudio.sa
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
