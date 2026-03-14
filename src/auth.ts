import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || user.isBanned) return null

        const valid = await compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl ?? undefined,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.avatarUrl = (user as { avatarUrl?: string }).avatarUrl
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatarUrl = token.avatarUrl as string | undefined
      }
      return session
    },
  },
})

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    role: string
    avatarUrl?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
      avatarUrl?: string
    }
  }
}

// JWT custom fields (accessed via type casting in jwt/session callbacks above)
