"use server";

import { db } from "@/lib/db";
import { paymentSettings } from "@/db/schema";
import type { PaymentSettings } from "@/db/schema";

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  const rows = await db.select().from(paymentSettings).limit(1);
  return rows[0] ?? null;
}
