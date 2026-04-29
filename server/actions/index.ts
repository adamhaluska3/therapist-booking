"use server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilitySlot, booking } from "@/db/schema";

export type SlotUpsert = {
  id: string;
  start: Date;
  end: Date;
  label?: string | null;
};

export async function saveAvailabilitySlots(
  upserted: SlotUpsert[],
  deletedIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    if (deletedIds.length > 0) {
      await tx
        .delete(availabilitySlot)
        .where(inArray(availabilitySlot.id, deletedIds));
    }

    for (const slot of upserted) {
      await tx
        .insert(availabilitySlot)
        .values({ id: slot.id, start: slot.start, end: slot.end, label: slot.label ?? null })
        .onConflictDoUpdate({
          target: availabilitySlot.id,
          set: { start: slot.start, end: slot.end, label: slot.label ?? null },
        });
    }
  });
}

export type BookingUpsert = {
  id: string;
  start: Date;
  end: Date;
  status?: "pending" | "confirmed" | "cancelled" | "finished";
  clientName?: string | null;
  notes?: string | null;
  userId?: string | null;
};

export async function saveBookings(
  upserted: BookingUpsert[],
  deletedIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    if (deletedIds.length > 0) {
      await tx.delete(booking).where(inArray(booking.id, deletedIds));
    }

    for (const b of upserted) {
      await tx
        .insert(booking)
        .values({
          id:         b.id,
          start:      b.start,
          end:        b.end,
          status:     b.status ?? "confirmed",
          clientName: b.clientName ?? null,
          notes:      b.notes ?? null,
          userId:     b.userId ?? null,
        })
        .onConflictDoUpdate({
          target: booking.id,
          set: {
            start:      b.start,
            end:        b.end,
            status:     b.status ?? "confirmed",
            clientName: b.clientName ?? null,
            notes:      b.notes ?? null,
          },
        });
    }
  });
}

export async function deleteBookingById(id: string): Promise<void> {
  await db.delete(booking).where(eq(booking.id, id));
}
