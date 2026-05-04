'use server'

import { db } from '@/lib/db'
import { postCategories, posts } from '@/db/schema'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { PcCase } from 'lucide-react'
import z from 'zod'

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
}) {
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
        slug: generateSlug(data.title, data.isPublic),
    });

    redirect("/admin/blog")
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
}) {
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
    slug: generateSlug(data.title, data.isPublic),
    titleImage,
  }).where(eq(posts.id, id))

  redirect("/admin/blog")
}

export const deletePost = async (id: string) => {
    await db.delete(posts).where(eq(posts.id, id))
    revalidatePath('/admin/blog')
}

export const setPublicity = async (id: string, isPublic: boolean) => {
    await db.update(posts).set({isPublic}).where(eq(posts.id, id));
    revalidatePath('/admin/blog')
    revalidatePath(`/admin/blog/${isPublic}`)
}
