"use server";

import { availabilitySlot, AvailabilitySlot } from "@/db/schema";
import { db } from "@/lib/db";
import { lte, and, gte } from "drizzle-orm";
import { GetAvailabilitySlotsType } from "./schema";

export async function getAvailabilitySlots({
  from,
  to,
}: GetAvailabilitySlotsType): Promise<AvailabilitySlot[]> {
  const slots = await db
    .select()
    .from(availabilitySlot)
    .where(
      and(lte(availabilitySlot.start, to), gte(availabilitySlot.end, from)),
    );
  return slots;
}
