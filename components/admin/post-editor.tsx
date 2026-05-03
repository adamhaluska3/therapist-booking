"use client";
import { PostCategory } from "@/db/schema";
import { useState } from "react";
import { CategoryCombobox } from "./category-combobox";
import { useForm } from "react-hook-form";
import { Button } from "@base-ui/react";
import 'react-quill-new/dist/quill.snow.css'
import dynamic from "next/dynamic";
import { createPost, updatePost } from "@/server/actions/blog";
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from "@/lib/utils";


export type PostEditorProps = {
    post: {
        id: string | null,
        title: string,
        description: string,
        content: string,
        titleImage?: string
        categoryId?: string
    },
    categories: PostCategory[]
}

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
const TitleImageUpload = dynamic(() => import('./title-image-upload'), { ssr: false })

const isContentBlank = (html: string) => {
  return !html || html.replace(/<[^>]*>/g, '').trim() === ''
}

const setNewLines = (html: string): string => {
  return html
    ?.replace(/<p><\/p>/gi, "<br>")
    ?.replace(/\s-\s/g, "\u00A0\u2011\u00A0")
}

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
})

type PostFormValues = z.infer<typeof postSchema>

export const PostEditor = ({post, categories}: PostEditorProps) => {
    const [content, setContent] = useState(post.content);
    const [category, setCategory] = useState(categories.find(c => c.id === post.categoryId) || null);
    const [titleImageFile, setTitleImageFile] = useState<File | null>(null)
    const [titleImageRemoved, setTitleImageRemoved] = useState(false)

    const { watch, register, handleSubmit, formState: { errors } } = useForm(
        {
            resolver: zodResolver(postSchema),
                defaultValues: {
                    title: post?.title ?? '',
                    description: post?.description ?? '',
                }
        }
    );
  
    const modules = {
        toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
        ],
    }

    const onSubmit = async (values: PostFormValues, isPublic: boolean) => {
        console.log(content)
        if (!post.id) {
            await createPost({
                ...values,
                content: setNewLines(content),
                categoryId: category?.id ?? null,
                isPublic,
                titleImage: titleImageFile
            })
        } else {
            await updatePost(post.id, {
                ...values,
                content: setNewLines(content),
                categoryId: category?.id ?? null,
                isPublic,
                existingTitleImage: post.titleImage,
                removeTitleImage: titleImageRemoved,
                titleImage: titleImageFile
            })
        }
    }

    const blockPublish = isContentBlank(content) || watch("title") === "" || watch("description") === ""

    return (
        <article>
            <form>
                <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1">
                        <div className='flex flex-col'>
                            <label htmlFor="title" className='mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600'>
                                Názov
                            </label>
                            <input {...register("title")}
                                defaultValue={post.title}
                                className="w-full md:max-w-150 border border-solid rounded-2xl p-2 py-4 bg-surface-100"
                                placeholder="Výstižný názov"
                            />
                        </div>
                        <div className='flex flex-col mt-5'>
                            <label htmlFor="description" className='mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600'>
                                Popisok
                            </label>
                            <textarea {...register("description")}
                                rows={3}
                                defaultValue={post.description || ""}
                                className="w-full md:max-w-150 border border-solid rounded-2xl p-2 py-4 bg-surface-100"
                                placeholder="Krátky úvod do článku"
                            />
                        </div>
                        <div className='flex flex-col mt-5 items-start'>
                            <label htmlFor="description" className='mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600'>
                                Kategória
                            </label>
                            <CategoryCombobox category={category} onChange={(c) => setCategory(c)} categories={categories} />
                        </div>
                    </div>
                    <div className="flex flex-col items-start w-full md:w-100">
                        <label htmlFor="description" className='mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600'>
                                Titulný obrázok
                        </label>
                        <TitleImageUpload 
                            existingUrl={post?.titleImage} 
                            onChange={(file, removed) => {
                                setTitleImageFile(file)
                                setTitleImageRemoved(removed)
                            }}
                            className="mt-5 flex justify-center w-full"
                        />
                    </div>
                </div>

                <ReactQuill className="mt-5" value={content} onChange={setContent} modules={modules} theme="snow" />
                <div className="mt-5 flex justify-end gap-5">
                    <Button
                        onClick={handleSubmit(vals => onSubmit(vals, false))}
                        className="mt-5 p-2text-gray-400 text-xs font-semibold uppercase tracking-widest"
                        >
                            Uložiť ako koncept
                    </Button>
                    <Button
                        disabled={blockPublish}
                        onClick={handleSubmit(vals => onSubmit(vals, true))}
                        className={
                            cn("mt-5 py-2 px-5 bg-brand-500 rounded-2xl text-white text-xs font-semibold uppercase tracking-widest",
                            blockPublish && "bg-brand-300"
                        )}   
                        >
                            Uložiť a publikovať článok
                    </Button>
                </div>
            </form>
        </article>
    )
}