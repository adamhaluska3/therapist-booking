"use server";

import { userNote } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../auth";

export async function getUserNotes(userId: string) {
  await requireAdmin();
  if (!userId) return [];

  const rows = await db
    .select()
    .from(userNote)
    .where(eq(userNote.userId, userId))
    .orderBy(desc(userNote.date));

  return rows;
}
