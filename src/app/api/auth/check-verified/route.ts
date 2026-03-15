import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/auth/check-verified
 * Lightweight check: is this email registered but unverified?
 * Used by login page to show the right error message / redirect.
 * Returns { unverified: true } only when account exists and emailVerified is false.
 * Always returns 200 to avoid leaking account existence via status codes.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ unverified: false })

    const user = await prisma.user.findUnique({
      where:  { email },
      select: { emailVerified: true },
    })

    return NextResponse.json({ unverified: user !== null && !user.emailVerified })
  } catch {
    return NextResponse.json({ unverified: false })
  }
}
