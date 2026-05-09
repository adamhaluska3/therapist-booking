"use client";

import Image from "next/image";
import Link from "next/link";
import { useBlogFilter } from "./blog-filter-context";
import { PostPreview } from "@/db/schema";

export type BlogPostsSectionProp = {
  posts: PostPreview[]
}

export function BlogPostsSection({posts}: BlogPostsSectionProp) {
  const { active } = useBlogFilter();

  const filtered =
    active === null
      ? posts
      : posts.filter((p) => p.category?.id === active);

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
              <p className="text-xs text-neutral-400">{featured.createdAt.toLocaleDateString("sk-SK", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}</p>
              <p className="font-semibold text-sm mb-3 text-taupe-400">{featured.category?.name}</p>
              <h2 className="mb-4 font-serif text-2xl font-semibold leading-tight text-brand-900 md:text-4xl">
                {featured.title}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-neutral-500">
                {featured.description}
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
  post: PostPreview;
  priority?: boolean;
}) {
  if (!post.titleImage) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-2xl bg-surface-200">
        <span className="text-sm text-neutral-400">Bez obrázka</span>
      </div>
    );
  }
  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-surface-200">
      <Image
        src={post.titleImage}
        alt={post.title + " picture"}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}

function PostBody({ post }: { post: PostPreview }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{post.createdAt.toLocaleDateString("sk-SK", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </p>
      <p className="font-semibold text-sm text-taupe-400 mb-3">{post.category?.name}</p>
      <h3 className="mb-3 font-serif text-xl font-semibold leading-tight text-brand-900 md:text-2xl">
        {post.title}
      </h3>
      <p className="mb-5 text-sm leading-relaxed text-neutral-500">
        {post.description}
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
