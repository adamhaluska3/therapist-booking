"use server";

import { requireAdmin } from "../auth";
import { savePaymentSettings } from "./mutations";
import { paymentSettingsSchema, PaymentSettingsType } from "./schema";

export const SavePaymentSettingsAction = async (
  payload: PaymentSettingsType,
) => {
  await requireAdmin();
  const validatedPayload = paymentSettingsSchema.parse(payload);
  return await savePaymentSettings(validatedPayload);
};
