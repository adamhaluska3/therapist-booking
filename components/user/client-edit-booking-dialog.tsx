"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { booking, BookingType } from "@/db/schema";
import { Button } from "@base-ui/react";
import { InferSelectModel } from "drizzle-orm";

import React, { useState } from "react"

export type ClientEditBookingDialogProps = {
    item: InferSelectModel<typeof booking> & { bookingType: BookingType | null }
    children: React.ReactNode
}

export const ClientEditBookingDialog = ({item, children}: ClientEditBookingDialogProps) => {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger nativeButton={false} render={<span>{children}</span>} />
            <DialogContent className="max-w-fit">
                <DialogHeader>
                    <DialogTitle>Úprava rezervácie</DialogTitle>
                </DialogHeader>
                <div className="p-10 flex flex-col gap-5">
                    <span>Ako meniť termín: admin/change-requests? Po zaplatení a zrušení: admin/to-return?</span>
                </div>

                <DialogFooter>
                    <DialogClose
                        render={<Button variant="outline" />}
                    >
                        Zatvor
                    </DialogClose>
                    
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}