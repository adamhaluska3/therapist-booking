import Link from "next/link";
import {
  Brain,
  Users,
  GraduationCap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { homeContent } from "../../app/(marketing)/_content/home";

type Props = {
  content: typeof homeContent.services;
};

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
    bg: "bg-white",
    iconBg: "bg-surface-300",
    iconColor: "text-brand-700",
  },
  {
    icon: TrendingUp,
    primary: false,
    bg: "bg-surface-50",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
  },
] as const;

export function ServicesSection({ content }: Props) {
  return (
    <section className="bg-linear-to-b from-white to-surface-100">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600">
          {content.label}
        </p>

        <div className="mb-8 md:mb-12">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
            {content.heading}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-500">
            {content.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {content.items.map((item, i) => {
            const v = SERVICE_VISUALS[i];
            return (
              <div
                key={item.title}
                className={`${v.bg} flex flex-col gap-6 rounded-2xl p-6 shadow-sm md:p-8`}
              >
                <div
                  className={`${v.iconBg} flex h-10 w-10 items-center justify-center rounded-xl`}
                >
                  <v.icon className={`${v.iconColor} h-5 w-5`} />
                </div>

                <div>
                  <h3 className="mb-2 font-serif text-xl font-medium text-brand-900 md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    {item.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  {v.primary ? (
                    <Link href="/booking">
                      <Button className="h-auto rounded-full bg-brand-700 px-4 py-2 text-xs text-white hover:bg-brand-800">
                        {item.cta} →
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/#contact">
                      <Button
                        variant="outline"
                        className="h-auto rounded-full border-neutral-300 px-4 py-2 text-xs"
                      >
                        {item.cta}
                      </Button>
                    </Link>
                  )}
                  <ArrowRight className="h-4 w-4 text-neutral-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
