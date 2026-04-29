import "server-only";
import { and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilitySlot, booking } from "@/db/schema";

export async function getCalendarData(from: Date, to: Date) {
  const [slots, bookings] = await Promise.all([
    db
      .select()
      .from(availabilitySlot)
      .where(and(lte(availabilitySlot.start, to), gte(availabilitySlot.end, from))),
    db
      .select()
      .from(booking)
      .where(and(lte(booking.start, to), gte(booking.end, from))),
  ]);

  return { slots, bookings };
}
