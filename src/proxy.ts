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

  // ── Auth redirect helper ──────────────────────────────────────────────────
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
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
