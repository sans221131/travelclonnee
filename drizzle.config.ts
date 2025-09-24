// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",          // CHANGED from ./src/db/schema.ts
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASEB_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
