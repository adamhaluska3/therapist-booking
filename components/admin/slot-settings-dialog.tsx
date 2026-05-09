"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { AvailabilitySlot } from "@/db/schema"

interface SlotSettingsDialogProps {
  open: boolean
  slot: AvailabilitySlot
  onSave: (updated: AvailabilitySlot) => void
  onDelete: () => void
  onCreateBooking: (defaultStart: Date, defaultEnd: Date) => void
  onClose: () => void
}

export function SlotSettingsDialog({
  open,
  slot,
  onSave,
  onDelete,
  onCreateBooking,
  onClose,
}: SlotSettingsDialogProps) {
  const [startStr, setStartStr] = useState(() => format(slot.start, "HH:mm"))
  const [endStr, setEndStr] = useState(() => format(slot.end, "HH:mm"))
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function parseTime(base: Date, hhmm: string): Date {
    const [hh, mm] = hhmm.split(":").map(Number)
    const d = new Date(base)
    d.setHours(hh ?? 0, mm ?? 0, 0, 0)
    return d
  }

  function handleSave() {
    const start = parseTime(slot.start, startStr)
    const end = parseTime(slot.start, endStr)
    if (end <= start) return
    onSave({ ...slot, start, end })
  }

  function handleCreateBooking() {
    const start = parseTime(slot.start, startStr)
    const end = parseTime(slot.start, endStr)
    onCreateBooking(start, end > start ? end : slot.end)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Dostupný slot</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
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

          <Button variant="outline" className="w-full" onClick={handleCreateBooking}>
            + Pridať rezerváciu
          </Button>

          <Separator />

          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmingDelete(true)}
          >
            Vymazať slot
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Zrušiť</Button>
          <Button onClick={handleSave}>Uložiť</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={confirmingDelete} onOpenChange={(v) => { if (!v) setConfirmingDelete(false) }}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Vymazať slot?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-neutral-500">Vybraná udalosť bude vymazaná z kalendára.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmingDelete(false)}>Zrušiť</Button>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={onDelete}>Vymazať</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
