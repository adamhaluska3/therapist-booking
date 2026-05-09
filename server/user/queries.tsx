"use server";
import { user } from "@/db/auth-schema";
import { ClientTableRow } from "./schema";
import { db } from "@/lib/db";
import { count, max, sql, and, eq, desc, or, asc } from "drizzle-orm";
import { booking } from "@/db/schema";
import { handleLastSession } from "./utils";

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
      and(eq(booking.userId, user.id), eq(booking.status, "finished")),
    )
    .groupBy(user.id, user.name, user.nickname, user.image)
    .orderBy(
      desc(max(booking.start)),
      asc(sql`coalesce(${user.nickname}, ${user.name})`),
    );

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

export async function getUserById(id: string) {
  if (!id) return null;
  const rows = await db.select().from(user).where(eq(user.id, id));
  return rows[0] ?? null;
}

export async function getUserBookings(userId: string) {
  if (!userId) return [];
  const rows = await db
    .select()
    .from(booking)
    .where(eq(booking.userId, userId))
    .orderBy(desc(booking.start));
  return rows;
}

export async function getAllUsers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
    })
    .from(user)
    .where(eq(user.role, "user"))
    .orderBy(user.name);
}
