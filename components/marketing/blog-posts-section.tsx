"use client";

import Image from "next/image";
import Link from "next/link";
import { blogPosts, type BlogPost } from "../../app/(marketing)/_content/blog";
import { useBlogFilter } from "./blog-filter-context";

export function BlogPostsSection() {
  const { active } = useBlogFilter();

  const filtered =
    active === "vsetko"
      ? blogPosts
      : blogPosts.filter((p: BlogPost) => p.category === active);

  const [featured, ...rest] = filtered;

  return (
    <section className="bg-linear-to-b from-surface-100 to-surface-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-12">
        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-400">
            Žiadne články v tejto kategórii.
          </p>
        )}

        {/* Featured post */}
        {featured && (
          <div className="mb-12 grid grid-cols-1 items-center gap-8 md:mb-16 md:grid-cols-2 md:gap-12">
            <PostImage post={featured} priority />
            <div>
              <p className="mb-3 text-xs text-neutral-400">{featured.date}</p>
              <h2 className="mb-4 font-serif text-2xl font-semibold leading-tight text-brand-900 md:text-4xl">
                {featured.title}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-neutral-500">
                {featured.excerpt}
              </p>
              <Link
                href={`/blog/${featured.slug}`}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Čítať viac →
              </Link>
            </div>
          </div>
        )}

        {/* Post list */}
        <div className="divide-y divide-surface-200">
          {rest.map((post, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <div
                key={post.slug}
                className="grid grid-cols-1 items-center gap-6 py-10 md:grid-cols-2 md:gap-12 md:py-12"
              >
                {/* On mobile always image first, on desktop alternate */}
                <div className={imageLeft ? "" : "md:order-last"}>
                  <PostImage post={post} />
                </div>
                <div className={imageLeft ? "" : "md:order-first"}>
                  <PostBody post={post} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PostImage({
  post,
  priority = false,
}: {
  post: BlogPost;
  priority?: boolean;
}) {
  if (!post.image) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-2xl bg-surface-200">
        <span className="text-sm text-neutral-400">Bez obrázka</span>
      </div>
    );
  }
  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-surface-200">
      <Image
        src={post.image.src}
        alt={post.image.alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}

function PostBody({ post }: { post: BlogPost }) {
  return (
    <div>
      <p className="mb-3 text-xs text-neutral-400">{post.date}</p>
      <h3 className="mb-3 font-serif text-xl font-semibold leading-tight text-brand-900 md:text-2xl">
        {post.title}
      </h3>
      <p className="mb-5 text-sm leading-relaxed text-neutral-500">
        {post.excerpt}
      </p>
      <Link
        href={`/blog/${post.slug}`}
        className="text-xs font-semibold text-brand-700 hover:text-brand-800"
      >
        Čítať viac →
      </Link>
    </div>
  );
}
