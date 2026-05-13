'use client'
import { Edit2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { RemovePostDialog } from './remove-post-dialog'
import { PublicityToggle } from './publicity-toggle'
import { AdminCard } from './admin-card'
import { Button } from '@/components/ui/button'

type Post = {
    id: string
    title: string
    isPublic: boolean
    category: { name: string } | null
    createdAt: Date
    titleImage?: string | null
}

const PAGE_SIZE = 10

export function PostsTable({ data }: { data: Post[] }) {
    const [visible, setVisible] = useState(PAGE_SIZE)

    const shown = data.slice(0, visible)
    const hasMore = visible < data.length

    return (
        <div className="flex flex-col gap-3">
            {shown.length === 0 && (
                <p className="py-12 text-center text-sm text-neutral-400">Žiadne príspevky</p>
            )}
            {shown.map(post => (
                <AdminCard key={post.id} className="flex-row items-center gap-4">
                    {post.titleImage ? (
                        <img
                            src={post.titleImage}
                            alt={post.title}
                            className="hidden sm:block w-20 aspect-4/3 object-cover rounded-lg shrink-0"
                        />
                    ) : (
                        <div className="hidden sm:block w-20 aspect-4/3 rounded-lg bg-surface-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 truncate">{post.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{post.category?.name ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <PublicityToggle id={post.id} isPublic={post.isPublic} />
                        <Link
                            href={`/admin/blog/${post.id}`}
                            className="text-neutral-400 hover:text-brand-600 transition-colors"
                        >
                            <Edit2 size={16} />
                        </Link>
                        <RemovePostDialog id={post.id} title={post.title} />
                    </div>
                </AdminCard>
            ))}
            {hasMore && (
                <div className="mt-5 flex justify-center">
                    <Button variant="outline" onClick={() => setVisible(v => v + PAGE_SIZE)}>
                        Načítať viac
                    </Button>
                </div>
            )}
        </div>
    )
}
