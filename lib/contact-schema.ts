import { z } from "zod"

export const SERVICE_TYPES = [
  "psychotherapy",
  "supervision",
  "seminars",
  "coaching",
  "outdoor",
  "other",
] as const

export const SERVICE_LABELS: Record<typeof SERVICE_TYPES[number], string> = {
  psychotherapy: "Psychoterapia",
  supervision: "Supervízia",
  seminars: "Semináre",
  coaching: "Koučing",
  outdoor: "Outdoor terapia",
  other: "Iné",
}

export const contactSchema = z
  .object({
    name: z.string().min(1, "Vyplňte meno"),
    email: z.email("Neplatný email"),
    serviceType: z.enum(SERVICE_TYPES, { error: "Vyberte typ služby" }),
    serviceTypeOther: z.string().optional(),
    message: z.string().min(10, "Správa musí mať aspoň 10 znakov"),
  })
  .refine(
    (data) =>
      data.serviceType !== "other" ||
      (data.serviceTypeOther && data.serviceTypeOther.trim().length > 0),
    { message: "Upresniite typ služby", path: ["serviceTypeOther"] },
  )

export type ContactFormValues = z.infer<typeof contactSchema>
