import { z } from "zod";

export const bookingTypePricesSchema = z.object({
  bookingTypeId: z.string(),
  price: z.number().min(0, "Cena nesmie byt záporná").nullable(),
});
