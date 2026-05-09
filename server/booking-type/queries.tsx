"use server";
import { bookingType, BookingType } from "@/db/schema";
import { db } from "@/lib/db";

export async function getBookingTypes(): Promise<BookingType[]> {
  return db.select().from(bookingType).orderBy(bookingType.name);
}
