import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { and } from "drizzle-orm";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await db.query.posts.findMany()).map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await db.query.posts.findFirst({
    where: (fields, { eq }) =>
      and(eq(fields.slug, slug), eq(fields.isPublic, true)),
    with: { category: true },
  });

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

          <p className="mb-4 text-xs text-neutral-400">
            {post.createdAt.toLocaleDateString("sk-SK", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p className="font-semibold text-sm mb-3 text-taupe-400">
            {post.category?.name}
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Image */}
      {post.titleImage && (
        <section className="bg-surface-100">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface-200">
              <Image
                src={post.titleImage}
                alt={post.title + "picture"}
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
            {post.description}
          </p>
          <div
            className="w-full space-y-5 prose prose-neutral max-w-none prose-p:mb-0 prose-li:my-0.5"
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/&nbsp;([—–])/g, "\u00A0$1")
                .replace(/([—–])&nbsp;/g, "$1\u00A0")
                .replace(/&nbsp;/g, " ")
                .replace(/ - /g, "\u00A0\u2011\u00A0"),
            }}
          />
        </div>
      </section>
    </>
  );
}
