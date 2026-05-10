"use server";
import { bookingType, BookingType } from "@/db/schema";
import { db } from "@/lib/db";
import { requireAdmin } from "../auth";

export async function getBookingTypes(): Promise<BookingType[]> {
  return db.select().from(bookingType).orderBy(bookingType.name);
}
