import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Vyplňte meno"),
  email: z.email("Neplatný email"),
  serviceType: z.string().min(1, "Vyberte typ služby"),
  message: z.string().min(10, "Správa musí mať aspoň 10 znakov"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
