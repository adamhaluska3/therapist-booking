import { booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { MediumInfoText } from "../ui/brand-text-ui/medium-info-text"
import { SmallInfoText } from "../ui/brand-text-ui/small-info-text"
import { bookingStatusIcon } from "../booking/booking-status-icon"

export type PreviousUserBookingItemProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
}

export const PreviousUserBookingItem = ({item}: PreviousUserBookingItemProps) => (
    <div className="flex gap-5 items-center w-full mx-auto px-10 py-5 shadow-sm bg-white rounded-2xl flex-col sm:flex-row">
        <div className="flex-1 flex items-center gap-2">
            {bookingStatusIcon[item.status]}
            <h3 className="font-semibold text-brand-800 sm:text-xl">{item.bookingType?.name}</h3>
        </div>
        <div className="flex flex-row gap-2 sm:flex-col">
            <MediumInfoText content="Dátum" className="mb-0 md:mb-0"/>
            {item.start.toLocaleDateString("sk-SK", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
        </div>
    </div>
)