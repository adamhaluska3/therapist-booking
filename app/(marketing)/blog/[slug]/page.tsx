import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { blogPosts, type BlogPost } from "../../_content/blog";

const DUMMY_BODY = [
  "Každý z nás čelí v živote momentom, keď sa cítime preťažení, stratení alebo jednoducho unavení z každodenného behu. Práve v týchto chvíľach je dôležité zastaviť sa, nadýchnuť a pozrieť sa dovnútra. Psychológia nám ponúka množstvo nástrojov, ktoré môžeme využiť na ceste k lepšiemu poznaniu seba samého.",
  "Výskumy ukazujú, že ľudia, ktorí pravidelne reflektujú svoje emócie a myšlienky, majú vyššiu odolnosť voči stresu a lepšie zvládajú náročné životné situácie. Nejde pritom o žiadnu mystiku — ide o vedomé pestovanie návykov, ktoré posilňujú náš vnútorný svet.",
  "Jednou z najúčinnejších metód je vedenie denníka. Keď myšlienky prenesieme na papier, prestanú krúžiť v hlave a môžeme ich vidieť s väčším odstupom. Tento jednoduchý úkon nám pomáha identifikovať vzorce správania, rozoznať spúšťače stresu a postupne meniť to, čo nám neslúži.",
  "Rovnako dôležitá je aj fyzická aktivita. Pohyb nie je len o tele — je to jeden z najmocnejších regulátorov nálady, aké poznáme. Už 30 minút chôdze denne môže výrazne ovplyvniť hladinu kortizolu a zlepšiť kvalitu spánku. A lepší spánok znamená jasnejšiu myseľ a väčšiu emocionálnu stabilitu.",
  "Na záver je dôležité pripomenúť, že zmena neprichádza cez noc. Je to postupný proces, plný malých krokov a občasných zakopnutí. Buďte k sebe láskaví. Dovoľte si byť nedokonalí a zároveň stále rastúci. Práve to je podstata duševného zdravia — nie dokonalosť, ale autentický vzťah k sebe samému.",
];

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post: BlogPost) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p: BlogPost) => p.slug === slug);

  if (!post) notFound();

  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-b from-white to-surface-100">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-12 md:px-8 md:pb-12 md:pt-20">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Späť na blog
          </Link>

          <p className="mb-4 text-xs text-neutral-400">{post.date}</p>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Image */}
      {post.image && (
        <section className="bg-surface-100">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface-200">
              <Image
                src={post.image.src}
                alt={post.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Body */}
      <section className="bg-linear-to-b from-surface-100 to-surface-50">
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 md:px-8">
          <p className="mb-8 text-sm font-medium leading-relaxed text-neutral-600">
            {post.excerpt}
          </p>
          <div className="space-y-5">
            {DUMMY_BODY.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-neutral-500">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
