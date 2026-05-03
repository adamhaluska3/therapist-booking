import { MapPin, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { getBookingTypes } from "@/server/queries";
import type { homeContent } from "../../app/(marketing)/_content/home";

type Props = {
  content: typeof homeContent.contact;
};

export async function ContactSection({ content }: Props) {
  const bookingTypes = await getBookingTypes();

  return (
    <section id="contact" className="bg-linear-to-b from-surface-100 to-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8 md:rounded-3xl md:p-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-brand-900 md:text-4xl">
                {content.heading}
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-neutral-500">
                {content.description}
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
                  {content.address}
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                  {content.email}
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <Phone className="h-4 w-4 shrink-0 text-brand-600" />
                  {content.phone}
                </li>
              </ul>
            </div>

            <ContactForm bookingTypes={bookingTypes} />
          </div>
        </div>
      </div>
    </section>
  );
}
