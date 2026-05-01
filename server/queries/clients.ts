import "server-only";

import { and, count, desc, eq, max, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking } from "@/db/schema";
import { user } from "@/db/auth-schema";

export type ClientTableRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastSessionAt: number | null;
  totalSessions: number;
};

export async function getClientsTableRows(): Promise<ClientTableRow[]> {
  const rows = await db
    .select({
      id: user.id,
      name: sql<string>`coalesce(${user.nickname}, ${user.name})`,
      avatarUrl: user.image,
      lastSessionAt: max(booking.start),
      totalSessions: count(booking.id),
    })
    .from(user)
    .leftJoin(
      booking,
      and(
        eq(booking.userId, user.id),
        or(eq(booking.status, "confirmed"), eq(booking.status, "finished")),
      ),
    )
    .where(eq(user.role, "user"))
    .groupBy(user.id, user.name, user.nickname, user.image)
    .orderBy(desc(sql`coalesce(${user.nickname}, ${user.name})`));

  return rows.map((row) => ({
    ...row,
    lastSessionAt: row.lastSessionAt
      ? (row.lastSessionAt as Date).getTime()
      : null,
    totalSessions: Number(row.totalSessions ?? 0),
  }));
}
