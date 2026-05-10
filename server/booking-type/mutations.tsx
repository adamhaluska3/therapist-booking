"use server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookingType } from "@/db/schema";
import { requireAdmin } from "../auth";

export async function saveBookingTypePrices(
  prices: { id: string; price: number | null }[],
): Promise<void> {
  await requireAdmin();
  await db.transaction(async (tx) => {
    for (const { id, price } of prices) {
      await tx
        .update(bookingType)
        .set({ price: price ?? null })
        .where(eq(bookingType.id, id));
    }
  });
}
