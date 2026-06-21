import { Resend } from "resend";
import { generateIcs } from "@/lib/ics";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  therapistNotificationHtml,
  therapistCancellationHtml,
  clientConfirmationHtml,
  clientCancellationHtml,
  clientRescheduledHtml,
  contactFormHtml,
} from "./templates";

const EMAILS_ENABLED = process.env.ENABLE_EMAILS === "true";
const resend = EMAILS_ENABLED ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "noreply@example.com";
const THERAPIST_EMAIL = process.env.THERAPIST_EMAIL ?? "";

async function send(params: Parameters<Resend["emails"]["send"]>[0]) {
  if (!resend) return;
  await resend.emails.send(params);
}

function formatDateTime(date: Date) {
  return format(date, "d. MMMM yyyy 'o' HH:mm", { locale: sk });
}

function buildIcsAttachment(
  start: Date,
  end: Date,
  uid: string,
  clientEmail?: string,
  meetLink?: string,
) {
  const ics = generateIcs({
    uid,
    start,
    end,
    summary: "Terapeutické sedenie",
    description: "Vaše sedenie bolo naplánované.",
    organizerEmail: THERAPIST_EMAIL,
    attendeeEmail: clientEmail,
    meetLink,
  });
  return {
    filename: "sedenie.ics",
    content: Buffer.from(ics).toString("base64"),
  };
}

export async function sendBookingNotificationToTherapist({
  start,
  end,
  clientName,
  clientEmail,
}: {
  start: Date;
  end: Date;
  clientName: string;
  clientEmail?: string;
}) {
  if (!THERAPIST_EMAIL) return;

  const dateStr = formatDateTime(start);
  const endTimeStr = format(end, "HH:mm");

  await send({
    from: FROM,
    to: THERAPIST_EMAIL,
    subject: `Nová žiadosť o sedenie — ${clientName}`,
    html: therapistNotificationHtml({ clientName, clientEmail, dateStr, endTimeStr }),
  });
}

export async function sendBookingCancellationToTherapist({
  clientName,
  clientEmail,
  start,
  end,
}: {
  clientName: string;
  clientEmail: string;
  start: Date;
  end: Date;
}) {
  const dateStr = formatDateTime(start);
  const endTimeStr = format(end, "HH:mm");

  await send({
    from: FROM,
    to: THERAPIST_EMAIL,
    subject: `Klient ${clientName} zrušil sedenie`,
    html: therapistCancellationHtml({ clientName, clientEmail, dateStr, endTimeStr, fromEmail: FROM }),
  });
}

export async function sendBookingConfirmationToClient({
  bookingId,
  start,
  end,
  clientName,
  clientEmail,
  meetLink,
  locationType,
}: {
  bookingId: string;
  start: Date;
  end: Date;
  clientName: string;
  clientEmail: string;
  meetLink?: string;
  locationType?: string;
}) {
  const dateStr = formatDateTime(start);
  const endTimeStr = format(end, "HH:mm");

  await send({
    from: FROM,
    to: clientEmail,
    subject: "Vaše sedenie bolo potvrdené ✓",
    html: clientConfirmationHtml({ clientName, dateStr, endTimeStr, meetLink, locationType }),
    attachments: [buildIcsAttachment(start, end, bookingId, clientEmail, locationType === "online" ? meetLink : undefined)],
  });
}

export async function sendBookingCancellationToClient({
  clientName,
  clientEmail,
  start,
  end,
}: {
  clientName: string;
  clientEmail: string;
  start: Date;
  end: Date;
}) {
  const dateStr = formatDateTime(start);
  const endTimeStr = format(end, "HH:mm");

  await send({
    from: FROM,
    to: clientEmail,
    subject: "Vaše sedenie bolo zrušené",
    html: clientCancellationHtml({ clientName, dateStr, endTimeStr, fromEmail: FROM }),
  });
}

export async function sendBookingRescheduledToClient({
  clientName,
  clientEmail,
  bookingId,
  oldStart,
  newStart,
  newEnd,
  meetLink,
  locationType,
}: {
  clientName: string;
  clientEmail: string;
  bookingId: string;
  oldStart: Date;
  newStart: Date;
  newEnd: Date;
  meetLink?: string;
  locationType?: string;
}) {
  const oldDateStr = formatDateTime(oldStart);
  const newDateStr = formatDateTime(newStart);
  const newEndTimeStr = format(newEnd, "HH:mm");

  await send({
    from: FROM,
    to: clientEmail,
    subject: "Čas vášho sedenia bol zmenený",
    html: clientRescheduledHtml({ clientName, oldDateStr, newDateStr, newEndTimeStr, meetLink, locationType }),
    attachments: [buildIcsAttachment(newStart, newEnd, bookingId, clientEmail, locationType === "online" ? meetLink : undefined)],
  });
}

export async function sendContactFormEmail({
  name,
  email,
  serviceType,
  message,
}: {
  name: string;
  email: string;
  serviceType: string;
  message: string;
}) {
  if (!THERAPIST_EMAIL) return;

  await send({
    from: FROM,
    to: THERAPIST_EMAIL,
    replyTo: email,
    subject: `Nová správa z kontaktného formulára — ${name}`,
    html: contactFormHtml({ name, email, serviceLabel: serviceType, message }),
  });
}
