import { booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { bookingStatusIcon } from "../booking/booking-status-icon"
import React from "react"
import { Dot } from "lucide-react"
import { NoteDialog } from "./note-dialog"

export type PreviousUserBookingItemProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
    paymentSlot?: React.ReactNode
}

const NoteItem = ({ note }: { note: string | null }) => (
    <div className="text-sm">
        {note && (
            <NoteDialog note={note}>
                <span className="text-sm font-semibold hover:text-taupe-800 underline">
                    Zobraziť poznámky
                </span>
            </NoteDialog>
        )}
        {!note && <span>Bez poznámok</span>}
    </div>
);
export const PreviousUserBookingItem = ({item, paymentSlot}: PreviousUserBookingItemProps) => (
    <div className="flex gap-y-2 items-center w-full mx-auto px-10 py-5 shadow-sm bg-white rounded-2xl flex-col sm:flex-row">
        <div className="flex gap-5 items-center flex-1 flex-col sm:flex-row">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex gap-1 justify-center sm:justify-start items-center">
                    {bookingStatusIcon[item.status]}
                    <h3 className="font-semibold text-brand-800 sm:text-xl">{item.bookingType?.name}</h3>
                    <Dot />
                    <span className="text-gray-400 font-semibold uppercase text-xs sm:text-sm">{item.locationType === "online" ? "ONLINE" : "OSOBNE"}</span>
                </div>
                <div className="flex text-sm justify-center sm:justify-start items-center">
                    <span>
                        {item.start.toLocaleDateString("sk-SK", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </span>
                    <Dot/>
                    <span>
                        {item.start.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })} - {item.end.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
            </div>
            <div className="hidden md:block">{paymentSlot}</div>
            <div className="hidden md:flex gap-2 text-sm text-brand-700">
                <NoteItem note={item.note} />
            </div>
        </div>
        <div className="block md:hidden">{paymentSlot}</div>
        <div className="md:hidden flex gap-2 text-sm text-brand-700">
            <NoteItem note={item.note} />
        </div>
    </div>
)