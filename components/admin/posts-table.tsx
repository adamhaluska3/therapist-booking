'use client'
import { deletePost } from '@/server/actions/blog'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table'
import { Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination'
import { useState } from 'react'

type Post = {
    id: string
    title: string
    isPublic: boolean
    category: { name: string } | null
    createdAt: Date,
    titleImage?: string
}

const columns: ColumnDef<Post>[] = [
    {
        accessorKey: 'titleImage',
        header: 'Titulný obrázok',
        cell: ({ row }) => row.original.titleImage ? <img src={row.original.titleImage} className='w-20 aspect-4/3 object-cover rounded-xl'/> : <div className='h-15'></div>
    },
    {
        accessorKey: 'title',
        header: 'Názov',
    },
    {
        accessorKey: 'category',
        header: 'Kategória',
        cell: ({ row }) => row.original.category?.name ?? '—',
    },
    {
        accessorKey: 'isPublic',
        header: 'Stav',
        cell: ({ row }) => row.original.isPublic
        ? <span className="text-brand-500 text-xs font-semibold">Publikovaný</span>
        : <span className="text-gray-400 text-xs font-semibold">Koncept</span>,
    },
    {
        id: 'actions',
        cell: ({ row }) => (
        <div className="flex gap-5 justify-end">
            <Link href={`/admin/blog/${row.original.id}`} className="text-xs text-brand-600 underline">
                <Edit2/>
            </Link>
            <Trash2 className='text-red-900' onClick={() => deletePost(row.original.id)}/>
        </div>
        ),
    },
]

export function PostsTable({ data }: { data: Post[] }) {
    const [pagination] = useState({ pageIndex: 0, pageSize: 1 })
    const table = useReactTable({
        data,
        columns,
        state: {pagination},
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <table className="w-full text-sm">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b text-left text-xs uppercase tracking-widest text-brand-600">
                        {headerGroup.headers.map(header => (
                        <th key={header.id} className="pb-3 pr-4">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                        ))}
                    </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b hover:bg-surface-100 transition-colors">
                        {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="py-3 pr-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
            <Pagination className='mt-5'>
                <PaginationContent className='flex w-full'>
                    <div className='flex-1'>
                        Celkovo {data.length} {data.length === 1 ? "príspevok" : (data.length < 5 ? "príspevky" : "príspevkov")}
                    </div>
                    <div className='flex'>
                        <PaginationItem>
                        <PaginationPrevious onClick={() => table.previousPage()} text='Späť'/>
                        </PaginationItem>

                        {Array.from({ length: table.getPageCount() }, (_, i) => i)
                        .filter(i => Math.abs(i - table.getState().pagination.pageIndex) <= 1)
                        .map(i => (
                            <PaginationItem key={i}>
                            <PaginationLink
                                isActive={table.getState().pagination.pageIndex === i}
                                onClick={() => table.setPageIndex(i)}
                            >
                                {i + 1}
                            </PaginationLink>
                            </PaginationItem>
                        ))
                        }

                        {table.getPageCount() > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

                        <PaginationItem>
                        <PaginationNext onClick={() => table.nextPage()} text='Ďalej'/>
                        </PaginationItem>
                    </div>
                </PaginationContent>
            </Pagination>
        </>
    )
}