"use server";

import { submitContactForm } from "./service";
import { ContactFormType, contactSchema } from "./schema";

export const submitContactFormAction = async (payload: ContactFormType) => {
  const validatedPayload = contactSchema.parse(payload);
  return submitContactForm(validatedPayload);
};
