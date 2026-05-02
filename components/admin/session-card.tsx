"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Video, Pencil, X, Clock } from "lucide-react"
import type { BookingWithUser } from "@/db/schema"
import { formatTime, formatMonthShort } from "@/lib/date-utils"
import { getInitials } from "@/lib/formatting"
import { updateBookingStatus } from "@/server/actions"
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
  const [isPending, startTransition] = useTransition()
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const clientName = booking.user?.nickname ?? booking.user?.name ?? "Neznámy klient"
  const config = confirmDialog ? CONFIRM_CONFIG[confirmDialog] : null

  function handleConfirm() {
    if (!confirmDialog) return
    startTransition(async () => {
      await updateBookingStatus(booking.id, confirmDialog)
      setConfirmDialog(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl bg-white border border-surface-200 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <div className="flex items-center gap-4 sm:contents">
          <div className="w-12 shrink-0 text-center sm:w-16 sm:border-r sm:border-surface-200 sm:pr-6">
            <p className="text-2xl font-bold text-neutral-800 leading-none sm:text-3xl">{booking.start.getDate()}</p>
            <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">{formatMonthShort(booking.start)}</p>
          </div>

          <div className="flex items-center gap-3 flex-1 sm:w-44 sm:flex-none sm:shrink-0">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
              {getInitials(clientName)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-neutral-800 text-sm leading-tight">{clientName}</p>
              <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5 sm:hidden">
                <Clock size={11} className="shrink-0" />
                <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock size={13} className="shrink-0" />
            <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setConfirmDialog("finished")}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-500 hover:bg-surface-50 transition-colors"
          >
            <Check size={13} />
            <span className="hidden sm:inline">Absolvované</span>
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
            <span className="hidden sm:inline">Upraviť</span>
          </button>
          <button
            onClick={() => setConfirmDialog("cancelled")}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={13} />
            <span className="hidden sm:inline">Zrušiť</span>
          </button>
        </div>
      </div>

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
