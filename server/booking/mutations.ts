"use server";
import { db } from "@/lib/db";
import {
  CancelClientBookingType,
  CreateAdminBookingType,
  CreateClientBookingType,
  DeleteBookingType,
  UpdateBookingFromDialogType,
  UpdateBookingStatusType,
} from "./schema";
import { booking, bookingType } from "@/db/schema";
import { eq, and, gt, lt, ne } from "drizzle-orm";
import { account, user as userModel } from "@/db/auth-schema";
import {
  sendBookingCancellationToClient,
  sendBookingCancellationToTherapist,
  sendBookingConfirmationToClient,
  sendBookingNotificationToTherapist,
  sendBookingRescheduledToClient,
} from "@/lib/email";
import { getUserById } from "../user/queries";
import { requireAuth } from "../auth";
import { fetchPriceForBookingType } from "../booking-type/queries";
import { createMeetLink } from "../utils/meet";
import { generateVS } from "../utils/payment";
import { revalidatePath } from "next/cache";

export async function deleteBookingWithNotification({
  id,
}: DeleteBookingType): Promise<void> {
  const rows = await db
    .select()
    .from(booking)
    .leftJoin(userModel, eq(booking.userId, userModel.id))
    .where(eq(booking.id, id))
    .limit(1);

  const row = rows[0];

  await db.delete(booking).where(eq(booking.id, id));

  if (row?.user?.email) {
    const clientName = row.user.nickname ?? row.user.name;
    void sendBookingCancellationToClient({
      clientName,
      clientEmail: row.user.email,
      start: row.booking.start,
      end: row.booking.end,
    });
  }
}

export async function updateBookingStatus({
  id,
  status,
}: UpdateBookingStatusType): Promise<void> {
  if (status === "cancelled") {
    const rows = await db
      .select()
      .from(booking)
      .leftJoin(userModel, eq(booking.userId, userModel.id))
      .where(eq(booking.id, id))
      .limit(1);

    const row = rows[0];
    if (row?.user?.email) {
      const clientName = row.user.nickname ?? row.user.name;
      void sendBookingCancellationToClient({
        clientName,
        clientEmail: row.user.email,
        start: row.booking.start,
        end: row.booking.end,
      });
    }
  }

  await db.update(booking).set({ status }).where(eq(booking.id, id));
}

export async function confirmBooking(id: string): Promise<void> {
  const user = await requireAuth();
  const googleAccount = await db.query.account.findFirst({
    where: eq(account.userId, user.id),
  });

  const foundBooking = await db.query.booking.findFirst({
    where: eq(booking.id, id),
  });
  if (!foundBooking) {
    return;
  }

  const clientUser = foundBooking.userId
    ? await getUserById(foundBooking.userId)
    : null;
  const meet = await createMeetLink(
    foundBooking.start.toISOString(),
    foundBooking.end.toISOString(),
    googleAccount?.refreshToken ?? "",
    clientUser?.email ?? undefined,
  );

  await db
    .update(booking)
    .set({ status: "confirmed", meetLink: meet?.meetLink })
    .where(eq(booking.id, id));

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(userModel, eq(booking.userId, userModel.id))
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
    meetLink: meet?.meetLink,
    locationType: row.booking.locationType,
  }).catch(() =>
    console.log(
      "Error sending booking confirmation email to client (booking id " +
        id +
        ")",
    ),
  );
}

export async function updateBookingFromDialog({
  id,
  updates,
  previousStart,
}: UpdateBookingFromDialogType): Promise<{ ok: boolean; error?: string }> {
  const timeChanged = updates.start.getTime() !== previousStart.getTime();

  const user = await requireAuth();
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
      );
    if (conflicts.length > 0) {
      return {
        ok: false,
        error: "V tomto čase už existuje potvrdené sedenie.",
      };
    }
  }

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(userModel, eq(booking.userId, userModel.id))
    .where(eq(booking.id, id))
    .limit(1);
  const row = rows[0];

  await db
    .update(booking)
    .set({
      start: updates.start,
      end: updates.end,
      userId: updates.userId,
      bookingTypeId: updates.bookingTypeId,
      note: updates.note,
      locationType: updates.locationType,
    })
    .where(eq(booking.id, id));

  if (timeChanged && row?.user?.email) {
    const clientName = row.user.nickname ?? row.user.name;
    void sendBookingRescheduledToClient({
      clientName,
      clientEmail: row.user.email,
      bookingId: id,
      oldStart: previousStart,
      newStart: updates.start,
      newEnd: updates.end,
      meetLink: row.booking.meetLink ?? undefined,
      locationType: updates.locationType,
    });
  }

  return { ok: true };
}

export async function createClientBooking({
  dateKey,
  time,
  userId,
  note,
  bookingTypeId,
  locationType,
}: CreateClientBookingType): Promise<{ ok: boolean; error?: string }> {
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

  const resolvedBookingTypeId = bookingTypeId ?? (
    await db
      .select({ id: bookingType.id })
      .from(bookingType)
      .where(eq(bookingType.isDefault, true))
      .limit(1)
      .then((rows) => rows[0]?.id ?? null)
  );

  if (!resolvedBookingTypeId) {
    return { ok: false, error: "Termín nemá priradený typ." };
  }

  const priceSnapshot = resolvedBookingTypeId
    ? await fetchPriceForBookingType(resolvedBookingTypeId)
    : null;

  const [inserted] = await db
    .insert(booking)
    .values({
      start,
      end,
      status: "pending",
      userId: userId,
      bookingTypeId: resolvedBookingTypeId,
      note: note?.trim() || null,
      locationType,
      variableSymbol: generateVS(),
      price: priceSnapshot,
    })
    .returning({ id: booking.id });

  const clientUserQuery = !userId
    ? null
    : await db.select().from(userModel).where(eq(userModel.id, userId));
  const clientUser = clientUserQuery?.[0];
  const clientName = clientUser?.nickname ?? clientUser?.name ?? "Klient";
  const clientEmail = clientUser?.email;

  await sendBookingNotificationToTherapist({
    start,
    end,
    clientName,
    clientEmail,
  }).catch(() =>
    console.log(
      "Error sending booking notification email to therapist (booking id " +
        inserted.id +
        ")",
    ),
  );

  return { ok: true };
}

export async function createAdminBooking(
  data: CreateAdminBookingType,
): Promise<void> {
  const user = await requireAuth();
  const priceSnapshot =
    data.price ??
    (data.bookingTypeId
      ? await fetchPriceForBookingType(data.bookingTypeId)
      : null);

  const googleAccount =
    user === null
      ? null
      : await db.query.account.findFirst({
          where: eq(account.userId, user.id),
        });

  const clientUser = data.userId ? await getUserById(data.userId) : null;
  const meet = await createMeetLink(
    data.start.toISOString(),
    data.end.toISOString(),
    googleAccount?.refreshToken ?? "",
    clientUser?.email ?? undefined,
  );
  await db.insert(booking).values({
    id: data.id,
    start: data.start,
    end: data.end,
    status: data.status,
    userId: data.userId,
    bookingTypeId: data.bookingTypeId,
    price: priceSnapshot,
    meetLink: data.status === "confirmed" ? meet?.meetLink : null,
    variableSymbol: generateVS(),
    note: data.note,
    locationType: data.locationType,
  });

  if (data.userId) {
    const clientUser = await getUserById(data.userId);
    if (clientUser?.email) {
      void sendBookingConfirmationToClient({
        bookingId: data.id,
        start: data.start,
        end: data.end,
        clientName: clientUser.nickname ?? clientUser.name ?? "Klient",
        clientEmail: clientUser.email,
        meetLink: data.status === "confirmed" ? meet?.meetLink : undefined,
        locationType: data.locationType,
      });
    }
  }
}

export async function cancelClientBooking({
  bookingId,
}: CancelClientBookingType): Promise<{ ok: boolean; error?: string }> {
  const user = await requireAuth();
  const row = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });
  if (!row) return { ok: false, error: "Rezervácia sa nenašla." };
  if (user === null || row.userId !== user.id)
    return { ok: false, error: "Nemáte oprávnenie." };
  if (row.start.getTime() < Date.now() + 2 * 24 * 60 * 60 * 1000) {
    return {
      ok: false,
      error: "Rezerváciu je možné zrušiť iba do 48 hodín",
    };
  }

  await db
    .update(booking)
    .set({ status: "cancelled" })
    .where(eq(booking.id, bookingId));

  if (user.email) {
    void sendBookingCancellationToTherapist({
      clientName: user.name,
      clientEmail: user.email,
      start: row.start,
      end: row.end,
    });
  }

  revalidatePath("/client");
  return { ok: true };
}
