"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { Booking } from "@/db/schema"

interface BookingDialogProps {
  open: boolean
  booking?: Booking
  defaultStart?: Date
  defaultEnd?: Date
  onSave: (booking: Booking) => void
  onDelete?: () => void
  onClose: () => void
}

export function BookingDialog({
  open,
  booking,
  defaultStart,
  defaultEnd,
  onSave,
  onDelete,
  onClose,
}: BookingDialogProps) {
  const base = booking?.start ?? defaultStart ?? new Date()

  const [clientName, setClientName] = useState(booking?.clientName ?? "")
  const [notes,      setNotes]      = useState(booking?.notes ?? "")
  const [startStr,   setStartStr]   = useState(() => format(booking?.start ?? defaultStart ?? new Date(), "HH:mm"))
  const [endStr,     setEndStr]     = useState(() => format(booking?.end   ?? defaultEnd   ?? new Date(), "HH:mm"))

  const isEdit = !!booking

  function parseTime(hhmm: string): Date {
    const [hh, mm] = hhmm.split(":").map(Number)
    const d = new Date(base)
    d.setHours(hh ?? 0, mm ?? 0, 0, 0)
    return d
  }

  function handleSave() {
    const start = parseTime(startStr)
    const end   = parseTime(endStr)
    if (end <= start) return

    onSave({
      id:         booking?.id ?? crypto.randomUUID(),
      start,
      end,
      status:     booking?.status ?? "confirmed",
      clientName: clientName.trim() || null,
      notes:      notes.trim() || null,
      userId:     booking?.userId ?? null,
      createdAt:  booking?.createdAt ?? new Date(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Nastavenia terapie" : "Nová terapia"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Meno klienta</Label>
            <Input
              placeholder="Napr. Anna Kováčová"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Začiatok</Label>
              <Input
                type="time"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Koniec</Label>
              <Input
                type="time"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>
              Poznámky <span className="text-gray-400 font-normal">(voliteľné)</span>
            </Label>
            <Textarea
              rows={2}
              placeholder="Interné poznámky..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {isEdit && onDelete && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={onDelete}
              >
                Vymazať terapiu
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Zrušiť</Button>
          <Button onClick={handleSave}>{isEdit ? "Uložiť" : "Vytvoriť"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
