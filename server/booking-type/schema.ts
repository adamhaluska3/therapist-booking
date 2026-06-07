import { z } from "zod";

export const bookingTypePriceSchema = z.object({
  id: z.string(),
  price: z.number().min(0, "Cena nesmie byt záporná").nullable(),
});

export type BookingTypePriceType = z.infer<typeof bookingTypePriceSchema>;
