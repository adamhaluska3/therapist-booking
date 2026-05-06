"use server";

import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { booking, bookingType } from "@/db/schema";

export type AbsolvedBookingRow = {
  id: string;
  start: Date;
  end: Date;
  bookingTypeName: string | null;
  variableSymbol: number | null;
  price: number | null;
};

export async function getAbsolvedBookings({
  userId,
  page = 1,
  pageSize = 10,
  from,
  to,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
}): Promise<{ rows: AbsolvedBookingRow[]; total: number }> {
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? (
    () => {
        const d = new Date(to);
        d.setHours(23, 59, 59, 999);
        return d;
    })() : undefined;

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
