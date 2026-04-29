"use client"

import { useState, useCallback, useMemo, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop"
import { format, parse, startOfWeek, getDay, isToday } from "date-fns"
import { sk } from "date-fns/locale"
import { toast } from "sonner"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import "./calendar.css"

import { CalendarEventCard, type TherapistEvent } from "./calendar-event-card"
import { CalendarToolbar } from "./calendar-toolbar"
import { SlotSettingsDialog } from "./slot-settings-dialog"
import { BookingDialog } from "./booking-dialog"

import {
  buildDisplayEvents,
  applySlotMove,
  applyBookingMove,
  mergeAdjacentSlots,
  bookingOverlapsOthers,
  trimSlotsAroundBooking,
} from "@/lib/calendar-utils"
import {
  saveAvailabilitySlots,
  saveBookings,
  type SlotUpsert,
  type BookingUpsert,
} from "@/server/actions/index"
import type { AvailabilitySlot, Booking } from "@/db/schema"


const locales = { sk }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DnDCalendar = withDragAndDrop<TherapistEvent>(Calendar as any)

function getEventStyle(event: TherapistEvent): React.CSSProperties {
  const base: React.CSSProperties = { borderRadius: "10px", border: "none", padding: 0, overflow: "hidden" }
  switch (event.type) {
    case "therapy": return { ...base, backgroundColor: "#427a5c" }
    case "empty":   return { ...base, backgroundColor: "#faf8f5", border: "2px dashed #92baa2" }
    case "blocked": return { ...base, backgroundColor: "#e8e3d9" }
    default:        return base
  }
}


function DayColumnHeader({ date }: { date: Date; label: string }) {
  const today = isToday(date)
  const abbr = format(date, "EEE", { locale: sk }).slice(0, 2).toUpperCase()
  const num = format(date, "d")

  return (
    <div className="py-2 text-center">
      <div className={`text-[10px] uppercase tracking-widest font-medium ${today ? "text-brand-500" : "text-gray-400"}`}>
        {abbr}
      </div>
      <div className={`text-base leading-tight ${today ? "text-brand-600 font-bold" : "text-gray-700 font-light"}`}>
        {num}
      </div>
    </div>
  )
}

function resolveSlotSave(
  mergedSlots: AvailabilitySlot[],
  mergeDeleted: string[],
  mergeDirty: string[],
  explicitUpsert: string,
  persistedIds: Set<string>,
): { toUpsert: SlotUpsert[]; toDelete: string[] } {
  const upsertIds = new Set([explicitUpsert, ...mergeDirty])
  const toUpsert = mergedSlots.filter((s) => upsertIds.has(s.id))
  const toDelete = mergeDeleted.filter((id) => persistedIds.has(id))
  return { toUpsert, toDelete }
}

interface AvailabilityCalendarProps {
  initialSlots: AvailabilitySlot[]
  initialBookings: Booking[]
  initialDate?: Date
}

export function AvailabilityCalendar({
  initialSlots,
  initialBookings,
  initialDate,
}: AvailabilityCalendarProps) {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [slots,    setSlots]    = useState<AvailabilitySlot[]>(initialSlots)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)

  const persistedSlotIds    = useRef(new Set(initialSlots.map((s) => s.id)))
  const persistedBookingIds = useRef(new Set(initialBookings.map((b) => b.id)))

  const [date, setDate] = useState(() => initialDate ?? new Date())
  const [view, setView] = useState<"week" | "month">("week")

  const [slotDialogId,  setSlotDialogId]  = useState<string | null>(null)
  const [bookingDialog, setBookingDialog] = useState<{ booking?: Booking; defaultStart: Date; defaultEnd: Date } | null>(null)

  const openSlot = slotDialogId ? slots.find((s) => s.id === slotDialogId) : undefined

  const displayEvents = useMemo(
    () => buildDisplayEvents(slots, bookings),
    [slots, bookings],
  )

  const [, startTransition] = useTransition()

  function persistSlots(toUpsert: SlotUpsert[], toDelete: string[]) {
    if (toUpsert.length === 0 && toDelete.length === 0) return
    // Update persisted set optimistically
    toUpsert.forEach((s) => persistedSlotIds.current.add(s.id))
    toDelete.forEach((id) => persistedSlotIds.current.delete(id))
    startTransition(async () => {
      try {
        await saveAvailabilitySlots(toUpsert, toDelete)
      } catch {
        toast.error("Nepodarilo sa uložiť dostupnosť")
      }
    })
  }

  function persistBooking(b: BookingUpsert) {
    persistedBookingIds.current.add(b.id)
    startTransition(async () => {
      try {
        await saveBookings([b], [])
      } catch {
        toast.error("Nepodarilo sa uložiť rezerváciu")
      }
    })
  }

  function deletePersistedBooking(id: string) {
    persistedBookingIds.current.delete(id)
    startTransition(async () => {
      try {
        await saveBookings([], [id])
      } catch {
        toast.error("Nepodarilo sa vymazať rezerváciu")
      }
    })
  }

  function applyAndPersistSlotChange(updatedSlots: AvailabilitySlot[], changedId: string) {
    const { merged, deleted, dirty } = mergeAdjacentSlots(updatedSlots)
    setSlots(merged)
    const { toUpsert, toDelete } = resolveSlotSave(
      merged, deleted, dirty, changedId, persistedSlotIds.current,
    )
    persistSlots(toUpsert, toDelete)
  }

  function applyAndPersistBookingChange(
    updatedBooking: Booking,
    previousBookings: Booking[],
    previousSlots: AvailabilitySlot[],
  ): boolean {
    if (bookingOverlapsOthers(previousBookings, updatedBooking)) {
      toast.error("Rezervácia sa prekrýva s inou rezerváciou")
      return false
    }

    const isNew = !previousBookings.find((b) => b.id === updatedBooking.id)
    setBookings(
      isNew
        ? [...previousBookings, updatedBooking]
        : previousBookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)),
    )
    persistBooking(updatedBooking)

    const { result, upserted, deleted } = trimSlotsAroundBooking(previousSlots, updatedBooking)
    if (upserted.length > 0 || deleted.length > 0) {
      setSlots(result)
      const toDelete = deleted.filter((id) => persistedSlotIds.current.has(id))
      upserted.forEach((s) => persistedSlotIds.current.add(s.id))
      toDelete.forEach((id) => persistedSlotIds.current.delete(id))
      persistSlots(upserted, toDelete)
    }

    return true
  }

  const handleEventDrop = useCallback(
    ({ event, start, end }: EventInteractionArgs<TherapistEvent>) => {
      if (event.source === "slot" && event.slotId && event.isDraggable) {
        applyAndPersistSlotChange(
          applySlotMove(slots, event.slotId, start as Date, end as Date),
          event.slotId,
        )
      } else if (event.source === "booking" && event.bookingId) {
        const moved = applyBookingMove(bookings, event.bookingId, start as Date, end as Date)
        const target = moved.find((b) => b.id === event.bookingId)!
        applyAndPersistBookingChange(target, bookings, slots)
      }
    },
    [slots, bookings],
  )

  const handleEventResize = useCallback(
    ({ event, start, end }: EventInteractionArgs<TherapistEvent>) => {
      if (event.source === "slot" && event.slotId && event.isDraggable) {
        applyAndPersistSlotChange(
          applySlotMove(slots, event.slotId, start as Date, end as Date),
          event.slotId,
        )
      } else if (event.source === "booking" && event.bookingId) {
        const moved = applyBookingMove(bookings, event.bookingId, start as Date, end as Date)
        const target = moved.find((b) => b.id === event.bookingId)!
        applyAndPersistBookingChange(target, bookings, slots)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, bookings],
  )

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const id = crypto.randomUUID()
      applyAndPersistSlotChange(
        [...slots, { id, start, end, label: null }],
        id,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots],
  )

  const handleSelectEvent = useCallback((event: TherapistEvent) => {
    if (event.source === "slot" && event.slotId) {
      setSlotDialogId(event.slotId)
    } else if (event.source === "booking" && event.bookingId) {
      const booking = bookings.find((b) => b.id === event.bookingId)
      if (booking) setBookingDialog({ booking, defaultStart: booking.start, defaultEnd: booking.end })
    }
  }, [bookings])

  const handleSlotSave = useCallback((updated: AvailabilitySlot) => {
    applyAndPersistSlotChange(
      slots.map((s) => (s.id === updated.id ? updated : s)),
      updated.id,
    )
    setSlotDialogId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots])

  const handleSlotDelete = useCallback((slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
    if (persistedSlotIds.current.has(slotId)) {
      persistedSlotIds.current.delete(slotId)
      persistSlots([], [slotId])
    }
    setSlotDialogId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSlotCreateBooking = useCallback((defaultStart: Date, defaultEnd: Date) => {
    setSlotDialogId(null)
    setBookingDialog({ defaultStart, defaultEnd })
  }, [])

  const handleBookingSave = useCallback((saved: Booking) => {
    const ok = applyAndPersistBookingChange(saved, bookings, slots)
    if (ok) setBookingDialog(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, slots])

  const handleBookingDelete = useCallback((bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    if (persistedBookingIds.current.has(bookingId)) {
      deletePersistedBooking(bookingId)
    }
    setBookingDialog(null)
  }, [])

  const handleNavigate = useCallback(
    (action: "PREV" | "NEXT" | "TODAY") => {
      const base = action === "TODAY" ? new Date() : new Date(date)
      if (action !== "TODAY") {
        const delta = view === "week" ? 7 : 30
        base.setDate(base.getDate() + (action === "NEXT" ? delta : -delta))
      }
      const monday = startOfWeek(base, { weekStartsOn: 1 })
      setDate(monday)
      router.push(`/admin/calendar?from=${format(monday, "yyyy-MM-dd")}`)
    },
    [date, view, router],
  )

  const draggableAccessor = useCallback(
    (event: TherapistEvent) => view === "week" && (event.source === "booking" || event.isDraggable === true),
    [view],
  )

  const resizableAccessor = useCallback(
    (event: TherapistEvent) => view === "week" && (event.source === "booking" || event.isDraggable === true),
    [view],
  )

  const components = useMemo(
    () => ({
      toolbar: () => null,
      week: { header: DayColumnHeader },
      event: ({ event }: { event: TherapistEvent }) => <CalendarEventCard event={event} />,
    }),
    [],
  )

  const eventPropGetter = useCallback(
    (event: TherapistEvent) => ({ style: getEventStyle(event) }),
    [],
  )

  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-surface-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 mb-4 rounded-lg bg-surface-100" />
          <div style={{ height: 640 }} className="rounded-xl bg-surface-50 border border-surface-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-surface-100 p-8">
      <div className="max-w-6xl mx-auto">
        <CalendarToolbar date={date} onNavigate={handleNavigate} view={view} onViewChange={setView} />

        <div style={{ height: 640 }}>
          <DnDCalendar
            localizer={localizer}
            events={displayEvents}
            date={date}
            onNavigate={setDate}
            view={view === "week" ? Views.WEEK : Views.MONTH}
            onView={() => {}}
            selectable={view === "week"}
            resizable
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            components={components}
            eventPropGetter={eventPropGetter}
            draggableAccessor={draggableAccessor}
            resizableAccessor={resizableAccessor}
            step={30}
            timeslots={2}
            min={new Date(0, 0, 0, 7, 0)}
            max={new Date(0, 0, 0, 20, 0)}
            formats={{
              timeGutterFormat: (d: Date, culture?: string, loc?: typeof localizer) =>
                loc ? loc.format(d, "HH:mm", culture ?? "") : format(d, "HH:mm"),
            }}
            culture="sk"
          />
        </div>
      </div>

      {openSlot && (
        <SlotSettingsDialog
          open
          slot={openSlot}
          onSave={handleSlotSave}
          onDelete={() => handleSlotDelete(openSlot.id)}
          onCreateBooking={handleSlotCreateBooking}
          onClose={() => setSlotDialogId(null)}
        />
      )}

      {bookingDialog && (
        <BookingDialog
          open
          booking={bookingDialog.booking}
          defaultStart={bookingDialog.defaultStart}
          defaultEnd={bookingDialog.defaultEnd}
          onSave={handleBookingSave}
          onDelete={bookingDialog.booking ? () => handleBookingDelete(bookingDialog.booking!.id) : undefined}
          onClose={() => setBookingDialog(null)}
        />
      )}
    </div>
  )
}
