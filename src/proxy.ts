import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ── Public routes — no auth required ─────────────────────────────────────
  const publicPaths = ['/', '/browse', '/auth/login', '/auth/register']
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/photographer/') ||
    pathname.startsWith('/projects')

  if (isPublic) return NextResponse.next()

  // ── Redirect unauthenticated users to login ───────────────────────────────
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Runtime ban check ─────────────────────────────────────────────────────
  // isBanned is written into the JWT at login. A ban takes effect immediately
  // for new logins and within the JWT lifetime for active sessions.
  if (session.user?.isBanned) {
    // Force sign-out by redirecting to login; NextAuth will clear the session
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('error', 'banned')
    return NextResponse.redirect(loginUrl)
  }

  const role = session.user?.role

  // ── Role-based route protection ───────────────────────────────────────────
  if (pathname.startsWith('/photographer/') && role !== 'PHOTOGRAPHER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/consumer/') && role !== 'CONSUMER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Exclude Next.js internals and static files from middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
