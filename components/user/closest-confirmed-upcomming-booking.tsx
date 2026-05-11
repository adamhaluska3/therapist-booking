import { Booking, booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { Calendar, Clock5, MapPin, NotebookText, Play } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"
import Link from "next/link"
import { ClientCancelBookingDialog } from "./client-cancel-booking-dialog"
import { ADDRESS_SHORT } from "@/lib/constants"
import { ClientPaymentInfo } from "./client-payment-info"
import { NoteDialog } from "./note-dialog"

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
                    src={bookingTypeImageSrc[("bt-psychoterapia") as keyof typeof bookingTypeImageSrc]}
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
                <div className="flex gap-2 text-sm text-brand-700 items-center">
                    {item.locationType === "online" && (
                        <>
                            <Play/>
                            <span>Online</span>
                        </>
                    )}
                    {item.locationType === "onsite" && (
                        <>
                            <MapPin/>
                            <span>{ADDRESS_SHORT}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-2 text-sm text-brand-700">
                    <NotebookText/>
                    {item.note && (
                        <NoteDialog note={item.note}>
                            <span className="text-sm font-semibold hover:text-taupe-800 underline">
                                Zobraziť poznámky
                            </span>
                        </NoteDialog>
                    )}
                    {!item.note && <span>Bez poznámok</span>}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-brand-700">
                {item.locationType === "online" && (
                    <Link href={item.meetLink ?? "#"}>
                        <Button className="p-2 px-4 bg-brand-500 text-sm rounded-2xl flex gap-2 w-full sm:w-auto">
                            <Play/>
                            <span>Pripojiť sa</span>
                        </Button>
                    </Link>
                )}
                <ClientPaymentInfo vs={item.variableSymbol} centPrice={item.price || 0} note={item.bookingType?.name || ""}>
                    <Button className="p-2 px-4 bg-white border border-gray-500 text-brand-400 text-sm rounded-2xl flex gap-2 w-full sm:w-auto">
                        <span>Platba</span>
                    </Button>
                </ClientPaymentInfo>
                {(item.start.getTime() - Date.now() > 2 * 24 * 60 * 60 * 1000) && (
                    <ClientCancelBookingDialog item={item}>
                        <Button className="p-2 px-4 bg-white border border-gray-500 text-black text-sm rounded-2xl flex gap-2 w-full sm:w-auto">
                            <span>Zrušiť</span>
                        </Button>
                    </ClientCancelBookingDialog>
                )}
            </div>
        </section>
            <Image
                className="aspect-4/3 object-cover hidden md:block"
                src={bookingTypeImageSrc[("bt-psychoterapia") as keyof typeof bookingTypeImageSrc]}
                alt=""
                width={220}
                height={155}
            />
    </article>
)