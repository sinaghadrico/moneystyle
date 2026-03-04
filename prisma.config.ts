import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (if exists), then .env — same priority as Next.js
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
