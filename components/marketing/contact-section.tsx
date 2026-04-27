import { MapPin, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import type { homeContent } from "../../app/(marketing)/_content/home";

type Props = {
  content: typeof homeContent.contact;
};

export function ContactSection({ content }: Props) {
  return (
    <section className="bg-linear-to-b from-surface-100 to-surface-50">
      <div className="mx-auto max-w-6xl px-8 py-24">
        <div className="rounded-3xl bg-white p-12 shadow-sm">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <h2 className="mb-4 font-serif text-4xl font-semibold text-brand-900">
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

            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
