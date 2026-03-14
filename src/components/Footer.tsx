import Link from 'next/link'
import { Camera } from 'lucide-react'

const LINKS = {
  quick: [
    { href: '/browse',        label: 'تصفح المصورين'     },
    { href: '/projects',      label: 'المشاريع'           },
    { href: '/auth/login',    label: 'تسجيل الدخول'      },
    { href: '/auth/register', label: 'إنشاء حساب'        },
  ],
  platform: [
    { href: '/how-it-works', label: 'كيف يعمل الإستوديو؟' },
    { href: '/about',        label: 'عن الإستوديو'        },
    { href: '/contact',      label: 'تواصل معنا'          },
  ],
  legal: [
    { href: '/privacy', label: 'سياسة الخصوصية'  },
    { href: '/terms',   label: 'الشروط والأحكام' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">

        {/* Main columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-[#C0A4A3] text-lg mb-3">
              <Camera className="w-5 h-5" />
              الإستوديو
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              المنصة الأولى للتواصل بين العملاء والمصورين المحترفين في المملكة العربية السعودية.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-4">روابط سريعة</h3>
            <ul className="space-y-2.5">
              {LINKS.quick.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-[#C0A4A3] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-4">المنصة</h3>
            <ul className="space-y-2.5">
              {LINKS.platform.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-[#C0A4A3] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-4">قانوني</h3>
            <ul className="space-y-2.5">
              {LINKS.legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-[#C0A4A3] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} الإستوديو. جميع الحقوق محفوظة.</p>
          <p className="text-xs">صُنع بـ ❤️ في المملكة العربية السعودية</p>
        </div>

      </div>
    </footer>
  )
}
