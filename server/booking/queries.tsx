"use server";

import { db } from "@/lib/db";
import {
  BookingWithUser,
  ClientAbsolvedBookingRow,
  BookingsFilterType,
  toBookingWithUser,
  BookingsDateFilterType,
  ClientAbsolvedBookingsFilterType,
} from "./schema";
import { availabilitySlot, Booking, booking, bookingType } from "@/db/schema";
import { user } from "@/db/auth-schema";

import {
  eq,
  and,
  gte,
  lt,
  like,
  or,
  desc,
  lte,
  sql,
  not,
  count,
} from "drizzle-orm";
import {
  BOOKINGS_PAGE_SIZE,
  DASHBOARD_PAGE_SIZE,
  SESSIONS_PAGE_SIZE,
} from "@/lib/constants";
import { SlotsByDate, toDateKey } from "@/lib/booking-types";
import { cache } from "react";
import { requireUser } from "../auth";

export async function getDashboardBookingsFiltered({
  offset,
  search = "",
  from,
  to,
}: BookingsFilterType): Promise<{
  bookings: BookingWithUser[];
  nextOffset: number | undefined;
}> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const items = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(
      and(
        gte(booking.start, from ?? startOfToday),
        to ? lt(booking.start, to) : undefined,
        eq(booking.status, "confirmed"),
        search
          ? or(
              like(user.name, `%${search}%`),
              like(user.nickname, `%${search}%`),
            )
          : undefined,
      ),
    )
    .orderBy(booking.start)
    .limit(DASHBOARD_PAGE_SIZE + 1)
    .offset(offset);

  const hasMore = items.length > DASHBOARD_PAGE_SIZE;
  return {
    bookings: items.slice(0, DASHBOARD_PAGE_SIZE).map(toBookingWithUser),
    nextOffset: hasMore ? offset + DASHBOARD_PAGE_SIZE : undefined,
  };
}

export async function getFinishedBookingsFiltered({
  offset,
  search = "",
  from,
  to,
}: BookingsFilterType): Promise<{
  bookings: BookingWithUser[];
  nextOffset: number | undefined;
}> {
  const items = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(
      and(
        eq(booking.status, "finished"),
        from ? gte(booking.start, from) : undefined,
        to ? lt(booking.start, to) : undefined,
        search
          ? or(
              like(user.name, `%${search}%`),
              like(user.nickname, `%${search}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(booking.start))
    .limit(SESSIONS_PAGE_SIZE + 1)
    .offset(offset);

  const hasMore = items.length > SESSIONS_PAGE_SIZE;
  return {
    bookings: items.slice(0, SESSIONS_PAGE_SIZE).map(toBookingWithUser),
    nextOffset: hasMore ? offset + SESSIONS_PAGE_SIZE : undefined,
  };
}

export async function getBookingsWithUsers({
  from,
  to,
}: BookingsDateFilterType): Promise<BookingWithUser[]> {
  const bookigs = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(
      and(
        lte(booking.start, to),
        gte(booking.end, from),
        not(eq(booking.status, "cancelled")),
      ),
    );
  const bookingsWithUser = bookigs.map((row) => ({
    ...row.booking,
    user: row.user
      ? {
          id: row.user.id,
          name: row.user.name,
          nickname: row.user.nickname,
          email: row.user.email,
        }
      : null,
  }));
  return bookingsWithUser;
}

export async function getBookingSlots(
  from: Date,
  to: Date,
): Promise<SlotsByDate> {
  const slots = await db
    .select()
    .from(availabilitySlot)
    .where(
      and(lte(availabilitySlot.start, to), gte(availabilitySlot.end, from)),
    );
  const bookings = (
    await db
      .select()
      .from(booking)
      .leftJoin(user, eq(booking.userId, user.id))
      .where(and(lte(booking.start, to), gte(booking.end, from)))
  ).map((row) => ({
    ...row.booking,
  }));
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
          (b) =>
            b.start.getTime() < end.getTime() &&
            b.end.getTime() > cursor.getTime(),
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

export async function getPendingBookings(page = 1): Promise<{
  bookings: BookingWithUser[];
  total: number;
}> {
  const offset = (page - 1) * BOOKINGS_PAGE_SIZE;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(booking)
      .leftJoin(user, eq(booking.userId, user.id))
      .where(eq(booking.status, "pending"))
      .orderBy(booking.start)
      .limit(BOOKINGS_PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(booking)
      .where(eq(booking.status, "pending")),
  ]);

  return { bookings: items.map(toBookingWithUser), total: Number(total) };
}

export async function getClientAbsolvedBookings({
  userId,
  page,
  pageSize,
  from,
  to,
}: ClientAbsolvedBookingsFilterType): Promise<{
  rows: ClientAbsolvedBookingRow[];
  total: number;
}> {
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to
    ? (() => {
        const d = new Date(to);
        d.setHours(23, 59, 59, 999);
        return d;
      })()
    : undefined;

  const conditions = and(
    eq(booking.userId, userId),
    eq(booking.status, "finished"),
    fromDate ? gte(booking.start, fromDate) : undefined,
    toDate ? lte(booking.start, toDate) : undefined,
  );

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(booking).where(conditions),
    db
      .select({
        id: booking.id,
        start: booking.start,
        end: booking.end,
        bookingTypeName: bookingType.name,
        variableSymbol: booking.variableSymbol,
        price: booking.price,
        locationType: booking.locationType,
        note: booking.note,
      })
      .from(booking)
      .leftJoin(bookingType, eq(booking.bookingTypeId, bookingType.id))
      .where(conditions)
      .orderBy(desc(booking.start))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
  ]);

  return {
    rows,
    total: totalResult[0]?.count ?? 0,
  };
}
