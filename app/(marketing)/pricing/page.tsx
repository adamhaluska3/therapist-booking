import { Info } from "lucide-react";
import { PricingTable } from "@/components/marketing/pricing-table";
import { getBookingTypes } from "@/server/booking-type/queries";

export default async function PricingPage() {
  const allServices = await getBookingTypes();
  const services = [...allServices].sort((a, b) =>
    a.name.toLowerCase() === "psychoterapia"
      ? -1
      : b.name.toLowerCase() === "psychoterapia"
        ? 1
        : 0,
  );

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-20">
        <div className="relative mb-12 md:mb-16">
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl font-bold text-brand-900 md:text-5xl">
              Cenník služieb
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Veríme, že cesta k duševnej rovnováhe by mala byť transparentná a
              prístupná. Uvedené ceny sú orientačné — finálna suma môže byť
              upravená na základe vašich individuálnych potrieb a možností.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              <Info size={14} className="shrink-0" />
              Konzultácia dostupná online aj osobne
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <PricingTable services={services} />
        </div>
      </div>
    </section>
  );
}
