import { z } from "zod"

export const editBookingSchema = z
  .object({
    date: z.string().min(1, "Dátum je povinný"),
    startTime: z.string().min(1, "Čas začiatku je povinný"),
    endTime: z.string().min(1, "Čas konca je povinný"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Čas konca musí byť po čase začiatku.",
    path: ["endTime"],
  })

export type EditBookingFormValues = z.infer<typeof editBookingSchema>
