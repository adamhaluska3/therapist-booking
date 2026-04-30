"use server";
import { and, eq, gt, inArray, lt, ne } from "drizzle-orm";
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
          id: b.id,
          start: b.start,
          end: b.end,
          status: b.status ?? "confirmed",
          clientName: b.clientName ?? null,
          notes: b.notes ?? null,
          userId: b.userId ?? null,
        })
        .onConflictDoUpdate({
          target: booking.id,
          set: {
            start: b.start,
            end: b.end,
            status: b.status ?? "confirmed",
            clientName: b.clientName ?? null,
            notes: b.notes ?? null,
          },
        });
    }
  });
}

export async function deleteBookingById(id: string): Promise<void> {
  await db.delete(booking).where(eq(booking.id, id));
}

export async function updateBookingStatus(
  id: string,
  status: "cancelled" | "finished",
): Promise<void> {
  await db.update(booking).set({ status }).where(eq(booking.id, id));
}

export async function confirmBooking(id: string): Promise<void> {
  await db.update(booking).set({ status: "confirmed" }).where(eq(booking.id, id));
}

export async function updateBookingTime(
  id: string,
  start: Date,
  end: Date,
): Promise<{ ok: boolean; error?: string }> {
  const conflicts = await db
    .select({ id: booking.id })
    .from(booking)
    .where(
      and(
        lt(booking.start, end),
        gt(booking.end, start),
        eq(booking.status, "confirmed"),
        ne(booking.id, id),
      ),
    );

  if (conflicts.length > 0) {
    return { ok: false, error: "V tomto čase už existuje potvrdené sedenie." };
  }

  await db.update(booking).set({ start, end }).where(eq(booking.id, id));
  return { ok: true };
}

export async function createClientBooking(
  dateKey: string,
  time: string,
  clientName?: string,
): Promise<{ ok: boolean; error?: string }> {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const start = new Date(y, m - 1, d, hh, mm, 0, 0);
  const end = new Date(start.getTime() + 3_600_000);

  const conflicts = await db
    .select({ id: booking.id })
    .from(booking)
    .where(and(lt(booking.start, end), gt(booking.end, start)));

  if (conflicts.length > 0) {
    return { ok: false, error: "Tento termín je už obsadený." };
  }

  await db.insert(booking).values({
    start,
    end,
    status: "pending",
    clientName: clientName?.trim() || null,
  });

  return { ok: true };
}
