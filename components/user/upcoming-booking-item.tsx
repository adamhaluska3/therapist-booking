"use client"
import { booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { bookingStatusIcon } from "../booking/booking-status-icon"
import React, { useMemo } from "react"
import Link from "next/link"
import { Dot, Play, X, NotebookText } from "lucide-react"
import { ClientCancelBookingDialog } from "./client-cancel-booking-dialog"
import { NoteDialog } from "./note-dialog"
import { LocationBadge } from "@/components/booking/location-badge"

export type UpcomingUserBookingItemProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
    paymentSlot?: React.ReactNode
}

export const UpcomingUserBookingItem = ({item, paymentSlot}: UpcomingUserBookingItemProps) => {
    const buttons = useMemo(() => (
        <div className="flex gap-2 items-center">
        {item.note ? (
            <NoteDialog note={item.note}>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50">
                    <NotebookText size={12} />
                    <span>Poznámky</span>
                </button>
            </NoteDialog>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs text-neutral-400">
                <NotebookText size={12} />
                Bez poznámok
            </span>
        )}
        {item.status === "confirmed" && item.locationType === "online" && (
            <Link href={item.meetLink ?? "#"} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700">
                <Play size={12} />
                <span>Pripojiť sa</span>
            </Link>
        )}
        {paymentSlot}
        {(item.start.getTime() - Date.now() > 2 * 24 * 60 * 60 * 1000) && (
            <ClientCancelBookingDialog item={item}>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50">
                    <X size={12} />
                    <span>Zrušiť</span>
                </button>
            </ClientCancelBookingDialog>
        )}
        </div>
    ), [item, paymentSlot])
    return (
    <div className="flex gap-y-2 items-center w-full mx-auto px-10 py-5 shadow-sm bg-white rounded-2xl flex-col sm:flex-row">
        <div className="flex gap-5 items-center flex-1 flex-col sm:flex-row">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex gap-1 justify-center sm:justify-start items-center">
                    {bookingStatusIcon[item.status]}
                    <h3 className="font-semibold text-brand-800">{item.bookingType?.name}</h3>
                    <Dot />
                    <LocationBadge locationType={item.locationType} size={12} className="text-xs text-gray-400 font-semibold" />
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
            <div className="hidden md:block">{buttons}</div>
        </div>
        <div className="block md:hidden">
            {buttons}
        </div>
    </div>
    )
}