"use client";

import { useState, useTransition, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  ColumnDef,
  getCoreRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { getAbsolvedBookings } from "@/server/queries/absolved-bookings";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("sk-SK", { style: "currency", currency: "EUR" });
}

type Row = Awaited<ReturnType<typeof getAbsolvedBookings>>["rows"][number];

interface Props {
  initialRows: Row[];
  initialTotal: number;
  userId: string;
  pageSize: number;
}

export function AbsolvedBookingsTable({ initialRows, initialTotal, userId, pageSize }: Props) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const columns = useMemo<ColumnDef<Row, any>[]>(
    () => [
      {
        accessorKey: "bookingTypeName",
        header: "Typ sedenia",
        cell: ({ getValue }) => (
          <span className="font-medium text-brand-800">{getValue() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "start",
        header: "Dátum",
        cell: ({ getValue }) =>
          (getValue() as Date).toLocaleDateString("sk-SK", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
      },
      {
        accessorKey: "variableSymbol",
        header: "Variabilný symbol",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-neutral-500">{getValue() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "price",
        header: () => <span className="block text-right">Cena</span>,
        cell: ({ getValue }) => (
          <span className="block text-right tabular-nums text-neutral-700">
            {getValue() != null ? formatPrice(getValue() as number) : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const navigate = (nextPage: number, nextFrom = from, nextTo = to) => {
    startTransition(async () => {
      const result = await getAbsolvedBookings({
        userId,
        page: nextPage,
        pageSize,
        from: nextFrom || undefined,
        to: nextTo || undefined,
      });
      setRows(result.rows);
      setTotal(result.total);
      setPage(nextPage);
    });
  };

  const handleFilterChange = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    navigate(1, nextFrom, nextTo);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500 uppercase tracking-wide">Od</label>
          <input
            type="date"
            value={from}
            onChange={(e) => handleFilterChange(e.target.value, to)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500 uppercase tracking-wide">Do</label>
          <input
            type="date"
            value={to}
            onChange={(e) => handleFilterChange(from, e.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        {(from || to) && (
          <button
            onClick={() => handleFilterChange("", "")}
            className="text-xs text-brand-600 underline self-end pb-2"
          >
            Zrušiť filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
        {isPending ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} className="animate-spin text-neutral-300" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-neutral-400 py-10 text-center">Žiadne záznamy</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-neutral-500">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-surface-200 hover:bg-surface-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-neutral-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          {total === 0
            ? "Žiadne výsledky"
            : `Zobrazené ${rangeStart}–${rangeEnd} z ${total} záznamov`}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(page - 1)}
            disabled={page <= 1 || isPending}
            className="rounded-md border border-surface-200 p-1.5 text-neutral-500 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => navigate(page + 1)}
            disabled={page >= totalPages || isPending}
            className="rounded-md border border-surface-200 p-1.5 text-neutral-500 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
