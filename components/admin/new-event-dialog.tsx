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

interface NewEventDialogProps {
  open: boolean
  defaultDate: Date
  onCreateSlot: (start: Date, end: Date) => void
  onCreateBooking: (start: Date, end: Date) => void
  onClose: () => void
}

export function NewEventDialog({
  open,
  defaultDate,
  onCreateSlot,
  onCreateBooking,
  onClose,
}: NewEventDialogProps) {
  const [dateStr,  setDateStr]  = useState(() => format(defaultDate, "yyyy-MM-dd"))
  const [startStr, setStartStr] = useState("09:00")
  const [endStr,   setEndStr]   = useState("10:00")

  function buildDates(): { start: Date; end: Date } | null {
    const [y, m, d] = dateStr.split("-").map(Number)
    const [sh, sm]  = startStr.split(":").map(Number)
    const [eh, em]  = endStr.split(":").map(Number)
    if ([y, m, d, sh, sm, eh, em].some(isNaN)) return null
    const start = new Date(y, m - 1, d, sh, sm, 0, 0)
    const end   = new Date(y, m - 1, d, eh, em, 0, 0)
    if (end <= start) return null
    return { start, end }
  }

  function handleSlot() {
    const dates = buildDates()
    if (!dates) return
    onCreateSlot(dates.start, dates.end)
  }

  function handleBooking() {
    const dates = buildDates()
    if (!dates) return
    onCreateBooking(dates.start, dates.end)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nová udalosť</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Dátum</Label>
            <Input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
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

          <Separator />

          <div className="grid gap-2">
            <Button onClick={handleSlot}>
              Vytvoriť dostupný čas
            </Button>
            <Button variant="outline" onClick={handleBooking}>
              Pridať rezerváciu priamo
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Zrušiť</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
