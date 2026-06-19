import { booking, BookingType } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type BookingWithBookingType = InferSelectModel<typeof booking> & {
  bookingType: BookingType | null;
};
