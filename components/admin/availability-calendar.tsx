"use client"

import { type ComponentType, useState, useCallback, useMemo, useTransition, useRef, useEffect } from "react"
import { Calendar, dateFnsLocalizer, Views, type CalendarProps } from "react-big-calendar"
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop"
import { format, parse, startOfWeek, getDay, isToday, addDays } from "date-fns"
import { sk } from "date-fns/locale"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import "./calendar.css"

import { CalendarEventCard, BOOKING_TYPE_COLORS, DEFAULT_THERAPY_COLOR, type TherapistEvent } from "./calendar-event-card"
import { CalendarToolbar, type CalendarView } from "./calendar-toolbar"
import { SlotSettingsDialog } from "./slot-settings-dialog"
import { BookingDialog } from "./booking-dialog"
import { NewEventDialog } from "./new-event-dialog"

import {
  buildDisplayEvents,
  applySlotMove,
  applyBookingMove,
  mergeAdjacentSlots,
  bookingOverlapsOthers,
} from "@/lib/calendar-utils"
import {
  saveAvailabilitySlots,
  fetchCalendarData,
  type SlotUpsert,
  createAdminBooking,
  updateBookingFromDialog,
  deleteBookingWithNotification,
} from "@/server/actions/index"
import type { AvailabilitySlot, Booking, BookingType, BookingWithUser } from "@/db/schema"
import type { UserOption } from "@/server/queries/users"


const locales = { sk }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

const DnDCalendar = withDragAndDrop<TherapistEvent>(Calendar as ComponentType<CalendarProps<TherapistEvent>>)

function getEventStyle(event: TherapistEvent): React.CSSProperties {
  const base: React.CSSProperties = { borderRadius: "10px", border: "none", padding: 0, overflow: "hidden" }
  switch (event.type) {
    case "therapy": {
      const color = event.bookingTypeId
        ? (BOOKING_TYPE_COLORS[event.bookingTypeId]?.bg ?? DEFAULT_THERAPY_COLOR)
        : DEFAULT_THERAPY_COLOR
      return { ...base, backgroundColor: color }
    }
    case "empty": return { ...base, backgroundColor: "#faf8f5", border: "2px dashed #92baa2" }
    case "blocked": return { ...base, backgroundColor: "#e8e3d9" }
    default: return base
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
  initialBookings: BookingWithUser[]
  initialDate?: Date
  initialUsers: UserOption[]
  bookingTypes: BookingType[]
}

export function AvailabilityCalendar({
  initialSlots,
  initialBookings,
  initialDate,
  initialUsers,
  bookingTypes,
}: AvailabilityCalendarProps) {
  const [mounted, setMounted] = useState(false)
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots)
  const [bookings, setBookings] = useState<BookingWithUser[]>(initialBookings)
  const [users, setUsers] = useState<UserOption[]>(initialUsers)

  const persistedSlotIds = useRef(new Set(initialSlots.map((s) => s.id)))
  const persistedBookingIds = useRef(new Set(initialBookings.map((b) => b.id)))

  const [date, setDate] = useState(() => initialDate ?? new Date())
  const [view, setView] = useState<CalendarView>("week")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mobile = window.innerWidth < 768
    setMounted(true)
    setIsMobile(mobile)
    if (mobile) setView("day")
  }, [])

  const [slotDialogId, setSlotDialogId] = useState<string | null>(null)
  const [bookingDialog, setBookingDialog] = useState<{ booking?: BookingWithUser; defaultStart: Date; defaultEnd: Date } | null>(null)
  const [newEventOpen, setNewEventOpen] = useState(false)

  const openSlot = slotDialogId ? slots.find((s) => s.id === slotDialogId) : undefined

  const displayEvents = useMemo(
    () => buildDisplayEvents(slots, bookings),
    [slots, bookings],
  )

  const [, startTransition] = useTransition()

  function persistSlots(toUpsert: SlotUpsert[], toDelete: string[]) {
    if (toUpsert.length === 0 && toDelete.length === 0) return
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

  function persistBooking(b: BookingWithUser, isNew: boolean, previousStart?: Date) {
    persistedBookingIds.current.add(b.id)
    startTransition(async () => {
      try {
        if (isNew) {
          await createAdminBooking({
            id: b.id,
            start: b.start,
            end: b.end,
            status: b.status,
            userId: b.userId ?? null,
            bookingTypeId: b.bookingTypeId ?? null,
            price: b.price ?? null,
            note: b.note ?? null,
            locationType: b.locationType,
          })
        } else {
          await updateBookingFromDialog(
            b.id,
            { start: b.start, end: b.end, userId: b.userId ?? null, bookingTypeId: b.bookingTypeId ?? null, note: b.note ?? null, locationType: b.locationType },
            previousStart ?? b.start,
          )
        }
      } catch {
        toast.error("Nepodarilo sa uložiť rezerváciu")
      }
    })
  }

  function deletePersistedBooking(id: string) {
    persistedBookingIds.current.delete(id)
    startTransition(async () => {
      try {
        await deleteBookingWithNotification(id)
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
    updatedBooking: BookingWithUser,
    previousBookings: BookingWithUser[],
  ): boolean {
    if (bookingOverlapsOthers(previousBookings, updatedBooking)) {
      toast.error("Rezervácia sa prekrýva s inou rezerváciou")
      return false
    }

    const previous = previousBookings.find((b) => b.id === updatedBooking.id)
    const isNew = !previous
    setBookings(
      isNew
        ? [...previousBookings, updatedBooking]
        : previousBookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)),
    )
    persistBooking(updatedBooking, isNew, previous?.start)

    return true
  }

  const handleEventInteraction = useCallback(
    ({ event, start, end }: EventInteractionArgs<TherapistEvent>) => {
      if (event.source === "slot" && event.slotId && event.isDraggable) {
        applyAndPersistSlotChange(
          applySlotMove(slots, event.slotId, start as Date, end as Date),
          event.slotId,
        )
      } else if (event.source === "booking" && event.bookingId) {
        const moved = applyBookingMove(bookings, event.bookingId, start as Date, end as Date)
        const target = moved.find((b) => b.id === event.bookingId)!
        applyAndPersistBookingChange(target, bookings)
      }
    },
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
  }, [slots])

  const handleSlotDelete = useCallback((slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
    if (persistedSlotIds.current.has(slotId)) {
      persistedSlotIds.current.delete(slotId)
      persistSlots([], [slotId])
    }
    setSlotDialogId(null)
  }, [])

  const handleSlotCreateBooking = useCallback((defaultStart: Date, defaultEnd: Date) => {
    setSlotDialogId(null)
    setBookingDialog({ defaultStart, defaultEnd })
  }, [])

  const handleBookingSave = useCallback((saved: Booking) => {
    const userInfo = users.find((u) => u.id === saved.userId) ?? null
    const savedWithUser: BookingWithUser = {
      ...saved,
      user: userInfo
        ? { id: userInfo.id, name: userInfo.name, nickname: userInfo.nickname, email: userInfo.email }
        : null,
    }
    const ok = applyAndPersistBookingChange(savedWithUser, bookings)
    if (ok) setBookingDialog(null)
  }, [bookings, users])

  const handleBookingDelete = useCallback((bookingId: string) => {
    const deletedBooking = bookings.find((b) => b.id === bookingId)
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    if (persistedBookingIds.current.has(bookingId)) {
      deletePersistedBooking(bookingId)
    }
    if (deletedBooking) {
      const bStart = deletedBooking.start.getTime()
      const bEnd = deletedBooking.end.getTime()
      const hasAdjacent = slots.some(
        (s) => s.end.getTime() === bStart || s.start.getTime() === bEnd,
      )
      if (hasAdjacent) {
        const restoreId = crypto.randomUUID()
        applyAndPersistSlotChange(
          [...slots, { id: restoreId, start: deletedBooking.start, end: deletedBooking.end, label: null }],
          restoreId,
        )
      }
    }
    setBookingDialog(null)
  }, [bookings, slots])

  const handleUserCreated = useCallback((newUser: UserOption) => {
    setUsers((prev) => {
      if (prev.some((u) => u.id === newUser.id)) return prev
      return [...prev, newUser].sort((a, b) => a.name.localeCompare(b.name))
    })
  }, [])

  const handleNewEventSlot = useCallback((start: Date, end: Date) => {
    const id = crypto.randomUUID()
    applyAndPersistSlotChange([...slots, { id, start, end, label: null }], id)
    setNewEventOpen(false)
  }, [slots])

  const handleNewEventBooking = useCallback((start: Date, end: Date) => {
    setNewEventOpen(false)
    setBookingDialog({ defaultStart: start, defaultEnd: end })
  }, [])

  const handleNavigate = useCallback(
    async (action: "PREV" | "NEXT" | "TODAY") => {
      const base = action === "TODAY" ? new Date() : new Date(date)
      if (action !== "TODAY") {
        const delta = view === "day" ? 1 : 7
        base.setDate(base.getDate() + (action === "NEXT" ? delta : -delta))
      }

      const anchor = view === "week" ? startOfWeek(base, { weekStartsOn: 1 }) : base
      // week: Mon 00:00 → Sun+1 00:00 (7 days); day: day 00:00 → day+1 00:00
      const rangeFrom = view === "week" ? anchor : anchor
      const rangeTo = view === "week" ? addDays(anchor, 7) : addDays(anchor, 1)

      setDate(anchor)

      try {
        const { slots: newSlots, bookings: newBookings } = await fetchCalendarData(rangeFrom, rangeTo)
        setSlots(newSlots)
        setBookings(newBookings)
        persistedSlotIds.current = new Set(newSlots.map((s: AvailabilitySlot) => s.id))
        persistedBookingIds.current = new Set(newBookings.map((b: BookingWithUser) => b.id))
      } catch {
        toast.error("Nepodarilo sa načítať dáta")
      }
    },
    [date, view],
  )

  const interactiveAccessor = useCallback(
    (event: TherapistEvent) => !isMobile && (event.source === "booking" || event.isDraggable === true),
    [isMobile],
  )

  const components = useMemo(
    () => ({
      toolbar: () => null,
      week: { header: DayColumnHeader },
      event: ({ event }: { event: TherapistEvent }) => (
        <CalendarEventCard event={event} compact={isMobile && view === "week"} />
      ),
    }),
    [isMobile, view],
  )

  const eventPropGetter = useCallback(
    (event: TherapistEvent) => ({ style: getEventStyle(event) }),
    [],
  )

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="h-10 mb-4 rounded-lg bg-surface-100" />
        <div style={{ height: "calc(100vh - 160px)" }} className="rounded-xl bg-surface-50 border border-surface-200" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <CalendarToolbar date={date} onNavigate={handleNavigate} view={view} onViewChange={(v) => setView(v as CalendarView)} onNewEvent={() => setNewEventOpen(true)} />

      <div style={{ height: "calc(100vh - 160px)" }}>
        <DnDCalendar
          localizer={localizer}
          events={displayEvents}
          date={date}
          onNavigate={setDate}
          view={view === "day" ? Views.DAY : Views.WEEK}
          onView={() => {}}
          selectable={!isMobile}
          resizable
          onEventDrop={handleEventInteraction}
          onEventResize={handleEventInteraction}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={components}
          eventPropGetter={eventPropGetter}
          draggableAccessor={interactiveAccessor}
          resizableAccessor={interactiveAccessor}
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


      {isMobile && (
        <button
          onClick={() => setNewEventOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform sm:hidden"
          aria-label="Nová udalosť"
        >
          <Plus className="h-7 w-7" />
        </button>
      )}

      {newEventOpen && (
        <NewEventDialog
          open
          defaultDate={date}
          onCreateSlot={handleNewEventSlot}
          onCreateBooking={handleNewEventBooking}
          onClose={() => setNewEventOpen(false)}
        />
      )}

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
          users={users}
          bookingTypes={bookingTypes}
          onSave={handleBookingSave}
          onDelete={bookingDialog.booking ? () => handleBookingDelete(bookingDialog.booking!.id) : undefined}
          onClose={() => setBookingDialog(null)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  )
}
