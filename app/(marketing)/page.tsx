import Image from "next/image";
import {
  Brain,
  Users,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/marketing/contact-form";
import { ImageCarousel } from "@/components/marketing/image-carousel";
import { homeContent } from "./_content/home";

const SERVICE_VISUALS = [
  {
    icon: Brain,
    primary: true,
    bg: "bg-white",
    iconBg: "bg-brand-700",
    iconColor: "text-white",
  },
  {
    icon: Users,
    primary: false,
    bg: "bg-surface-50",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
  },
  {
    icon: GraduationCap,
    primary: false,
    bg: "bg-surface-200",
    iconBg: "bg-surface-300",
    iconColor: "text-brand-800",
  },
  {
    icon: TrendingUp,
    primary: false,
    bg: "bg-surface-50",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
  },
] as const;

const { services, outdoorTherapy, about, contact } = homeContent;

export default function HomePage() {
  return (
    <>
      {/* Services */}
      <section className="mx-auto max-w-6xl px-8 pb-24 pt-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600">
          {services.label}
        </p>

        <div className="mb-12">
          <h1 className="font-serif text-5xl font-semibold leading-tight text-brand-900">
            {services.heading}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-500">
            {services.subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {services.items.map((item, i) => {
            const v = SERVICE_VISUALS[i];
            return (
              <div
                key={item.title}
                className={`${v.bg} flex flex-col gap-6 rounded-2xl p-8 shadow-sm`}
              >
                <div
                  className={`${v.iconBg} flex h-10 w-10 items-center justify-center rounded-xl`}
                >
                  <v.icon className={`${v.iconColor} h-5 w-5`} />
                </div>

                <div>
                  <h3 className="mb-2 font-serif text-2xl font-medium text-brand-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    {item.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  {v.primary ? (
                    <Button className="h-auto rounded-full bg-brand-700 px-4 py-2 text-xs text-white hover:bg-brand-800">
                      {item.cta} →
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-auto rounded-full border-neutral-300 px-4 py-2 text-xs"
                    >
                      {item.cta}
                    </Button>
                  )}
                  <ArrowRight className="h-4 w-4 text-neutral-300" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Outdoor therapy */}
      <section className="mx-auto max-w-6xl px-8 py-24">
        <div className="grid grid-cols-2 items-center gap-16">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600">
              {outdoorTherapy.label}
            </p>
            <h2 className="mb-6 font-serif text-4xl font-semibold leading-tight text-brand-900">
              {outdoorTherapy.heading}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-neutral-500">
              {outdoorTherapy.description}
            </p>
            <ul className="mb-8 space-y-3">
              {outdoorTherapy.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm text-neutral-600"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Button className="rounded-full bg-brand-700 px-6 text-white hover:bg-brand-800">
              {outdoorTherapy.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>

          {outdoorTherapy.images.length > 0 ? (
            <ImageCarousel
              images={outdoorTherapy.images}
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
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-8 py-24">
        <div className="grid grid-cols-2 items-start gap-12">
          <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-200">
              <Image
                src={about.photo.src}
                alt={about.photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-6 top-6 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-brand-800 text-white">
              <span className="text-xl font-bold leading-none">
                {about.yearsOfExperience}
              </span>
              <span className="text-center text-[10px] leading-tight text-brand-200">
                rokov
              </span>
            </div>
          </div>

          <div className="pt-12">
            <h2 className="mb-6 font-serif text-4xl font-semibold text-brand-900">
              {about.name}
            </h2>
            {about.bio.map((paragraph, i) => (
              <p
                key={i}
                className="mb-4 text-sm leading-relaxed text-neutral-500 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-6xl px-8 py-24">
        <div className="rounded-3xl bg-white p-12 shadow-sm">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <h2 className="mb-4 font-serif text-4xl font-semibold text-brand-900">
                {contact.heading}
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-neutral-500">
                {contact.description}
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
                  {contact.address}
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                  {contact.email}
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <Phone className="h-4 w-4 shrink-0 text-brand-600" />
                  {contact.phone}
                </li>
              </ul>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
