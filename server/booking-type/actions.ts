"use server";

import { requireAdmin } from "../auth";
import { saveBookingTypePrices } from "./mutations";
import { bookingTypePriceSchema, BookingTypePriceType } from "./schema";

export const saveBookingTypePricesAction = async (
  payload: BookingTypePriceType[],
) => {
  await requireAdmin();
  const validatedPayload = bookingTypePriceSchema.array().parse(payload);
  return await saveBookingTypePrices(validatedPayload);
};
