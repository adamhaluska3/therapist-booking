import "server-only";
import { and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilitySlot, booking } from "@/db/schema";
import type { SlotsByDate } from "@/lib/booking-types";

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

export async function getBookingSlots(from: Date, to: Date): Promise<SlotsByDate> {
  const { slots, bookings } = await getCalendarData(from, to);
  const HOUR_MS = 3_600_000;
  const STEP_MS = 1_800_000; // 30-min steps, but each booking spans 1 hour
  const result: SlotsByDate = {};

  for (const slot of slots) {
    let cursor = new Date(slot.start);
    const slotEnd = slot.end.getTime();

    while (cursor.getTime() + HOUR_MS <= slotEnd) {
      const end = new Date(cursor.getTime() + HOUR_MS);

      const available = !bookings.some(
        (b) => b.start.getTime() < end.getTime() && b.end.getTime() > cursor.getTime(),
      );

      const dateKey = toDateKey(cursor);
      const time = `${String(cursor.getHours()).padStart(2, "0")}:${String(cursor.getMinutes()).padStart(2, "0")}`;

      (result[dateKey] ??= []).push({ time, available });
      cursor = new Date(cursor.getTime() + STEP_MS);
    }
  }

  return result;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
