"use server";

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

const handleLastSession = (lastSessionAt: Date | null): number | null => {
  if (!lastSessionAt) return null;
  if (lastSessionAt.getTime() > Date.now()) return null;
  return lastSessionAt.getTime();
};

export async function getClientsTableRows(
  search?: string,
): Promise<ClientTableRow[]> {
  const like = search ? `%${search}%` : null;

  const baseSelect = db
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
    .groupBy(user.id, user.name, user.nickname, user.image)
    .orderBy(desc(sql`coalesce(${user.nickname}, ${user.name})`));

  const rows = like
    ? await baseSelect.where(
        and(
          eq(user.role, "user"),
          or(
            sql`${user.name} LIKE ${like}`,
            sql`${user.nickname} LIKE ${like}`,
            sql`${user.email} LIKE ${like}`,
            eq(user.id, search ?? ""),
          ),
        ),
      )
    : await baseSelect.where(eq(user.role, "user"));

  return rows.map((row) => ({
    ...row,
    lastSessionAt: handleLastSession(row.lastSessionAt),
    totalSessions: Number(row.totalSessions ?? 0),
  }));
}
