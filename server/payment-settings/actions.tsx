"use server";

import { requireAdmin } from "../auth";
import { savePaymentSettings } from "./mutations";
import { paymentSettingsSchema } from "./schema";

export const SavePaymentSettingsAction = async (payload: any) => {
  await requireAdmin();
  const data = paymentSettingsSchema.parse(payload);
  return await savePaymentSettings(data);
};
