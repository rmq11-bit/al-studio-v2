import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#C0A4A3]/10 text-[#C0A4A3] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              الشروط القانونية
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">الشروط والأحكام</h1>
            <p className="text-gray-400 text-sm">آخر تحديث: مارس 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8 text-gray-600 leading-relaxed text-sm">

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">١. القبول والموافقة</h2>
              <p>
                باستخدامك لمنصة الإستوديو، فإنك توافق على الالتزام بهذه الشروط والأحكام. إن كنت لا توافق على أي بند من هذه الشروط، يُرجى التوقف عن استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٢. وصف الخدمة</h2>
              <p>
                الإستوديو هي منصة إلكترونية تربط العملاء بالمصورين المحترفين، وتتيح عرض الأعمال والحجز وتبادل الرسائل والتقييمات. المنصة وسيط فقط، ولا تتحمل مسؤولية مباشرة عن جودة الخدمة المقدمة بين الطرفين.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٣. الحسابات والتسجيل</h2>
              <ul className="space-y-2 list-disc list-inside text-gray-500">
                <li>يجب أن يكون عمرك ١٨ عاماً أو أكثر لإنشاء حساب.</li>
                <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك.</li>
                <li>يُحظر إنشاء أكثر من حساب واحد لكل مستخدم.</li>
                <li>نحتفظ بحق تعليق أو إلغاء الحسابات المخالفة لهذه الشروط.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٤. قواعد الاستخدام</h2>
              <p className="mb-3">يُحظر على مستخدمي المنصة:</p>
              <ul className="space-y-2 list-disc list-inside text-gray-500">
                <li>نشر محتوى مسيء أو مخالف للقانون أو حقوق الملكية الفكرية.</li>
                <li>التحرش أو الإساءة للمستخدمين الآخرين.</li>
                <li>انتحال شخصية أشخاص أو جهات أخرى.</li>
                <li>محاولة اختراق أو التلاعب بأنظمة المنصة.</li>
                <li>نشر تقييمات مزيفة أو مضللة.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٥. الحجوزات والمدفوعات</h2>
              <p>
                تتم الاتفاقية المالية بين العميل والمصور مباشرة خارج المنصة. الإستوديو لا تتوسط في المدفوعات ولا تتحمل أي مسؤولية عن نزاعات مالية بين الطرفين. نشجع على توثيق الاتفاقيات بشكل واضح قبل بدء العمل.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٦. الملكية الفكرية</h2>
              <p>
                المصورون يحتفظون بحقوق الملكية الفكرية لأعمالهم المرفوعة على المنصة. برفع الصور، يمنح المصور المنصة حق عرضها لأغراض ترويجية فحسب. يُحظر نسخ أو استخدام أعمال المصورين دون إذن صريح منهم.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">٧. التعديلات والإنهاء</h2>
              <p>
                نحتفظ بحق تعديل هذه الشروط في أي وقت مع الإخطار المسبق. كما يحق لنا إنهاء أو تعليق الخدمة لأي مستخدم يخالف هذه الشروط. للتواصل حول أي شأن قانوني:{' '}
                <a href="mailto:legal@alstudio.sa" className="text-[#C0A4A3] hover:underline">
                  legal@alstudio.sa
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
