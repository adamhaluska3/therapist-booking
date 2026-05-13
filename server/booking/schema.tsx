import { Booking, locationTypeEnum } from "@/db/schema";

export type LocationType = typeof locationTypeEnum[number];
import { BookingUser } from "../user/schema";
import { user } from "@/db/auth-schema";

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
