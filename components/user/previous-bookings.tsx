import { availabilitySlot, booking } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, gt, ne, lt } from "drizzle-orm";
import { SmallInfoText } from "../ui/brand-text-ui/small-info-text";
import Link from "next/link";
import { PreviousUserBookingItem } from "./previous-booking-item";

export const PreviousUserBookings = async ({userId, limit}: {userId: string, limit?: number}) => {
    const query = db
        .select()
        .from(booking)
        .innerJoin(availabilitySlot, eq(booking.availabilitySlotId, availabilitySlot.id))
        .where(
            and(
                eq(booking.userId, userId),
                lt(availabilitySlot.end, new Date()),
                ne(booking.status, "cancelled")
            )
        );

        const sessions = await (limit ? query.limit(limit) : query);
        const previousSessions = sessions.map(s => ({
            booking: s.booking,
            availabilitySlot: s.availability_slot
        }));

        return (
            <section>
                <div className="flex flex-row flex-wrap items-center">
                    <h2 className="my-3 font-serif text-xl font-semibold leading-tight text-brand-800 md:text-3xl flex-1">
                        Minulé sedenia
                    </h2>
                    <Link className="text-xs md:text-xl" href="/my-profile">Zobraziť všetky</Link>
                </div>
                {previousSessions.length === 0 && (
                    <>
                        <SmallInfoText content="Žiadne absolvované sedenia" className="mb-2 md:mb-5"/>
                    </>
                )}
                {previousSessions.length !== 0 && (
                    <div className="flex flex-col gap-5">
                        {previousSessions.map(s => (
                            <PreviousUserBookingItem key={s.booking.id} item={s} />
                        ))}
                    </div>
                )}
            </section>
        );
}