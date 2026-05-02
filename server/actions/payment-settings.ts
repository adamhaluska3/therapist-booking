"use server";

import { db } from "@/lib/db";
import { paymentSettings } from "@/db/schema";

export type PaymentSettingsInput = {
  iban: string;
  bic?: string;
  beneficiaryName: string;
  paymentNote?: string;
};

export async function savePaymentSettings(
  data: PaymentSettingsInput,
): Promise<void> {
  await db
    .insert(paymentSettings)
    .values({
      id: "singleton",
      iban: data.iban.replace(/\s+/g, ""),
      bic: data.bic || null,
      beneficiaryName: data.beneficiaryName,
      paymentNote: data.paymentNote || null,
    })
    .onConflictDoUpdate({
      target: paymentSettings.id,
      set: {
        iban: data.iban.replace(/\s+/g, ""),
        bic: data.bic || null,
        beneficiaryName: data.beneficiaryName,
        paymentNote: data.paymentNote || null,
        updatedAt: new Date(),
      },
    });
}
