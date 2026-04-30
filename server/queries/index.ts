import "server-only";
import { cache } from "react";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilitySlot, booking } from "@/db/schema";
import { toDateKey, type SlotsByDate } from "@/lib/booking-types";
import { BOOKINGS_PAGE_SIZE } from "@/lib/constants";

export async function getDashboardBookings() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return db
    .select()
    .from(booking)
    .where(and(gte(booking.start, startOfToday), eq(booking.status, "confirmed")))
    .orderBy(booking.start);
}

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
  const STEP_MS = 1_800_000;
  const now = Date.now();
  const result: SlotsByDate = {};

  for (const slot of slots) {
    let cursor = new Date(slot.start);
    const slotEnd = slot.end.getTime();

    while (cursor.getTime() + HOUR_MS <= slotEnd) {
      if (cursor.getTime() >= now) {
        const end = new Date(cursor.getTime() + HOUR_MS);

        const available = !bookings.some(
          (b) => b.start.getTime() < end.getTime() && b.end.getTime() > cursor.getTime(),
        );

        const dateKey = toDateKey(cursor);
        const time = `${String(cursor.getHours()).padStart(2, "0")}:${String(cursor.getMinutes()).padStart(2, "0")}`;

        (result[dateKey] ??= []).push({ time, available });
      }
      cursor = new Date(cursor.getTime() + STEP_MS);
    }
  }

  return result;
}

export const getPendingCount = cache(async (): Promise<number> => {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(booking)
    .where(eq(booking.status, "pending"));
  return Number(total);
});

export async function getPendingBookings(page = 1) {
  const offset = (page - 1) * BOOKINGS_PAGE_SIZE;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(booking)
      .where(eq(booking.status, "pending"))
      .orderBy(booking.start)
      .limit(BOOKINGS_PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(booking)
      .where(eq(booking.status, "pending")),
  ]);

  return { bookings: items, total: Number(total) };
}
