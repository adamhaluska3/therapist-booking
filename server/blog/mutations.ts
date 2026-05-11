'use server'

import { db } from '@/lib/db'
import { postCategories, posts } from '@/db/schema'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '../auth'

const toSlug = (title: string) => {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

const generateSlug = (title: string, isPublic: boolean) => {
  if (!isPublic || !title.trim()) {
    return randomBytes(16).toString('hex')
  }
  return toSlug(title)
}

export async function createPost(data: {
  title: string
  description: string
  content: string
  categoryId: string | null
  isPublic: boolean
  titleImage?: File | null
}): Promise<{ success: false; error: string } | { success: true }> {
    await requireAdmin();

    const slug = generateSlug(data.title, data.isPublic)
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    })
    if (existing) {
      return { success: false, error: 'Príspevok s podobným názvom už je zverejnený.' }
    }

    let titleImage: string | null = null

    if (data.titleImage && data.titleImage.size > 0) {
        const bytes = await data.titleImage.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${randomBytes(16).toString('hex')}${path.extname(data.titleImage.name)}`
        await writeFile(path.join(process.cwd(), 'public/uploads', filename), buffer)
        titleImage = `/uploads/${filename}`
    }

    await db.insert(posts).values({
        title: data.title,
        description: data.description,
        content: data.content,
        categoryId: data.categoryId,
        isPublic: data.isPublic,
        titleImage,
        slug: slug,
    });

    return { success: true }
}

export async function updatePost(id: string, data: {
  title: string
  description?: string
  content: string
  categoryId: string | null
  isPublic: boolean
  titleImage?: File | null
  existingTitleImage?: string | null
  removeTitleImage?: boolean
}): Promise<{ success: false; error: string } | { success: true }> {
  await requireAdmin();

  const slug = generateSlug(data.title, data.isPublic)
  const conflict = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  })
  if (conflict && conflict.id !== id) {
    return { success: false, error: 'Príspevok s podobným názvom už je zverejnený.' }
  }

  let titleImage = data.existingTitleImage ?? null

  if (data.removeTitleImage && data.existingTitleImage) {
    await unlink(path.join(process.cwd(), 'public', data.existingTitleImage)).catch(() => {})
    titleImage = null
  }

  if (data.titleImage && data.titleImage.size > 0) {
    if (data.existingTitleImage) {
      await unlink(path.join(process.cwd(), 'public', data.existingTitleImage)).catch(() => {})
    }

    const bytes = await data.titleImage.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${data.titleImage.name.replace(/\s/g, '_')}`
    await writeFile(path.join(process.cwd(), 'public/uploads', filename), buffer)
    titleImage = `/uploads/${filename}`
  }

  await db.update(posts).set({
    title: data.title,
    description: data.description,
    content: data.content,
    categoryId: data.categoryId,
    isPublic: data.isPublic,
    slug: slug,
    titleImage,
  }).where(eq(posts.id, id))

  return { success: true }
}

export const deletePost = async (id: string) => {
    await requireAdmin();
    await db.delete(posts).where(eq(posts.id, id))
    revalidatePath('/admin/blog')
}

export const setPublicity = async (id: string, isPublic: boolean): Promise<{ success: false; error: string } | { success: true }> => {
    await requireAdmin();
    const post = await db.query.posts.findFirst({ where: eq(posts.id, id) })
    if (!post) return { success: false, error: 'Príspevok nebol nájdený' }
    const slug = generateSlug(post.title, isPublic)
    const conflict = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    })
    if (conflict && conflict.id !== id) {
      return { success: false, error: 'Príspevok s podobným názvom už je zverejnený.' }
    }
    await db.update(posts).set({isPublic, slug}).where(eq(posts.id, id));
    return { success: true }
}
