"use client"

import { useState, useCallback, useMemo } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop"
import { format, parse, startOfWeek, getDay, isToday, isSameWeek } from "date-fns"
import { sk } from "date-fns/locale"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import "./calendar.css"

import { CalendarEventCard, type TherapistEvent } from "./calendar-event-card"
import { CalendarToolbar } from "./calendar-toolbar"
import { CalendarHints } from "./calendar-hints"
import { SaveChangesFab } from "./save-changes-fab"

// ── Localizer ─────────────────────────────────────────────────────────────────

const locales = { sk }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

// ── DnD-enhanced Calendar ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DnDCalendar = withDragAndDrop<TherapistEvent>(Calendar as any)

// ── Mock data ────────────────────────────────────────────────────────────────

function buildMockEvents(): TherapistEvent[] {
  const today = new Date()
  const monday = startOfWeek(today, { weekStartsOn: 1 })

  const at = (dayOffset: number, h: number, m = 0) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + dayOffset)
    d.setHours(h, m, 0, 0)
    return d
  }

  return [
    {
      id: "1",
      title: "Anna Kovacova",
      start: at(0, 9),
      end: at(0, 10, 30),
      type: "individual",
      clientName: "Anna Kovacova",
    },
    {
      id: "2",
      title: "Vytvoriť slot",
      start: at(1, 10),
      end: at(1, 11),
      type: "empty",
    },
    {
      id: "3",
      title: "Mindfulness Workshop",
      start: at(2, 11),
      end: at(2, 13),
      type: "group",
      participants: [
        { name: "Anna N.", initials: "AN" },
        { name: "Peter M.", initials: "PM" },
        { name: "Jana K.", initials: "JK" },
        { name: "Miro S.", initials: "MS" },
      ],
    },
    {
      id: "4",
      title: "Peter Mrkva",
      start: at(3, 14),
      end: at(3, 15),
      type: "preconsultation",
      clientName: "Peter Mrkva",
      subtitle: "Preukonsultácia",
    },
    {
      id: "5",
      title: "Pauza na kávu",
      start: at(4, 9),
      end: at(4, 10),
      type: "break",
    },
    {
      id: "6",
      title: "Blokovaný čas",
      start: at(4, 12),
      end: at(4, 13, 30),
      type: "blocked",
    },
  ]
}

// ── Custom day header ─────────────────────────────────────────────────────────

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

// ── Event style getter ────────────────────────────────────────────────────────

function getEventStyle(event: TherapistEvent): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: "10px",
    border: "none",
    padding: 0,
    overflow: "hidden",
  }

  switch (event.type) {
    case "individual":
      return { ...base, backgroundColor: "#427a5c" }
    case "preconsultation":
      return { ...base, backgroundColor: "#92baa2" }
    case "group":
      return { ...base, backgroundColor: "#62977a" }
    case "break":
      return { ...base, backgroundColor: "#92baa2" }
    case "empty":
      return {
        ...base,
        backgroundColor: "#faf8f5",
        border: "2px dashed #92baa2",
      }
    case "blocked":
      return { ...base, backgroundColor: "#e8e3d9" }
    default:
      return base
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function AvailabilityCalendar() {
  const [events, setEvents] = useState<TherapistEvent[]>(buildMockEvents)
  const [date, setDate] = useState(() => new Date())
  const [view, setView] = useState<"week" | "month">("week")
  const [hasChanges, setHasChanges] = useState(false)

  const handleEventDrop = useCallback(
    ({ event, start, end }: EventInteractionArgs<TherapistEvent>) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, start: start as Date, end: end as Date } : e
        )
      )
      setHasChanges(true)
    },
    []
  )

  const handleEventResize = useCallback(
    ({ event, start, end }: EventInteractionArgs<TherapistEvent>) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, start: start as Date, end: end as Date } : e
        )
      )
      setHasChanges(true)
    },
    []
  )

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const newEvent: TherapistEvent = {
        id: String(Date.now()),
        title: "Vytvoriť slot",
        start,
        end,
        type: "empty",
      }
      setEvents((prev) => [...prev, newEvent])
      setHasChanges(true)
    },
    []
  )

  const handleDelete = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(() => {
    setHasChanges(false)
  }, [])

  const handleNavigate = useCallback((action: "PREV" | "NEXT" | "TODAY") => {
    setDate((prev) => {
      const next = new Date(prev)
      if (action === "TODAY") return new Date()
      const delta = view === "week" ? 7 : 30
      next.setDate(prev.getDate() + (action === "NEXT" ? delta : -delta))
      return next
    })
  }, [view])

  const components = useMemo(
    () => ({
      toolbar: () => null, // rendered separately above
      week: {
        header: DayColumnHeader,
      },
      event: ({ event }: { event: TherapistEvent }) => (
        <CalendarEventCard event={event} onDelete={handleDelete} />
      ),
    }),
    [handleDelete]
  )

  const eventPropGetter = useCallback(
    (event: TherapistEvent) => ({ style: getEventStyle(event) }),
    []
  )

  return (
    <div className="min-h-screen bg-surface-50 p-8">
      <div className="max-w-6xl mx-auto">
        <CalendarToolbar
          date={date}
          onNavigate={handleNavigate}
          view={view}
          onViewChange={setView}
        />

        <div style={{ height: 640 }}>
          <DnDCalendar
            localizer={localizer}
            events={events}
            date={date}
            onNavigate={setDate}
            view={view === "week" ? Views.WEEK : Views.MONTH}
            onView={() => {}}
            selectable
            resizable
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onSelectSlot={handleSelectSlot}
            components={components}
            eventPropGetter={eventPropGetter}
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

        <CalendarHints />
      </div>

      <SaveChangesFab onClick={handleSave} hasChanges={hasChanges} />
    </div>
  )
}
