import { booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { Button } from "../ui/button"
import { ClientPaymentInfo } from "./client-payment-info"
import { Calendar, Clock5, MapPin, NotebookText, Play } from "lucide-react"
import { ClientCancelBookingDialog } from "./client-cancel-booking-dialog"
import { ADDRESS_SHORT } from "../../app/(client)/client/_data/address"
import { NoteDialog } from "./note-dialog"

export type ClosestPendingUpcommingBookingProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
}

export const ClosestPendingUpcommingBooking = ({item}: ClosestPendingUpcommingBookingProps) => (
    <article className="flex flex-col bg-taupe-300 rounded-2xl overflow-hidden p-10 h-full">
        <section className="flex flex-col gap-5 w-full flex-1">
            <div className="flex-1 flex flex-col gap-5">
                <div className="flex justify-start gap-2 items-center">
                    <span className="p-2 bg-taupe-400 text-taupe-700 rounded-2xl font-bold uppercase text-xs">Čaká na potvrdenie</span>
                </div>
                <h1 className="text-xl">{item.bookingType?.name}</h1>
                <div className="flex gap-2 text-sm text-taupe-700">
                    <Calendar />
                    <span>{item.start.toLocaleDateString("sk-SK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                        .split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(" ")}</span>
                </div>
                <div className="flex gap-2 text-sm text-taupe-700">
                    <Clock5/>
                    <span>
                        {item.start.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })} - {item.end.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
                <div className="flex gap-2 text-sm text-taupe-700 items-center">
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
                <div className="flex gap-2 text-sm text-taupe-700">
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
            <div className="flex gap-2 text-sm text-brand-700 flex-col sm:flex-row w-full">
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

    </article>
)