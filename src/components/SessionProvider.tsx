'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

/**
 * Wraps NextAuth's SessionProvider WITHOUT a server-fetched session prop.
 *
 * Why: Passing a server-fetched `session` prop to SessionProvider caches
 * it in React's component tree. After a soft navigation (router.push),
 * the root layout does not re-run, so the cached null session is never
 * refreshed — causing auth state to appear broken until a hard reload.
 *
 * By omitting the prop, the client-side SessionProvider fetches the
 * session itself via /api/auth/session and stays fresh after any
 * navigation type.
 */
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
