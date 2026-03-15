import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env first, then .env.local (which takes precedence).
// This mirrors Next.js's own env file loading order and means
// `prisma db push` / `prisma generate` work locally without any
// extra shell setup as long as .env.local contains DATABASE_URL.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const localEnv = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv, override: true });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
