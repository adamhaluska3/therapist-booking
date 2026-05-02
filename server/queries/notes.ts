"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userNote } from "@/db/schema";

export async function getUserNotes(userId: string) {
  if (!userId) return [];

  const rows = await db
    .select()
    .from(userNote)
    .where(eq(userNote.userId, userId))
    .orderBy(desc(userNote.date));

  return rows;
}
