"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function NoteDialog({
  note,
  children,
}: {
  note: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {children}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Poznámka</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-700 leading-relaxed">{note}</p>
          <DialogClose render={<Button variant="outline" />}>
            Zavrieť
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
