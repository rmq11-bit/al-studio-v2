import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// ── Specialties: stored as a JSON string in DB, exposed as string[] ────────────
// All reads go through the result extension below (transparent to callers).
// All writes must pass JSON.stringify(array) — only 2 sites in this project.

function parseSpecialties(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

// ── Client factory ─────────────────────────────────────────────────────────────
function createPrismaClient() {
  // Use DATABASE_URL at runtime; fall back to a placeholder so the client
  // can be *created* at module-import time (build-time) without throwing.
  // The placeholder will fail on first actual query — that's the right behaviour.
  const connectionString = process.env.DATABASE_URL ?? 'postgresql://localhost/placeholder'

  // Pass PoolConfig directly — avoids type conflicts with peer pg versions
  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }).$extends({
    // Automatically parse specialties JSON string → string[] on every read.
    // This means NO other file in the project needs to call JSON.parse.
    result: {
      photographerProfile: {
        specialties: {
          needs: { specialties: true },
          compute(p) { return parseSpecialties(p.specialties) },
        },
      },
    },
  })
}

// ── Singleton (avoid extra clients during dev HMR) ────────────────────────────
type ExtendedPrisma = ReturnType<typeof createPrismaClient>
const g = globalThis as unknown as { _prisma?: ExtendedPrisma }

export const prisma: ExtendedPrisma = g._prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') g._prisma = prisma
