import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the Supabase direct connection URL (port 5432) here — not the pooler.
    // Prisma CLI (migrate/db push) needs a direct connection, not a pooler.
    // Set DATABASE_URL in .env / Vercel env vars.
    url: process.env["DATABASE_URL"]!,
  },
});
