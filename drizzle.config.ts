import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:54322/postgres";

export default defineConfig({
  schema: "./lib/server/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl
  }
});
