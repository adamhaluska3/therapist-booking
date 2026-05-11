export type IcsFeedEvent = {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
};

export function generateIcsFeed(events: IcsFeedEvent[]): string {
  const now = toIcsDate(new Date());
  const vevents = events.flatMap(
    (e) =>
      [
        "BEGIN:VEVENT",
        `UID:${e.uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${toIcsDate(e.start)}`,
        `DTEND:${toIcsDate(e.end)}`,
        `SUMMARY:${e.summary}`,
        e.description ? `DESCRIPTION:${e.description}` : null,
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].filter(Boolean) as string[],
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Therapist Booking//SK",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Terapeutické sedenia",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsDate(date: Date) {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}00`
  );
}

export function generateIcs({
  uid,
  start,
  end,
  summary,
  description,
  organizerEmail,
  attendeeEmail,
  meetLink,
}: {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  organizerEmail: string;
  attendeeEmail?: string;
  meetLink?: string;
}): string {
  const now = toIcsDate(new Date());
  const fullDescription = meetLink
    ? `${description}\\nOdkaz na Google Meet: ${meetLink}`
    : description;
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
    `DESCRIPTION:${fullDescription}`,
    `ORGANIZER:mailto:${organizerEmail}`,
    attendeeEmail ? `ATTENDEE;RSVP=TRUE:mailto:${attendeeEmail}` : null,
    meetLink ? `URL:${meetLink}` : null,
    meetLink ? `X-GOOGLE-CONFERENCE:${meetLink}` : null,
    meetLink ? `CONFERENCE;FEATURE=VIDEO;LABEL=Google Meet;VALUE=URI:${meetLink}` : null,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.filter(Boolean).join("\r\n");
}
