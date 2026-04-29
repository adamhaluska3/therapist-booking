"use client"

import dynamic from "next/dynamic"
import type { AvailabilitySlot, Booking } from "@/db/schema"

function CalendarSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-surface-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="h-10 mb-4 rounded-lg bg-surface-100 animate-pulse" />
        <div style={{ height: 640 }} className="rounded-xl bg-surface-50 border border-surface-200 animate-pulse" />
      </div>
    </div>
  )
}

const CalendarNoSSR = dynamic(
  () => import("./availability-calendar").then((m) => m.AvailabilityCalendar),
  { ssr: false, loading: CalendarSkeleton },
)

interface Props {
  initialSlots: AvailabilitySlot[]
  initialBookings: Booking[]
  initialDate?: Date
}

export function CalendarClient(props: Props) {
  return <CalendarNoSSR {...props} />
}
