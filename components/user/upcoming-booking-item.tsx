"use client"
import { booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { MediumInfoText } from "../ui/brand-text-ui/medium-info-text"
import { bookingStatusIcon } from "../booking/booking-status-icon"
import { Button } from "../ui/button"
import React, { useMemo } from "react"
import Link from "next/link"
import { Dot, Play } from "lucide-react"
import { ClientCancelBookingDialog } from "./client-cancel-booking-dialog"

export type UpcomingUserBookingItemProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
    paymentSlot?: React.ReactNode
}

export const UpcomingUserBookingItem = ({item, paymentSlot}: UpcomingUserBookingItemProps) => {
    const buttons = useMemo(() => (
        <div className="flex gap-5">
        {paymentSlot}
        {item.status === "confirmed" && (
            <Link href={item.meetLink ?? "#"}>
                <Button className="p-5 bg-brand-500 text-sm rounded-2xl flex gap-2">
                    <Play/>
                    <span>Pripojiť sa</span>
                </Button>
            </Link>
        )}
        {(item.start.getTime() - Date.now() > 2 * 24 * 60 * 60 * 1000) && (
            <ClientCancelBookingDialog item={item}>
                <Button className="p-5 bg-white border border-gray-500 text-black text-sm rounded-2xl flex gap-2">
                    <span>Zrusiť</span>
                </Button>
            </ClientCancelBookingDialog>
        )}
        </div>
    ), [item])
    return (
    <div className="flex gap-y-5 items-center w-full mx-auto px-10 py-5 shadow-sm bg-white rounded-2xl flex-col sm:flex-row">
        <div className="flex gap-5 items-center flex-1 flex-col sm:flex-row">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex gap-2 justify-center sm:justify-start">
                    {bookingStatusIcon[item.status]}
                    <h3 className="font-semibold text-brand-800 sm:text-xl">{item.bookingType?.name}</h3>
                </div>
                <div className="flex justify-center sm:justify-start">
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
            <div className="hidden sm:block">{buttons}</div>
        </div>
        <div className="block sm:hidden">
            {buttons}
        </div>
    </div>
    )
}