import type { Config } from "drizzle-kit";

const isProduction = Boolean(process.env.IS_PRODUCTION);

export default (
  isProduction
    ? {
        schema: ["./db/schema.ts", "./db/auth-schema.ts"],
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: {
          url: process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db",
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      }
    : {
        schema: ["./db/schema.ts", "./db/auth-schema.ts"],
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: {
          url: process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db",
        },
      }
) satisfies Config;
