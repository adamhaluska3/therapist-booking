import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/marketing/image-carousel";
import type { homeContent } from "../../app/(marketing)/_content/home";

type Props = {
  content: typeof homeContent.outdoorTherapy;
};

export function OutdoorTherapySection({ content }: Props) {
  return (
    <section className="bg-linear-to-b from-surface-100 to-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600">
              {content.label}
            </p>
            <h2 className="mb-6 font-serif text-2xl font-semibold leading-tight text-brand-900 md:text-4xl">
              {content.heading}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-neutral-500">
              {content.description}
            </p>
            <ul className="mb-8 space-y-3">
              {content.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm text-neutral-600"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Link href="/#contact">
              <Button className="w-full rounded-full bg-brand-700 px-6 text-white hover:bg-brand-800 sm:w-auto">
                {content.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {content.images.length > 0 ? (
            <ImageCarousel
              images={content.images}
              aspectClassName="aspect-4/3"
              autoPlay
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-brand-100">
              <span className="text-sm text-brand-300">
                Illustration placeholder
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
