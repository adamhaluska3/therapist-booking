import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as authSchema from "@/db/auth-schema";

const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db";

const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema: { ...authSchema } });

export type Database = typeof db;
