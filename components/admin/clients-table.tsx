"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { getClientsTableRows } from "@/server/queries";

type ClientItem = {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
  lastSession?: string | null;
  totalSessions?: number;
};

type ColumnClassMeta = {
  className?: string;
};

export default function ClientsTable({
  items: initialItems,
}: {
  items: ClientItem[];
}) {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ClientItem[]>(initialItems ?? []);
  const [sorting, setSorting] = useState<any>([]);
  const [isPending, setIsPending] = useState(false);

  const columns = useMemo<ColumnDef<ClientItem, any>[]>(
    () => [
      {
        id: "client",
        header: "Meno klienta",
        accessorFn: (row) => row,
        cell: ({ getValue }) => {
          const row = getValue() as ClientItem;
          return (
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                {row.avatarUrl ? (
                  <AvatarImage src={row.avatarUrl} alt={row.name} />
                ) : (
                  <AvatarFallback>{row.name?.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-800 truncate">
                  {row.name}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "lastSession",
        header: "Posledné sedenie",
        meta: { className: "hidden sm:table-cell" },
        cell: ({ getValue }) => (
          <div className="text-sm text-neutral-600">{getValue() ?? "-"}</div>
        ),
      },
      {
        accessorKey: "totalSessions",
        header: "Počet sedení",
        meta: { className: "hidden sm:table-cell" },
        cell: ({ getValue }) => (
          <div className="text-sm text-neutral-600">{getValue() ?? 0}</div>
        ),
      },
      {
        id: "actions",
        header: "Akcia",
        meta: { className: "w-20 sm:w-auto" },
        cell: ({ row }) => {
          const item = row.original as ClientItem;
          return (
            <div className="flex items-center justify-center pt-2">
              <Link
                href={`/admin/clients/${item.id}`}
                className="inline-flex  items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
              >
                <span className="hidden sm:inline">Detail profilu</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data ?? [],
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

  const getColumnClassName = (meta: unknown) =>
    (meta as ColumnClassMeta | undefined)?.className ?? "";

  useEffect(() => {
    if (search === "") {
      setData(initialItems ?? []);
      setIsPending(false);
      return;
    }
    setIsPending(true);
    const id = setTimeout(async () => {
      try {
        const items = await getClientsTableRows(search || undefined);
        setData(items ?? []);
      } catch (e) {
        // ignore
      } finally {
        setIsPending(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vyhľadať podľa mena"
            className="w-full rounded-full border border-surface-200 bg-white pl-8 pr-4 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-brand-400 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-surface-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-xs font-medium text-neutral-500 ${getColumnClassName(
                      header.column.columnDef.meta,
                    )}`}
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
                  <td
                    key={cell.id}
                    className={`px-4 py-4 align-top ${getColumnClassName(cell.column.columnDef.meta)}`}
                  >
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
          isPending={isPending}
          onNavigate={(page) => {
            table.setPageIndex(page - 1);
          }}
        />
      </div>
    </div>
  );
}
