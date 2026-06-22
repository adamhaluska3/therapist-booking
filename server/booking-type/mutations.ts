"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookingType } from "@/db/schema";
import { BookingTypePriceType } from "./schema";

export async function saveBookingTypePrices(
  prices: BookingTypePriceType[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const { id, price } of prices) {
      await tx
        .update(bookingType)
        .set({ price: price ?? null })
        .where(eq(bookingType.id, id));
    }
  });
}
