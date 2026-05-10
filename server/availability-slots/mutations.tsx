"use server";
import { db } from "@/lib/db";
import { SlotUpsert } from "./schema";
import { availabilitySlot } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { requireAdmin } from "../auth";

export async function saveAvailabilitySlots(
  upserted: SlotUpsert[],
  deletedIds: string[],
): Promise<void> {
  await requireAdmin();
  await db.transaction(async (tx) => {
    if (deletedIds.length > 0) {
      await tx
        .delete(availabilitySlot)
        .where(inArray(availabilitySlot.id, deletedIds));
    }

    for (const slot of upserted) {
      await tx
        .insert(availabilitySlot)
        .values({
          id: slot.id,
          start: slot.start,
          end: slot.end,
          label: slot.label ?? null,
        })
        .onConflictDoUpdate({
          target: availabilitySlot.id,
          set: { start: slot.start, end: slot.end, label: slot.label ?? null },
        });
    }
  });
}
