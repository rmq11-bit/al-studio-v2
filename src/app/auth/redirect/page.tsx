import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * Server-side role-based redirect after login / registration.
 *
 * This page runs on the server, reads the current session (which is fresh
 * after the hard navigation from the login/register pages), and redirects
 * to the correct dashboard based on user role.
 */
export default async function AuthRedirectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const role = session.user.role

  if (role === 'PHOTOGRAPHER') redirect('/photographer/dashboard')
  if (role === 'CONSUMER') redirect('/consumer/dashboard')
  if (role === 'ADMIN') redirect('/admin')

  // Fallback for unknown role
  redirect('/')
}
