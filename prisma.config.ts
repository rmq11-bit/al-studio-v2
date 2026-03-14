import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    // directUrl for migrations (bypasses connection pooler like PgBouncer)
    // Uncomment and set DIRECT_URL if using Supabase or similar:
    // directUrl: process.env["DIRECT_URL"]!,
  },
});
