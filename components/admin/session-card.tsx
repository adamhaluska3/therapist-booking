"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Check, Video, Pencil, X, Clock } from "lucide-react"
import type { BookingWithUser } from "@/db/schema"
import { formatTime, formatMonthShort } from "@/lib/date-utils"
import { getInitials } from "@/lib/formatting"
import { updateBookingStatus } from "@/server/actions"
import { UNKNOWN_CLIENT } from "@/lib/constants"
import { AdminCard } from "@/components/admin/admin-card"
import { EditBookingDialog } from "@/components/admin/edit-booking-dialog"
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

type ConfirmAction = "finished" | "cancelled"

const CONFIRM_CONFIG: Record<ConfirmAction, {
  title: string
  description: (name: string) => string
  label: string
  className: string
}> = {
  finished: {
    title: "Označiť ako absolvované?",
    description: (name) => `Sedenie s klientom ${name} bude označené ako absolvované a zmizne zo zoznamu.`,
    label: "Potvrdiť",
    className: "bg-brand-600 hover:bg-brand-700 text-white",
  },
  cancelled: {
    title: "Zrušiť sedenie?",
    description: (name) => `Sedenie s klientom ${name} bude zrušené a zmizne zo zoznamu.`,
    label: "Zrušiť sedenie",
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
}


export function SessionCard({ booking }: { booking: BookingWithUser }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const clientName = booking.user?.nickname ?? booking.user?.name ?? UNKNOWN_CLIENT
  const config = confirmDialog ? CONFIRM_CONFIG[confirmDialog] : null

  function handleConfirm() {
    if (!confirmDialog) return
    startTransition(async () => {
      await updateBookingStatus(booking.id, confirmDialog)
      setConfirmDialog(null)
      void queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] })
      router.refresh()
    })
  }

  return (
    <>
      <AdminCard className="lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center gap-4 lg:contents">
          <div className="w-12 shrink-0 text-center border-r border-surface-200 pr-4">
            <p className="text-2xl font-bold text-neutral-800 leading-none">{booking.start.getDate()}</p>
            <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">{formatMonthShort(booking.start)}</p>
          </div>

          {booking.userId ? (
            <Link
              href={`/admin/clients/${booking.userId}`}
              className="flex items-center gap-3 flex-1 min-w-0 group"
            >
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
                {getInitials(clientName)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-neutral-800 text-sm leading-tight truncate group-hover:text-brand-700 transition-colors">{clientName}</p>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                  <Clock size={11} className="shrink-0" />
                  <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
                {getInitials(clientName)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-neutral-800 text-sm leading-tight truncate">{clientName}</p>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                  <Clock size={11} className="shrink-0" />
                  <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 lg:ml-auto lg:shrink-0">
          <button
            onClick={() => setConfirmDialog("finished")}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-500 hover:bg-surface-50 transition-colors"
          >
            <Check size={13} />
            <span>Absolvované</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700 transition-colors">
            <Video size={13} />
            <span>Pripojiť sa</span>
          </button>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 hover:bg-surface-50 transition-colors"
          >
            <Pencil size={13} />
            <span>Upraviť</span>
          </button>
          <button
            onClick={() => setConfirmDialog("cancelled")}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={13} />
            <span>Zrušiť</span>
          </button>
        </div>
      </AdminCard>

      <EditBookingDialog booking={booking} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={confirmDialog !== null} onOpenChange={(open) => { if (!open) setConfirmDialog(null) }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{config?.title}</DialogTitle>
            <DialogDescription>{config?.description(clientName)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />} disabled={isPending}>
              Späť
            </DialogClose>
            <Button onClick={handleConfirm} disabled={isPending} className={config?.className}>
              {isPending ? "Ukladám..." : config?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
