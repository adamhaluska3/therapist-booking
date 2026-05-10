"use server";
import { db } from "@/lib/db";
import { paymentSettings } from "@/db/schema";
import type { PaymentSettings } from "@/db/schema";
import { requireAdmin } from "../auth";

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  await requireAdmin();
  const rows = await db.select().from(paymentSettings).limit(1);
  return rows[0] ?? null;
}
