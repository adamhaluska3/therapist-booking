"use server";

import { ContactFormType, contactSchema } from "@/server/contact-form/schema";
import { sendContactFormEmail } from "@/lib/email";

export async function submitContactForm(
  data: ContactFormType,
): Promise<{ success: boolean; error?: string }> {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje formulára." };
  }

  try {
    await sendContactFormEmail(parsed.data);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Nepodarilo sa odoslať správu. Skúste to prosím neskôr.",
    };
  }
}
