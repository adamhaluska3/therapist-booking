"use server";
import { availabilitySlot, AvailabilitySlot } from "@/db/schema";
import { db } from "@/lib/db";
import { lte, and, gte } from "drizzle-orm";

export async function getAvailabilitySlots(
  from: Date,
  to: Date,
): Promise<AvailabilitySlot[]> {
  const slots = await db
    .select()
    .from(availabilitySlot)
    .where(
      and(lte(availabilitySlot.start, to), gte(availabilitySlot.end, from)),
    );
  return slots;
}
