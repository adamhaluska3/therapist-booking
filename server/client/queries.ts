"use server";

import { db } from "@/lib/db";
import { BookingWithBookingType } from "./schema";
import { requireUser } from "../auth";
import { booking } from "@/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";

export const getClientUpcomingSessions = async (
  userId: string,
  limit?: number,
): Promise<BookingWithBookingType[]> => {
  const authUser = await requireUser();
  if (authUser.id !== userId) {
    throw new Error("Nemáte oprávnenie na tieto záznamy");
  }

  return await db.query.booking.findMany({
    where: and(
      eq(booking.userId, userId),
      ne(booking.status, "cancelled"),
      ne(booking.status, "finished"),
    ),
    with: { bookingType: true },
    ...(limit ? { limit } : {}),
  });
};

export const getClientPreviousSessions = async (
  userId: string,
  limit?: number,
): Promise<BookingWithBookingType[]> => {
  const authUser = await requireUser();
  if (authUser.id !== userId) {
    throw new Error("Nemáte oprávnenie na tieto záznamy");
  }

  return await db.query.booking.findMany({
    where: and(eq(booking.userId, userId), eq(booking.status, "finished")),
    with: { bookingType: true },
    orderBy: desc(booking.start),
    ...(limit ? { limit } : {}),
  });
};
