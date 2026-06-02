import { z } from "zod";

export const paymentSettingsSchema = z.object({
  iban: z
    .string()
    .min(1, "IBAN nesmie byť prázdný")
    .max(34, "IBAN nesmie byť dlhší než 34 znakov"),
  bic: z.string().max(11, "BIC nesmie byť dlhší než 11 znakov").optional(),
  beneficiaryName: z
    .string()
    .min(1, "Meno príjemcu nesmie byť prázdné")
    .max(100, "Meno príjemcu nesmie byť dlhšie než 100 znakov"),
  paymentNote: z
    .string()
    .max(255, "Poznámka k platbe nesmie byť dlhšia než 255 znakov")
    .optional(),
});

export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;
