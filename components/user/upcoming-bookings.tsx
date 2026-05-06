import { booking } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, gt, ne } from "drizzle-orm";
import { SmallInfoText } from "../ui/brand-text-ui/small-info-text";
import Link from "next/link";
import { ClosestConfirmedUpcommingBooking } from "./closest-confirmed-upcomming-booking";
import { ClosestPendingUpcommingBooking } from "./closest-pending-upcoming-booking";
import { UpcomingUserBookingItem } from "./upcoming-booking-item";
import { ClientPaymentInfo } from "./client-payment-info";
import { Button } from "../ui/button";

export const UpcomingUserBookings = async ({userId, limit}: {userId: string, limit?: number}) => {
    const upcomingSessions = await db.query.booking.findMany({
        where: and(
            eq(booking.userId, userId),
            ne(booking.status, "cancelled"),
            ne(booking.status, "finished")
        ),
        with: { bookingType: true },
        ...(limit ? { limit } : {}),
    });

    const timeSorted = upcomingSessions.sort((s1, s2) => s1.start < s2.start ? -1 : s1.start === s2.start ? 0 : 1)
    const confirmed = timeSorted.filter(s => s.status === "confirmed")[0] || null;
    const pending = timeSorted.filter(s => s.status === "pending")[0] || null;
    const rest = timeSorted.filter(s => s.id !== confirmed?.id && s.id !== pending?.id)
    return (
        <section>
            <div className="flex flex-row flex-wrap items-center">
                    <h2 className="my-3 font-serif text-xl font-semibold leading-tight text-brand-800 md:text-3xl flex-1">
                        Nadchádzajúce sedenia
                    </h2>
                </div>
            {timeSorted.length === 0 && (
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
            {timeSorted.length > 0 && (
                <div>
                    <div className="flex flex-wrap gap-x-5 gap-y-5">
                        {confirmed && (
                            <ClosestConfirmedUpcommingBooking item={confirmed} />
                        )}
                        {pending && (
                            <ClosestPendingUpcommingBooking item={pending} />
                        )}
                    </div>
                    {rest.length > 0 && (
                        <div className="mt-5 flex flex-col gap-5">
                            {rest.map(s => (
                                <UpcomingUserBookingItem key={s.id} item={s} paymentSlot={
                                    s.status === "pending" ? (
                                        <ClientPaymentInfo centPrice={s.price || 0} vs={s.variableSymbol} note={s.bookingType?.name ?? ""}>
                                            <Button className="p-5 bg-white border border-gray-500 text-brand-400 text-sm rounded-2xl flex gap-2">
                                                <span>Platba</span>
                                            </Button>
                                        </ClientPaymentInfo>
                                    ) : undefined
                                } />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}