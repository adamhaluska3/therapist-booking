import { availabilitySlot, booking } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, gt, ne } from "drizzle-orm";
import { SmallInfoText } from "../ui/brand-text-ui/small-info-text";
import { Button } from "@base-ui/react/button";
import Link from "next/link";

export const UpcomingUserBookings = async ({userId, limit}: {userId: string, limit?: number}) => {
    const query = db
        .select()
        .from(booking)
        .innerJoin(availabilitySlot, eq(booking.availabilitySlotId, availabilitySlot.id))
        .where(
            and(
                eq(booking.userId, userId),
                gt(availabilitySlot.start, new Date()),
                ne(booking.status, "cancelled")
            )
        );

    const upcomingSessions = await (limit ? query.limit(limit) : query)

    return (
        <section>
            <div className="flex flex-row flex-wrap items-center">
                    <h2 className="my-3 font-serif text-xl font-semibold leading-tight text-brand-800 md:text-3xl flex-1">
                        Nadchádzajúce sedenia
                    </h2>
                    <Link className="text-xs md:text-xl" href="/my-profile">Zobraziť všetky</Link>
                </div>
            {upcomingSessions.length === 0 && (
                <>
                    <SmallInfoText content="Momentálne nemáte žiadne naplánované sedenia." className="mb-2 md:mb-5"/>
                    <SmallInfoText content="V prípade záujmu o sedenie, vyberte si preferovaný termín" className="mb-2 md:mb-5"/>
                    <Link href="/booking">
                        <Button className="h-auto rounded-full bg-brand-700 px-4 py-2 text-xs text-white hover:bg-brand-800">
                            Zarezerovať termín →
                        </Button>
                    </Link>
                </>
            )}
        </section>
    );
}