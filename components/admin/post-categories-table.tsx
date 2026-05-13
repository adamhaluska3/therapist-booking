"use client";

import { PostCategory } from "@/db/schema";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { EditCategoryDialog } from "./edit-category-dialog";
import { Edit2 } from "lucide-react";
import { RemovePostCategoryDialog } from "./remove-post-category-dialog";
import { PaginationControls } from "./pagination-controls";

export const PostCategoriesTable = ({
  categories,
}: {
  categories: PostCategory[];
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<PostCategory>[]>(
    () => [
      {
        id: "name",
        header: "Názov",
        accessorFn: (row) => row,
        cell: ({ row }) => <span>{row.original.name}</span>,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-5 justify-end">
            <EditCategoryDialog category={row.original}>
              <Edit2 />
            </EditCategoryDialog>
            <RemovePostCategoryDialog
              id={row.original.id}
              name={row.original.name}
              categories={categories}
            />
          </div>
        ),
      },
    ],
    [categories],
  );

  const table = useReactTable({
    data: categories ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-surface-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-xs font-medium text-neutral-500`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
                className="border-t border-surface-200 hover:bg-surface-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={`px-4 py-4 align-top`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <PaginationControls
          page={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          rangeStart={
            categories.length === 0
              ? 0
              : table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1
          }
          rangeEnd={Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            categories.length,
          )}
          total={categories.length}
          isPending={false}
          onNavigate={(page) => {
            table.setPageIndex(page - 1);
          }}
        />
      </div>
    </div>
  );
};
