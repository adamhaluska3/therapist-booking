"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/db/auth-schema";
import { booking as bookingTable } from "@/db/schema";

export async function getUserById(id: string) {
  if (!id) return null;
  const rows = await db.select().from(user).where(eq(user.id, id));
  return rows[0] ?? null;
}

export async function getUserBookings(userId: string) {
  if (!userId) return [];
  const rows = await db
    .select()
    .from(bookingTable)
    .where(eq(bookingTable.userId, userId))
    .orderBy(desc(bookingTable.start));
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

export type UserOption = Awaited<ReturnType<typeof getAllUsers>>[number];
