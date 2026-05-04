import { headers } from "next/headers";
import { getPaymentSettings } from "@/server/queries/payment-settings";
import { getBookingTypes } from "@/server/queries";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { BookingTypePricesForm } from "@/components/admin/booking-type-prices-form";
import { CalendarFeedSection } from "@/components/admin/calendar-feed-section";

export default async function SettingsPage() {
  const [settings, bookingTypes, headersList] = await Promise.all([
    getPaymentSettings(),
    getBookingTypes(),
    headers(),
  ]);

  const token = process.env.CALENDAR_FEED_TOKEN
  const host = headersList.get("host") ?? ""
  const protocol = host.startsWith("localhost") ? "http" : "https"
  const feedUrl = token
    ? `${protocol}://${host}/api/calendar/feed?token=${token}`
    : null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
          Nastavenia
        </p>
        <h1
          className="font-serif text-4xl font-bold text-neutral-800 mb-1"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Platobné údaje
        </h1>
        <p className="text-sm text-neutral-500">
          Tieto údaje sa použijú pri generovaní QR kódov pre klientov.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <PaymentSettingsForm settings={settings} />
        <BookingTypePricesForm bookingTypes={bookingTypes} />
        {feedUrl && <CalendarFeedSection feedUrl={feedUrl} />}
      </div>
    </div>
  );
}
