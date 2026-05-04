"use server";
import { and, desc, eq, gt, gte, inArray, like, lt, lte, ne, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilitySlot, booking, type Booking, type BookingWithUser, type AvailabilitySlot } from "@/db/schema";
import { user } from "@/db/auth-schema";
import type { UserOption } from "@/server/queries/users";
import { getUserById } from "@/server/queries/users";
import { sendBookingNotificationToTherapist, sendBookingConfirmationToClient, sendBookingCancellationToClient, sendBookingRescheduledToClient } from "@/lib/email";
import { SESSIONS_PAGE_SIZE, DASHBOARD_PAGE_SIZE } from "@/lib/constants";

function toBookingWithUser(row: {
  booking: typeof booking.$inferSelect;
  user: typeof user.$inferSelect | null;
}): BookingWithUser {
  return {
    ...row.booking,
    user: row.user
      ? { id: row.user.id, name: row.user.name, nickname: row.user.nickname, email: row.user.email }
      : null,
  }
}

export async function fetchDashboardBookings(
  offset: number,
  search = "",
  from?: Date,
  to?: Date,
): Promise<{ bookings: BookingWithUser[]; nextOffset: number | undefined }> {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const items = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(
      and(
        gte(booking.start, from ?? startOfToday),
        to ? lt(booking.start, to) : undefined,
        eq(booking.status, "confirmed"),
        search
          ? or(
              like(user.name, `%${search}%`),
              like(user.nickname, `%${search}%`),
            )
          : undefined,
      ),
    )
    .orderBy(booking.start)
    .limit(DASHBOARD_PAGE_SIZE + 1)
    .offset(offset)

  const hasMore = items.length > DASHBOARD_PAGE_SIZE
  return {
    bookings: items.slice(0, DASHBOARD_PAGE_SIZE).map(toBookingWithUser),
    nextOffset: hasMore ? offset + DASHBOARD_PAGE_SIZE : undefined,
  }
}

export async function fetchFinishedBookings(
  offset: number,
): Promise<{ bookings: BookingWithUser[]; nextOffset: number | undefined }> {
  const items = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.status, "finished"))
    .orderBy(desc(booking.start))
    .limit(SESSIONS_PAGE_SIZE + 1)
    .offset(offset)

  const hasMore = items.length > SESSIONS_PAGE_SIZE
  return {
    bookings: items.slice(0, SESSIONS_PAGE_SIZE).map(toBookingWithUser),
    nextOffset: hasMore ? offset + SESSIONS_PAGE_SIZE : undefined,
  }
}

export async function fetchCalendarData(
  from: Date,
  to: Date,
): Promise<{ slots: AvailabilitySlot[]; bookings: BookingWithUser[] }> {
  const [slots, bookingRows] = await Promise.all([
    db
      .select()
      .from(availabilitySlot)
      .where(
        and(lte(availabilitySlot.start, to), gte(availabilitySlot.end, from)),
      ),
    db
      .select()
      .from(booking)
      .leftJoin(user, eq(booking.userId, user.id))
      .where(and(lte(booking.start, to), gte(booking.end, from))),
  ]);

  return {
    slots,
    bookings: bookingRows.map((row) => ({
      ...row.booking,
      user: row.user
        ? {
            id: row.user.id,
            name: row.user.name,
            nickname: row.user.nickname,
            email: row.user.email,
          }
        : null,
    })),
  };
}

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

export type BookingUpsert = {
  id: string;
  start: Date;
  end: Date;
  status?: "pending" | "confirmed" | "cancelled" | "finished";
  price?: number | null;
  userId?: string | null;
  bookingTypeId?: string | null;
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
          price: b.price ?? null,
          userId: b.userId ?? null,
          bookingTypeId: b.bookingTypeId ?? null,
        })
        .onConflictDoUpdate({
          target: booking.id,
          set: {
            start: b.start,
            end: b.end,
            status: b.status ?? "confirmed",
            userId: b.userId ?? null,
            bookingTypeId: b.bookingTypeId ?? null,
          },
        });
    }
  });
}

export async function deleteBookingById(id: string): Promise<void> {
  await db.delete(booking).where(eq(booking.id, id));
}

export async function createAdminBooking(data: {
  id: string
  start: Date
  end: Date
  status: "pending" | "confirmed" | "cancelled" | "finished"
  userId: string | null
  bookingTypeId: string | null
  price: number | null
}): Promise<void> {
  await db.insert(booking).values({
    id: data.id,
    start: data.start,
    end: data.end,
    status: data.status,
    userId: data.userId,
    bookingTypeId: data.bookingTypeId,
    price: data.price,
  })

  if (data.userId) {
    const clientUser = await getUserById(data.userId)
    if (clientUser?.email) {
      void sendBookingConfirmationToClient({
        bookingId: data.id,
        start: data.start,
        end: data.end,
        clientName: clientUser.nickname ?? clientUser.name ?? "Klient",
        clientEmail: clientUser.email,
      })
    }
  }
}

export async function deleteBookingWithNotification(id: string): Promise<void> {
  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1)

  const row = rows[0]

  await db.delete(booking).where(eq(booking.id, id))

  if (row?.user?.email) {
    const clientName = row.user.nickname ?? row.user.name
    void sendBookingCancellationToClient({
      clientName,
      clientEmail: row.user.email,
      start: row.booking.start,
      end: row.booking.end,
    })
  }
}

export async function updateBookingStatus(
  id: string,
  status: "cancelled" | "finished",
): Promise<void> {
  if (status === "cancelled") {
    const rows = await db
      .select()
      .from(booking)
      .leftJoin(user, eq(booking.userId, user.id))
      .where(eq(booking.id, id))
      .limit(1)

    const row = rows[0]
    if (row?.user?.email) {
      const clientName = row.user.nickname ?? row.user.name
      void sendBookingCancellationToClient({
        clientName,
        clientEmail: row.user.email,
        start: row.booking.start,
        end: row.booking.end,
      })
    }
  }

  await db.update(booking).set({ status }).where(eq(booking.id, id));
}

export async function confirmBooking(id: string): Promise<void> {
  await db
    .update(booking)
    .set({ status: "confirmed" })
    .where(eq(booking.id, id));

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return;

  const clientEmail = row.user?.email;
  if (!clientEmail) return;

  const clientName = row.user?.nickname ?? row.user?.name ?? "Klient";

  await sendBookingConfirmationToClient({
    bookingId: id,
    start: row.booking.start,
    end: row.booking.end,
    clientName,
    clientEmail,
  }).catch(() => undefined);
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

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1)

  const row = rows[0]
  const oldStart = row?.booking.start

  await db.update(booking).set({ start, end }).where(eq(booking.id, id));

  if (row?.user?.email && oldStart) {
    const clientName = row.user.nickname ?? row.user.name
    void sendBookingRescheduledToClient({
      clientName,
      clientEmail: row.user.email,
      bookingId: id,
      oldStart,
      newStart: start,
      newEnd: end,
    })
  }

  return { ok: true };
}

export async function updateBookingFromDialog(
  id: string,
  updates: { start: Date; end: Date; userId: string | null; bookingTypeId: string | null },
  previousStart: Date,
): Promise<{ ok: boolean; error?: string }> {
  const timeChanged =
    updates.start.getTime() !== previousStart.getTime()

  if (timeChanged) {
    const conflicts = await db
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          lt(booking.start, updates.end),
          gt(booking.end, updates.start),
          eq(booking.status, "confirmed"),
          ne(booking.id, id),
        ),
      )
    if (conflicts.length > 0) {
      return { ok: false, error: "V tomto čase už existuje potvrdené sedenie." }
    }
  }

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1)
  const row = rows[0]

  await db
    .update(booking)
    .set({ start: updates.start, end: updates.end, userId: updates.userId, bookingTypeId: updates.bookingTypeId })
    .where(eq(booking.id, id))

  if (timeChanged && row?.user?.email) {
    const clientName = row.user.nickname ?? row.user.name
    void sendBookingRescheduledToClient({
      clientName,
      clientEmail: row.user.email,
      bookingId: id,
      oldStart: previousStart,
      newStart: updates.start,
      newEnd: updates.end,
    })
  }

  return { ok: true }
}

export async function createClientBooking(
  dateKey: string,
  time: string,
  userId?: string,
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

  const [inserted] = await db.insert(booking).values({
    start,
    end,
    status: "pending",
    userId: userId ?? null,
  }).returning({ id: booking.id });

  const clientUser = userId ? await getUserById(userId) : null
  const clientName = clientUser?.nickname ?? clientUser?.name ?? "Klient"
  const clientEmail = clientUser?.email

  await sendBookingNotificationToTherapist({
    start,
    end,
    clientName,
    clientEmail,
  }).catch(() => undefined)

  return { ok: true };
}

export async function updateUserNickname(
  userId: string,
  nickname: string,
): Promise<void> {
  await db
    .update(user)
    .set({ nickname: nickname || null })
    .where(eq(user.id, userId));
}

export async function createNonOAuthUser(
  name: string,
  email: string,
  phone?: string,
): Promise<{ ok: boolean; user?: UserOption; error?: string }> {
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  if (!trimmedName || !trimmedEmail) {
    return { ok: false, error: "Meno a email sú povinné." };
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, trimmedEmail));

  if (existing.length > 0) {
    return { ok: false, error: "Používateľ s týmto emailom už existuje." };
  }

  const id = crypto.randomUUID();
  await db.insert(user).values({
    id,
    name: trimmedName,
    email: trimmedEmail,
    emailVerified: false,
    phone: phone?.trim() || null,
    role: "user",
  });

  return {
    ok: true,
    user: { id, name: trimmedName, nickname: null, email: trimmedEmail },
  };
}
