"use client";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Edit2 } from "lucide-react";
import Link from "next/link";
import { PaginationControls } from "./pagination-controls";
import { useState } from "react";
import { RemovePostDialog } from "./remove-post-dialog";
import { PublicityToggle } from "./publicity-toggle";

type Post = {
  id: string;
  title: string;
  isPublic: boolean;
  category: { name: string } | null;
  createdAt: Date;
  titleImage?: string | null;
};

const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "titleImage",
    header: () => <span className="hidden md:table-cell">Titulný obrázok</span>,
    cell: ({ row }) => (
      <div className="hidden md:table-cell">
        {row.original.titleImage ? (
          <img
            src={row.original.titleImage}
            className="w-20 aspect-4/3 object-cover rounded-xl"
          />
        ) : (
          <div className="h-15" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Názov",
  },
  {
    accessorKey: "category",
    header: () => <span className="hidden sm:table-cell">Kategória</span>,
    cell: ({ row }) => (
      <div className="hidden sm:table-cell">
        {row.original.category?.name ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "isPublic",
    header: "Stav",
    cell: ({ row }) => (
      <PublicityToggle id={row.original.id} isPublic={row.original.isPublic} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-5 justify-end">
        <Link
          href={`/admin/blog/${row.original.id}`}
          className="text-xs text-brand-600 underline"
        >
          <Edit2 />
        </Link>
        <RemovePostDialog id={row.original.id} title={row.original.title} />
      </div>
    ),
  },
];

export function PostsTable({ data }: { data: Post[] }) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b text-left text-xs uppercase tracking-widest text-brand-600"
            >
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="pb-3 pr-4">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b hover:bg-surface-100 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-3 pr-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <PaginationControls
          page={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          rangeStart={
            data.length === 0
              ? 0
              : table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1
          }
          rangeEnd={Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            data.length,
          )}
          total={data.length}
          isPending={false}
          onNavigate={(page) => {
            table.setPageIndex(page - 1);
          }}
        />
      </div>
    </>
  );
}
