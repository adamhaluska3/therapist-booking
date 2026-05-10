import { SmallInfoText } from "../ui/brand-text-ui/small-info-text";
import Link from "next/link";
import { PreviousUserBookingItem } from "./previous-booking-item";
import { ClientPaymentInfo } from "./client-payment-info";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { getClientPreviousSessions } from "@/server/client/queries";

export const PreviousUserBookings = async ({userId, limit}: {userId: string, limit?: number}) => {
    const previousSessions = await getClientPreviousSessions(userId, limit);

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
                        {previousSessions.map(s => {
                            const payment = (
                                <ClientPaymentInfo centPrice={s.price || 0} vs={s.variableSymbol} note={s.bookingType?.name ?? ""}>
                                    <Button className="p-2 px-4 bg-white border border-gray-500 text-brand-400 text-sm rounded-2xl flex gap-2">
                                        <span>Platba</span>
                                    </Button>
                                </ClientPaymentInfo>
                            );
                            return <PreviousUserBookingItem key={s.id} item={s} paymentSlot={payment} />;
                        })}
                    </div>
                )}
            </section>
        );
}