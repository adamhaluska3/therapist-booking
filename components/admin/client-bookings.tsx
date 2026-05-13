"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { formatTime } from "@/lib/date-utils";
import { useEffect, useMemo, useState } from "react";
import { bookingStatusTranslate } from "@/lib/utils";
import { BOOKING_STATE_COLORS, DEFAULT_THERAPY_COLOR } from "@/lib/constants";

type BookingItem = {
  id: string;
  start: string | number | Date;
  end: string | number | Date;
  status?: string;
  notes?: string | null;
};

export default function ClientBookings({
  bookings = [],
}: {
  bookings?: BookingItem[];
}) {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [isPending, setIsPending] = useState(false);

  const now = useMemo(() => Date.now(), []);
  const rows = useMemo(
    () =>
      bookings.map((booking) => ({
        ...booking,
        start: new Date(booking.start),
        end: new Date(booking.end),
      })),
    [bookings],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((booking) =>
        filter === "upcoming"
          ? booking.start.getTime() >= now
          : booking.start.getTime() < now,
      ),
    [filter, now, rows],
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  useEffect(() => {
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, [filteredRows.length]);

  const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(
    () => [
      {
        id: "session",
        header: "Sedenie",
        cell: ({ row }) => {
          const booking = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium text-neutral-800">
                  {"Individuálna terapia"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.start.toLocaleDateString()} ·{" "}
                  {formatTime(booking.start)} — {formatTime(booking.end)}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Stav",
        meta: { className: "whitespace-nowrap" },
        cell: ({ row }) => {
          const status =
            row.original.status !== undefined && row.original.status !== null
              ? bookingStatusTranslate(row.original.status)
              : "-";
          return (
            <div className="flex items-center gap-2">
              {row.original.status && (
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      BOOKING_STATE_COLORS[row.original.status] ??
                      DEFAULT_THERAPY_COLOR,
                  }}
                />
              )}
              <div className="text-sm text-muted-foreground">{status}</div>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>História sedení</CardTitle>
        <CardDescription />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
          >
            Nadchádzajúce
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            onClick={() => setFilter("past")}
          >
            Minulé
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-surface-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-xs font-medium text-neutral-500 ${(header.column.columnDef.meta as { className?: string } | undefined)?.className ?? ""}`}
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-6 text-sm text-muted-foreground"
                  >
                    Žiadne záznamy
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-surface-200 hover:bg-surface-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-4 align-top ${(cell.column.columnDef.meta as { className?: string } | undefined)?.className ?? ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <PaginationControls
            page={pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            rangeStart={
              filteredRows.length === 0
                ? 0
                : pagination.pageIndex * pagination.pageSize + 1
            }
            rangeEnd={Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              filteredRows.length,
            )}
            total={filteredRows.length}
            isPending={isPending}
            label="sedení"
            onNavigate={(page) => {
              table.setPageIndex(page - 1);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
