"use server";

import { submitContactForm } from "./service";
import { contactSchema } from "./schema";

export const submitContactFormAction = async (payload: any) => {
  contactSchema.parse(payload);
  return submitContactForm(payload);
};
