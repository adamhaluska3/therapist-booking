"use server";
import { db } from "@/lib/db";
import { PaymentSettingsInput } from "./schema";
import { paymentSettings } from "@/db/schema";
import { requireAdmin } from "../auth";

export async function savePaymentSettings(
  data: PaymentSettingsInput,
): Promise<void> {
  await requireAdmin();
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
