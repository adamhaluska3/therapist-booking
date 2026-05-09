"use server";
import "server-only";
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";
import { sendContactFormEmail } from "@/lib/email";

export async function submitContactForm(
  data: ContactFormValues,
): Promise<{ success: boolean; error?: string }> {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje formulára." };
  }

  try {
    await sendContactFormEmail(parsed.data);
    return { success: true };
  } catch {
    return { success: false, error: "Nepodarilo sa odoslať správu. Skúste to prosím neskôr." };
  }
}
