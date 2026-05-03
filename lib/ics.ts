function pad(n: number) {
  return String(n).padStart(2, "0")
}

function toIcsDate(date: Date) {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}00`
  )
}

export function generateIcs({
  uid,
  start,
  end,
  summary,
  description,
  organizerEmail,
  attendeeEmail,
}: {
  uid: string
  start: Date
  end: Date
  summary: string
  description: string
  organizerEmail: string
  attendeeEmail?: string
}): string {
  const now = toIcsDate(new Date())
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Therapist Booking//SK",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `ORGANIZER:mailto:${organizerEmail}`,
    attendeeEmail ? `ATTENDEE;RSVP=TRUE:mailto:${attendeeEmail}` : null,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return lines.filter(Boolean).join("\r\n")
}
