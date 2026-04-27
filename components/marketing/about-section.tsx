import Image from "next/image";
import type { homeContent } from "../../app/(marketing)/_content/home";

type Props = {
  content: typeof homeContent.about;
};

export function AboutSection({ content }: Props) {
  return (
    <section className="bg-linear-to-b from-surface-50 to-surface-100">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-12">
          <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-200">
              <Image
                src={content.photo.src}
                alt={content.photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-6 top-6 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-brand-800 text-white">
              <span className="text-xl font-bold leading-none">
                {content.yearsOfExperience}
              </span>
              <span className="text-center text-[10px] leading-tight text-brand-200">
                rokov
              </span>
            </div>
          </div>

          <div className="md:pt-12">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-brand-900 md:text-4xl">
              {content.name}
            </h2>
            {content.bio.map((paragraph, i) => (
              <p
                key={i}
                className="mb-4 text-sm leading-relaxed text-neutral-500 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
