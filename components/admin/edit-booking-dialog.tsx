"use client"

import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { BookingWithUser } from "@/db/schema"
import { formatDateInput, formatTime, buildDate } from "@/lib/date-utils"
import { editBookingSchema, type EditBookingFormValues } from "@/components/admin/edit-booking-schema"
import { updateBookingTime } from "@/server/actions"
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

const inputClass = "rounded-md border border-surface-200 px-3 py-2 text-sm outline-none focus:border-brand-400 transition-colors w-full"
const errorClass = "text-xs text-red-500 mt-1"


export function EditBookingDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: BookingWithUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditBookingFormValues>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      date: formatDateInput(booking.start),
      startTime: formatTime(booking.start),
      endTime: formatTime(booking.end),
    },
  })

  async function onSubmit(values: EditBookingFormValues) {
    const result = await updateBookingTime(
      booking.id,
      buildDate(values.date, values.startTime),
      buildDate(values.date, values.endTime),
    )

    if (!result.ok) {
      setError("root", { message: result.error ?? "Nastala chyba." })
      return
    }

    onOpenChange(false)
    void queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Upraviť sedenie</DialogTitle>
          <DialogDescription>
            Klient: <span className="font-medium text-neutral-700">{booking.user?.nickname ?? booking.user?.name ?? "Neznámy klient"}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-600">Dátum</label>
            <input type="date" {...register("date")} className={inputClass} />
            {errors.date && <p className={errorClass}>{errors.date.message}</p>}
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-neutral-600">Začiatok</label>
              <input type="time" {...register("startTime")} className={inputClass} />
              {errors.startTime && <p className={errorClass}>{errors.startTime.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-neutral-600">Koniec</label>
              <input type="time" {...register("endTime")} className={inputClass} />
              {errors.endTime && <p className={errorClass}>{errors.endTime.message}</p>}
            </div>
          </div>

          {errors.root && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />} disabled={isSubmitting}>
              Zrušiť
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white">
              {isSubmitting ? "Ukladám..." : "Uložiť"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
