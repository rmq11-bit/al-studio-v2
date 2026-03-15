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
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        // Reject banned users at login time
        if (!user || user.isBanned) return null

        const valid = await compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return {
          id:        user.id,
          name:      user.name,
          email:     user.email,
          role:      user.role,
          avatarUrl: user.avatarUrl ?? undefined,
          isBanned:  user.isBanned,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Initial sign-in: copy all custom fields into the token
        token.id       = user.id
        token.role     = (user as { role: string }).role
        token.avatarUrl = (user as { avatarUrl?: string }).avatarUrl
        token.isBanned  = (user as { isBanned: boolean }).isBanned
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id       = token.id as string
        session.user.role     = token.role as string
        session.user.avatarUrl = token.avatarUrl as string | undefined
        session.user.isBanned  = token.isBanned as boolean | undefined
      }
      return session
    },
  },
})

// ── Type augmentation ─────────────────────────────────────────────────────────
declare module 'next-auth' {
  interface User {
    role:      string
    avatarUrl?: string
    isBanned?:  boolean
  }
  interface Session {
    user: {
      id:        string
      name?:     string | null
      email?:    string | null
      role:      string
      avatarUrl?: string
      isBanned?:  boolean
    }
  }
}
