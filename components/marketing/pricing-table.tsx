"use client";

import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { BookingType } from "@/db/schema";
import { DEFAULT_DURATION_MINUTES } from "@/lib/constants";

const columnHelper = createColumnHelper<BookingType>();

const columns = [
  columnHelper.accessor("name", {
    header: "Služba",
    cell: (info) => (
      <p className="font-serif text-lg font-medium text-brand-900">
        {info.getValue()}
      </p>
    ),
  }),
  columnHelper.display({
    id: "duration",
    header: "Čas",
    cell: () => (
      <p className="text-sm text-neutral-500">{DEFAULT_DURATION_MINUTES} min</p>
    ),
  }),
  columnHelper.accessor("price", {
    header: "Cena",
    cell: (info) => {
      const price = info.getValue();
      return (
        <p className="text-sm text-neutral-500">
          {price != null ? `${Math.round(price / 100)}€` : "—"}
        </p>
      );
    },
  }),
  columnHelper.display({
    id: "action",
    header: "Akcia",
    cell: (info) => {
      const service = info.row.original;
      const isBookable = service.name.toLowerCase() === "psychoterapia";
      return isBookable ? (
        <Link href="/booking">
          <Button className="h-auto w-full rounded-full bg-brand-700 px-5 py-2 text-sm text-white hover:bg-brand-800 sm:w-auto">
            Rezervovať →
          </Button>
        </Link>
      ) : (
        <Link href="/#contact">
          <Button
            variant="outline"
            className="h-auto w-full rounded-full border-neutral-300 px-5 py-2 text-sm text-neutral-700 sm:w-auto"
          >
            Mám záujem
          </Button>
        </Link>
      );
    },
  }),
];

export function PricingTable({ services }: { services: BookingType[] }) {
  const table = useReactTable({
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (services.length === 0) {
    return (
      <p className="px-8 py-12 text-center text-sm text-neutral-400">
        Žiadne služby nie sú momentálne k dispozícii.
      </p>
    );
  }

  return (
    <>
      <div className="sm:hidden divide-y divide-surface-100">
        {table.getRowModel().rows.map((row) => {
          const service = row.original;
          const price =
            service.price != null ? `${Math.round(service.price / 100)}€` : "—";
          const isBookable = service.name.toLowerCase() === "psychoterapia";
          return (
            <div key={row.id} className={isBookable ? "bg-brand-50/40" : ""}>
              <div className="px-6 pt-6 pb-4">
                <p className="font-serif text-2xl font-medium text-brand-900">
                  {service.name}
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-5">
                <div className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-3 text-center">
                  <p className="text-xs text-neutral-400 mb-1">Trvanie</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {DEFAULT_DURATION_MINUTES} min
                  </p>
                </div>
                <div className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-3 text-center">
                  <p className="text-xs text-neutral-400 mb-1">Cena</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {price}
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6">
                {isBookable ? (
                  <Link href="/booking">
                    <Button className="h-auto w-full rounded-full bg-brand-700 px-5 py-2 text-sm text-white hover:bg-brand-800">
                      Rezervovať →
                    </Button>
                  </Link>
                ) : (
                  <Link href="/#contact">
                    <Button
                      variant="outline"
                      className="h-auto w-full rounded-full border-neutral-300 px-5 py-2 text-sm text-neutral-700"
                    >
                      Mám záujem
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <table className="hidden w-full text-sm sm:table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-surface-200">
              {headerGroup.headers.map((header, i) => (
                <th
                  key={header.id}
                  className={`px-8 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-400 ${i === headerGroup.headers.length - 1 ? "text-right" : "text-left"}`}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-surface-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, i) => (
                <td
                  key={cell.id}
                  className={`px-8 py-7 ${i === row.getVisibleCells().length - 1 ? "text-right" : ""}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
