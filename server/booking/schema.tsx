import { Booking, locationTypeEnum } from "@/db/schema";

export type LocationType = (typeof locationTypeEnum)[number];
import { BookingUser } from "../user/schema";
import { user } from "@/db/auth-schema";
import z from "zod";

export type BookingWithUser = Booking & { user: BookingUser | null };

export type BookingUpsert = {
  id: string;
  start: Date;
  end: Date;
  status?: "pending" | "confirmed" | "cancelled" | "finished";
  price?: number | null;
  userId?: string | null;
  bookingTypeId?: string | null;
};

export function toBookingWithUser(row: {
  booking: Booking;
  user: typeof user.$inferSelect | null;
}): BookingWithUser {
  return {
    ...row.booking,
    user: row.user
      ? {
          id: row.user.id,
          name: row.user.name,
          nickname: row.user.nickname,
          email: row.user.email,
        }
      : null,
  };
}

export type ClientAbsolvedBookingRow = {
  id: string;
  start: Date;
  end: Date;
  bookingTypeName: string | null;
  variableSymbol: number | null;
  price: number | null;
  locationType: LocationType;
  note: string | null;
};

export const BookingsFilterSchema = z.object({
  offset: z.number().min(0),
  search: z.string().optional(),
  from: z.date().optional(),
  to: z.date().optional(),
});

export const BookingsDateFilterSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export const ClientAbsolvedBookingsFilterSchema = z.object({
  userId: z.string(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type BookingsFilterType = z.infer<typeof BookingsFilterSchema>;
export type BookingsDateFilterType = z.infer<typeof BookingsDateFilterSchema>;
export type ClientAbsolvedBookingsFilterType = z.infer<
  typeof ClientAbsolvedBookingsFilterSchema
>;
