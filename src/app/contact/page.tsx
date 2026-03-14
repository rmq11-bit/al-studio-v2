import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#C0A4A3]/10 text-[#C0A4A3] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <MessageSquare className="w-4 h-4" />
              تواصل معنا
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">نحن هنا لمساعدتك</h1>
            <p className="text-gray-500 text-base leading-relaxed">
              هل لديك سؤال أو مقترح؟ لا تتردد في التواصل معنا وسنردّ عليك في أقرب وقت.
            </p>
          </div>

          {/* Contact option — email only */}
          <div className="flex justify-center mb-10">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center w-full max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#C0A4A3]/10 text-[#C0A4A3] flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">البريد الإلكتروني</h3>
              <p className="text-sm text-gray-400 mb-3">للاستفسارات العامة والدعم الفني</p>
              <a
                href="mailto:hello@alstudio.sa"
                className="text-[#C0A4A3] font-medium text-sm hover:text-[#A88887] transition-colors"
              >
                hello@alstudio.sa
              </a>
            </div>
          </div>

          {/* FAQ teaser */}
          <div className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-5">أسئلة شائعة</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'هل الاشتراك في المنصة مجاني؟',
                  a: 'نعم، إنشاء حساب والتصفح مجاني بالكامل لكل من العملاء والمصورين.',
                },
                {
                  q: 'كيف أتحقق من موثوقية مصور معين؟',
                  a: 'يمكنك الاطلاع على تقييماته من عملاء سابقين ومعرض أعماله الموثّق على ملفه الشخصي.',
                },
                {
                  q: 'هل يمكنني إلغاء حجز بعد تأكيده؟',
                  a: 'تواصل مع المصور مباشرة عبر المحادثة لترتيب أي تعديلات أو إلغاء. ننصح بالتواصل المبكر.',
                },
                {
                  q: 'كيف أبلغ عن مشكلة أو سلوك مخالف؟',
                  a: 'راسلنا عبر البريد الإلكتروني أعلاه وسنتعامل مع البلاغ بجدية وسرية تامة.',
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="font-semibold text-gray-700 text-sm mb-1">{faq.q}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
