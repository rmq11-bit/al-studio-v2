import { Resend } from 'resend'

// Lazy-initialize so module can be imported at build time without throwing
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(key)
  }
  return _resend
}

const FROM_ADDRESS = 'onboarding@resend.dev'

/** Generate a cryptographically random 6-digit OTP */
export function generateOTP(): string {
  const digits = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return digits.toString().padStart(6, '0')
}

/** Send email verification OTP */
export async function sendVerificationEmail(to: string, name: string, otp: string) {
  const resend = getResend()

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${otp} - رمز التحقق من الإستوديو`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;direction:rtl;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;max-width:100%;">
                <!-- Header -->
                <tr>
                  <td style="background:#C0A4A3;padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">📷 الإستوديو</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 32px;">
                    <h2 style="margin:0 0 8px;color:#1f2937;font-size:20px;">مرحباً ${name}،</h2>
                    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                      شكراً لتسجيلك في الإستوديو. أدخل الرمز التالي لتفعيل حسابك:
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">رمز التحقق</p>
                      <p style="margin:0;color:#1f2937;font-size:40px;font-weight:bold;letter-spacing:12px;font-family:'Courier New',monospace;">
                        ${otp}
                      </p>
                    </div>

                    <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;text-align:center;">
                      ⏱ الرمز صالح لمدة <strong>15 دقيقة</strong>
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                      إذا لم تقم بإنشاء هذا الحساب، تجاهل هذا البريد.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
                    <p style="margin:0;color:#d1d5db;font-size:12px;">© 2025 الإستوديو · منصة التصوير الاحترافي</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })

  if (error) {
    console.error('[sendVerificationEmail]', error)
    throw new Error('فشل إرسال البريد الإلكتروني')
  }
}
