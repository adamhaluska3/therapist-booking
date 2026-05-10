import { addDays } from "date-fns";
import { bookingContent } from "./_content/booking";
import { BookingWidget } from "@/components/booking/booking-widget";
import { getBookingSlots } from "@/server/booking/queries";

const { hero, main } = bookingContent;

export default async function BookingPage() {
  const today = new Date();
  const slots = await getBookingSlots(today, addDays(today, 90));
  return (
    <>
      <section className="bg-linear-to-b from-white to-surface-100">
        <div className="mx-auto max-w-6xl px-8 pb-16 pt-12">
          <BookingWidget
            slots={slots}
            leftHeader={
              <>
                <h1 className="mb-3 font-serif text-3xl font-semibold italic leading-tight text-brand-900 md:text-4xl">
                  {main.heading}
                </h1>
                <p className="mb-10 max-w-md text-sm leading-relaxed text-neutral-500">
                  {main.subheading}
                </p>
              </>
            }
          />
        </div>
      </section>

      <section className="bg-linear-to-br from-brand-900 to-brand-700">
        <div className="mx-auto max-w-6xl px-8 py-20">
          <h2 className="mb-4 max-w-lg font-serif text-3xl font-semibold italic leading-tight text-white md:text-4xl">
            {hero.heading}
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-brand-200">
            {hero.subheading}
          </p>
        </div>
      </section>
    </>
  );
}
