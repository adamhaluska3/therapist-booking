"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList } from "lucide-react"
import type { Booking } from "@/db/schema"
import { formatTime, formatBookingDate } from "@/lib/date-utils"
import { getInitials } from "@/lib/formatting"
import { BOOKINGS_PAGE_SIZE } from "@/lib/constants"
import { confirmBooking, updateBookingStatus } from "@/server/actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/admin/pagination-controls"

interface Props {
  bookings: Booking[]
  total: number
  page: number
}

export function RequestsView({ bookings, total, page }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / BOOKINGS_PAGE_SIZE))
  const rangeStart = bookings.length === 0 ? 0 : (page - 1) * BOOKINGS_PAGE_SIZE + 1
  const rangeEnd = (page - 1) * BOOKINGS_PAGE_SIZE + bookings.length

  function navigatePage(newPage: number) {
    router.push(`/admin/requests?page=${newPage}`)
  }

  function handleConfirm(id: string) {
    startTransition(async () => {
      await confirmBooking(id)
      router.refresh()
    })
  }

  function handleCancelConfirm() {
    if (!cancelTarget) return
    startTransition(async () => {
      await updateBookingStatus(cancelTarget.id, "cancelled")
      setCancelTarget(null)
      router.refresh()
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
          Administratíva
        </p>
        <h1
          className="font-serif text-4xl font-bold text-neutral-800 mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Nové žiadosti o terapiu
        </h1>
      </div>

      {/* Stats card */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-surface-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
          <ClipboardList size={22} className="text-brand-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-neutral-800">
            Čakajúce žiadosti: {total}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Celkový počet nespracovaných žiadostí
          </p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {bookings.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">
            Žiadne nové žiadosti
          </p>
        )}
        {bookings.map((b) => {
          const clientName = b.clientName ?? "Neznámy klient"
          return (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-xl border border-surface-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {getInitials(clientName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800">{clientName}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {formatBookingDate(b.start)},{" "}
                    {formatTime(b.start)} – {formatTime(b.end)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirm(b.id)}
                  disabled={isPending}
                  className="flex-1 rounded-full bg-brand-600 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                >
                  Potvrdiť
                </button>
                <button
                  onClick={() => setCancelTarget(b)}
                  disabled={isPending}
                  className="flex-1 rounded-full border border-surface-200 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile pagination */}
      <div className="mt-4 sm:hidden">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          total={total}
          isPending={isPending}
          onNavigate={navigatePage}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Klient
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Termín
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Akcie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-sm text-neutral-400"
                >
                  Žiadne nové žiadosti
                </td>
              </tr>
            )}
            {bookings.map((b) => {
              const clientName = b.clientName ?? "Neznámy klient"
              return (
                <tr
                  key={b.id}
                  className="transition-colors hover:bg-surface-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {getInitials(clientName)}
                      </div>
                      <span className="font-medium text-neutral-800">
                        {clientName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-800">
                      {formatBookingDate(b.start)}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatTime(b.start)} – {formatTime(b.end)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleConfirm(b.id)}
                        disabled={isPending}
                        className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                      >
                        Potvrdiť
                      </button>
                      <button
                        onClick={() => setCancelTarget(b)}
                        disabled={isPending}
                        className="rounded-full border border-surface-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
                      >
                        Zrušiť
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="border-t border-surface-100 px-6 py-3">
          <PaginationControls
            page={page}
            totalPages={totalPages}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={total}
            isPending={isPending}
            onNavigate={navigatePage}
          />
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Zrušiť žiadosť?</DialogTitle>
            <DialogDescription>
              Žiadosť klienta{" "}
              <span className="font-medium text-neutral-800">
                {cancelTarget?.clientName ?? "Neznámy klient"}
              </span>{" "}
              bude zamietnutá a označená ako zrušená.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />} disabled={isPending}>
              Späť
            </DialogClose>
            <Button
              onClick={handleCancelConfirm}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? "Ukladám..." : "Zrušiť žiadosť"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
