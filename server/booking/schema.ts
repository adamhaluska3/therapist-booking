import { Booking, BookingType, locationTypeEnum } from "@/db/schema";

export type LocationType = (typeof locationTypeEnum)[number];
import { BookingUser } from "../user/schema";
import { user } from "@/db/auth-schema";
import z from "zod";

export type BookingWithUser = Booking & {
  user: BookingUser | null;
  bookingType: BookingType | null;
};

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
  booking_type: BookingType | null;
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
    bookingType: row.booking_type ?? null,
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

export const createAdminBookingInputSchema = z.object({
  id: z.string(),
  start: z.date(),
  end: z.date(),
  status: z.enum(["pending", "confirmed", "cancelled", "finished"]).optional(),
  userId: z.string().nullable(),
  bookingTypeId: z.string().nullable(),
  price: z.number().nullable(),
  note: z.string().nullable(),
  locationType: z.enum(locationTypeEnum).optional(),
});

export const deleteBookingSchema = z.object({
  id: z.string(),
});

export const updateBookingStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["cancelled", "finished"]),
});

export const confirmBookingSchema = z.object({
  id: z.string(),
});

export const updateBookingFromDialogSchema = z.object({
  id: z.string(),
  updates: z.object({
    start: z.date(),
    end: z.date(),
    userId: z.string().nullable(),
    bookingTypeId: z.string().nullable(),
    note: z.string().nullable(),
    locationType: z.enum(locationTypeEnum),
  }),
  previousStart: z.date(),
});

export const createClientBookingSchema = z.object({
  dateKey: z.string(),
  time: z.string(),
  userId: z.string().nullable(),
  note: z.string(),
  bookingTypeId: z.string().nullable(),
  locationType: z.enum(locationTypeEnum),
});

export const cancelClientBookingSchema = z.object({
  bookingId: z.string(),
});

export type CreateAdminBookingType = z.infer<
  typeof createAdminBookingInputSchema
>;
export type DeleteBookingType = z.infer<typeof deleteBookingSchema>;
export type UpdateBookingStatusType = z.infer<typeof updateBookingStatusSchema>;
export type ConfirmBookingType = z.infer<typeof confirmBookingSchema>;
export type UpdateBookingFromDialogType = z.infer<
  typeof updateBookingFromDialogSchema
>;
export type CreateClientBookingType = z.infer<typeof createClientBookingSchema>;
export type CancelClientBookingType = z.infer<typeof cancelClientBookingSchema>;
