import { booking } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, ne, lt, or, desc } from "drizzle-orm";
import { SmallInfoText } from "../ui/brand-text-ui/small-info-text";
import Link from "next/link";
import { PreviousUserBookingItem } from "./previous-booking-item";
import { ArrowRight } from "lucide-react";

export const PreviousUserBookings = async ({userId, limit}: {userId: string, limit?: number}) => {
    const previousSessions = await db.query.booking.findMany({
            where: and(
                eq(booking.userId, userId),
                eq(booking.status, "finished"),
            ),
            with: { bookingType: true },
            orderBy: desc(booking.start),
            ...(limit ? { limit } : {}),
        });

        return (
            <section>
                <div className="flex flex-row flex-wrap items-center">
                    <h2 className="my-3 font-serif text-xl font-semibold leading-tight text-brand-800 md:text-3xl flex-1">
                        Minulé stretnutia
                    </h2>
                    <Link className="text-xs md:text-xs text-brand-600 uppercase flex gap-2 items-center" href="/client/absolved">
                        <span>Všetky záznamy</span>
                        <ArrowRight className="text-xs"/>
                    </Link>
                </div>
                {previousSessions.length === 0 && (
                    <>
                        <SmallInfoText content="Žiadne absolvované stretnutia" className="mb-2 md:mb-5"/>
                    </>
                )}
                {previousSessions.length !== 0 && (
                    <div className="flex flex-col gap-5">
                        {previousSessions.map(s => (
                            <PreviousUserBookingItem key={s.id} item={s} />
                        ))}
                    </div>
                )}
            </section>
        );
}