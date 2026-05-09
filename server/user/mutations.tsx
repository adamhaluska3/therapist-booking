"use server";
import { user } from "@/db/auth-schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { UserOption } from "./schema";
import { requireAdmin } from "../auth";

export async function updateUserNickname(
  userId: string,
  nickname: string,
): Promise<void> {
  await requireAdmin();
  await db
    .update(user)
    .set({ nickname: nickname || null })
    .where(eq(user.id, userId));
}

export async function createNonOAuthUser(
  name: string,
  email: string,
  phone?: string,
): Promise<{ ok: boolean; user?: UserOption; error?: string }> {
  await requireAdmin();
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  if (!trimmedName || !trimmedEmail) {
    return { ok: false, error: "Meno a email sú povinné." };
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, trimmedEmail));

  if (existing.length > 0) {
    return { ok: false, error: "Používateľ s týmto emailom už existuje." };
  }

  const id = crypto.randomUUID();
  await db.insert(user).values({
    id,
    name: trimmedName,
    email: trimmedEmail,
    emailVerified: false,
    phone: phone?.trim() || null,
    role: "user",
  });

  return {
    ok: true,
    user: { id, name: trimmedName, nickname: null, email: trimmedEmail },
  };
}
