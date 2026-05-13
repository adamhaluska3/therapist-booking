import { SmallInfoText } from "../ui/brand-text-ui/small-info-text";
import Link from "next/link";
import { ClosestConfirmedUpcommingBooking } from "./closest-confirmed-upcomming-booking";
import { ClosestPendingUpcommingBooking } from "./closest-pending-upcoming-booking";
import { UpcomingUserBookingItem } from "./upcoming-booking-item";
import { ClientPaymentInfo } from "./client-payment-info";
import { Button } from "../ui/button";
import { CreditCard } from "lucide-react";
import { getClientUpcomingSessions } from "@/server/client/queries";

export const UpcomingUserBookings = async ({userId, limit}: {userId: string, limit?: number}) => {
    const upcomingSessions = await getClientUpcomingSessions(userId, limit);

    const timeSorted = upcomingSessions.sort((s1, s2) => s1.start < s2.start ? -1 : s1.start === s2.start ? 0 : 1)
    const confirmed = timeSorted.filter(s => s.status === "confirmed")[0] || null;
    const pending = timeSorted.filter(s => s.status === "pending")[0] || null;
    const rest = timeSorted.filter(s => s.id !== confirmed?.id && s.id !== pending?.id)
    return (
        <section>
            <div className="flex flex-row flex-wrap items-center">
                    <h2 className="my-3 font-serif text-xl font-semibold leading-tight text-brand-800 md:text-2xl flex-1">
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
                    <div className="flex flex-col gap-5">
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
                                    (
                                        <ClientPaymentInfo centPrice={s.price || 0} vs={s.variableSymbol} note={s.bookingType?.name ?? ""}>
                                            <button className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700">
                                                <CreditCard size={12} />
                                                <span>Platba</span>
                                            </button>
                                        </ClientPaymentInfo>
                                    )
                                } />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}