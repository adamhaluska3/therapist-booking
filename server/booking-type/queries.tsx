"use server";

import { eq } from "drizzle-orm";
import { bookingType, BookingType } from "@/db/schema";
import { db } from "@/lib/db";

export async function getBookingTypes(): Promise<BookingType[]> {
  return db.select().from(bookingType).orderBy(bookingType.name);
}

export async function fetchPriceForBookingType(
  bookingTypeId: string,
): Promise<number | null> {
  const [bt] = await db
    .select({ price: bookingType.price })
    .from(bookingType)
    .where(eq(bookingType.id, bookingTypeId))
    .limit(1);
  return bt?.price ?? null;
}
