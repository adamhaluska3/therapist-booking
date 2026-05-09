import { booking, BookingType } from "@/db/schema"
import { InferSelectModel } from "drizzle-orm"
import { Button } from "../ui/button"
import { ClientPaymentInfo } from "./client-payment-info"
import { Calendar, Clock5 } from "lucide-react"
import { ClientCancelBookingDialog } from "./client-cancel-booking-dialog"

const bookingTypeImageSrc = {
  "bt-psychoterapia":   "/images/booking-types/psycho-therapy.png",
}

export type ClosestPendingUpcommingBookingProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
}

export const ClosestPendingUpcommingBooking = ({item}: ClosestPendingUpcommingBookingProps) => (
    <article className="flex flex-col bg-taupe-300 rounded-2xl overflow-hidden p-10">
        <section className="flex flex-col gap-5">
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
                <div className="flex gap-2 text-sm text-taupe-700">
                    Online / On-site = doplnime v stredu
                </div>
                <ClientPaymentInfo vs={item.variableSymbol} centPrice={item.price || 0} note={item.bookingType?.name || ""}>
                    <div className="flex justify-center hover:cursor-pointer">
                        <span className="bg-white p-5 rounded-2xl text-brand-400">Zobraziť platobné údaje</span>
                    </div>
                </ClientPaymentInfo>
            </div>
            <div className="flex gap-2 text-sm text-brand-700">
                {(item.start.getTime() - Date.now() > 2 * 24 * 60 * 60 * 1000) && (
                    <ClientCancelBookingDialog item={item}>
                        <Button className="p-5 bg-white border border-gray-500 text-black text-sm rounded-2xl flex gap-2">
                            <span>Zrušiť</span>
                        </Button>
                    </ClientCancelBookingDialog>
                )}
                    
            </div>
        </section>

    </article>
)