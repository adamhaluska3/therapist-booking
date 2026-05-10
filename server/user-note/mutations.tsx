"use server";
import { db } from "@/lib/db";
import { UserNotePayload } from "./schema";
import { userNote } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../auth";

export async function saveUserNote(payload: UserNotePayload) {
  await requireAdmin();
  if (payload.id) {
    await db
      .update(userNote)
      .set({ note: payload.note, date: payload.date })
      .where(eq(userNote.id, payload.id));
    return payload.id;
  }

  const id = crypto.randomUUID();
  await db.insert(userNote).values({
    id,
    userId: payload.userId,
    date: payload.date,
    note: payload.note,
  });

  return id;
}

export async function deleteUserNote(id: string) {
  await requireAdmin();
  await db.delete(userNote).where(eq(userNote.id, id));
  return true;
}
