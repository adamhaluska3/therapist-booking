import { availabilitySlot, booking } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { MediumInfoText } from "../ui/brand-text-ui/medium-info-text"
import { SmallInfoText } from "../ui/brand-text-ui/small-info-text"
import { bookingStatusIcon } from "../booking/booking-status-icon"

export type PreviousUserBookingItemProps = {
    item: {
        booking: InferSelectModel<typeof booking>
        availabilitySlot: InferSelectModel<typeof availabilitySlot>
    }
}

export const PreviousUserBookingItem = ({item}: PreviousUserBookingItemProps) => (
    <div className="flex gap-5 items-center w-full mx-auto px-10 py-5 shadow-sm bg-white rounded-2xl">
        {bookingStatusIcon[item.booking.status]}
        <div className="flex-1">
            <h3 className="font-semibold text-brand-800 sm:text-xl mb-2 md:mb-2">Možný názov</h3>
            <SmallInfoText content="možné poznámky?" className="mb-0 md:mb-0"/>
        </div>
        <div className="flex flex-col">
            <MediumInfoText content="Dátum" className="mb-2 md:mb-2"/>
            {item.availabilitySlot.start.toLocaleDateString("sk-SK", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
        </div>
    </div>
)