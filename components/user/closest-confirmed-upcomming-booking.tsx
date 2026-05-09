import { Booking, booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { Calendar, Clock5, Play } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"
import Link from "next/link"
import { ClientCancelBookingDialog } from "./client-cancel-booking-dialog"

const bookingTypeImageSrc = {
  "bt-psychoterapia":   "/images/booking-types/psycho-therapy.png",
}

export type ClosestConfirmedUpcommingBookingProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
}

export const ClosestConfirmedUpcommingBooking = ({item}: ClosestConfirmedUpcommingBookingProps) => (
    <article className="flex bg-white rounded-2xl p-10 overflow-hidden gap-10">
        <section className="flex flex-col gap-5">
            <div className="flex flex-1 flex-col gap-5">
                <div className="flex justify-start gap-2 items-center">
                    <span className="p-2 bg-brand-300 text-brand-800 rounded-2xl font-bold uppercase text-xs">Potvrdené</span>
                    <span className="text-sm text-gray-400 uppercase">Najbližšie stretnutie</span>
                </div>
                <h1 className="text-2xl">{item.bookingType?.name}</h1>
                <Image
                    className="aspect-4/3 object-cover md:hidden"
                    src={bookingTypeImageSrc[(item.bookingType?.id ?? "bt-psychoterapia") as keyof typeof bookingTypeImageSrc]}
                    alt=""
                    width={280}
                    height={170}
                />
                <div className="flex gap-2 text-sm text-brand-700">
                    <Calendar />
                    <span>{item.start.toLocaleDateString("sk-SK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                        .split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(" ")}</span>
                </div>
                <div className="flex gap-2 text-sm text-brand-700">
                    <Clock5/>
                    <span>
                        {item.start.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })} - {item.end.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
                <div className="flex gap-2 text-sm text-brand-700">
                    Online / On-site = doplnime v stredu
                </div>
            </div>
            <div className="flex gap-2 text-sm text-brand-700">
                {true && (
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
                            <span>Zrušiť</span>
                        </Button>
                    </ClientCancelBookingDialog>
                )}
            </div>
        </section>
            <Image
                className="aspect-4/3 object-cover hidden md:block"
                src={bookingTypeImageSrc[(item.bookingType?.id ?? "bt-psychoterapia") as keyof typeof bookingTypeImageSrc]}
                alt=""
                width={220}
                height={155}
            />
    </article>
)