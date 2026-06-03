import { requireAdmin } from "../auth";
import { saveBookingTypePrices } from "./mutations";
import { bookingTypePricesSchema } from "./schema";

export const saveBookingTypePricesAction = async (payload: any) => {
  await requireAdmin();
  bookingTypePricesSchema.array().parse(payload);
  return await saveBookingTypePrices(payload);
};
