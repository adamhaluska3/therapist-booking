import { Booking, booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { Calendar, Clock5, MapPin, NotebookText, Play, CreditCard, X, Check } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
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
    <article className="flex w-full bg-white rounded-2xl overflow-hidden">
        <section className="flex flex-col gap-5 flex-1 p-8">
            <div className="flex flex-1 flex-col gap-5">
                <div className="flex justify-start gap-2 items-center">
                    <Badge className="bg-brand-100 text-brand-700 border-brand-200 px-3 py-1 h-auto text-xs font-medium"><Check size={11} />Potvrdené</Badge>
                    <span className="text-sm text-gray-400 uppercase">Najbližšie stretnutie</span>
                </div>
                <h1 className="text-2xl">{item.bookingType?.name}</h1>
                <Image
                    className="aspect-4/3 object-cover md:hidden rounded-xl"
                    src={bookingTypeImageSrc[("bt-psychoterapia") as keyof typeof bookingTypeImageSrc]}
                    alt=""
                    width={280}
                    height={170}
                />
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="flex gap-2 text-sm text-brand-700 items-center">
                        <Calendar size={16} className="shrink-0" />
                        <span>{item.start.toLocaleDateString("sk-SK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                            .split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1))
                            .join(" ")}</span>
                    </div>
                    <div className="flex gap-2 text-sm text-brand-700 items-center">
                        <Clock5 size={16} className="shrink-0" />
                        <span>
                            {item.start.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })} - {item.end.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                    <div className="flex gap-2 text-sm text-brand-700 items-center">
                        {item.locationType === "online" && (
                            <>
                                <Play size={16} className="shrink-0" />
                                <span>Online</span>
                            </>
                        )}
                        {item.locationType === "onsite" && (
                            <>
                                <MapPin size={16} className="shrink-0" />
                                <span>{ADDRESS_SHORT}</span>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2 text-sm text-brand-700 items-center">
                        <NotebookText size={16} className="shrink-0" />
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
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-brand-700 w-full">
                {item.locationType === "online" && (
                    <Link href={item.meetLink ?? "#"}>
                        <Button className="p-2 px-4 bg-brand-500 text-sm rounded-2xl flex gap-2 w-full sm:w-auto">
                            <Play/>
                            <span>Pripojiť sa</span>
                        </Button>
                    </Link>
                )}
                <ClientPaymentInfo vs={item.variableSymbol} centPrice={item.price || 0} note={item.bookingType?.name || ""}>
                    <Button className="p-2 px-4 bg-brand-500 text-white text-sm rounded-2xl flex gap-2 w-full sm:w-auto">
                        <CreditCard size={16} />
                        <span>Platba</span>
                    </Button>
                </ClientPaymentInfo>
                {(item.start.getTime() - Date.now() > 2 * 24 * 60 * 60 * 1000) && (
                    <ClientCancelBookingDialog item={item}>
                        <Button className="p-2 px-4 bg-white border border-gray-500 text-black text-sm rounded-2xl flex gap-2 w-full sm:w-auto">
                            <X size={16} />
                            <span>Zrušiť</span>
                        </Button>
                    </ClientCancelBookingDialog>
                )}
            </div>
        </section>
        <div className="relative hidden md:block w-72 shrink-0 my-4 ml-4 mr-8 rounded-xl overflow-hidden">
            <Image
                className="absolute inset-0 h-full w-full object-cover"
                src={bookingTypeImageSrc[("bt-psychoterapia") as keyof typeof bookingTypeImageSrc]}
                alt=""
                fill
            />
        </div>
    </article>
)