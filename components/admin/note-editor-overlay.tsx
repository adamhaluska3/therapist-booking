"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInput } from "@/lib/date-utils";

function toDateInputValue(date: Date): string {
  return formatDateInput(date);
}

function parseDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

type NoteEditorOverlayProps = {
  open?: boolean;
  initialNote?: string;
  initialDate?: Date;
  onClose?: () => void;
  onSave?: (text: string, date: Date) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

export default function NoteEditorOverlay({
  open = false,
  initialNote = "",
  initialDate = new Date(),
  onClose,
  onSave,
  onDelete,
}: NoteEditorOverlayProps) {
  const [value, setValue] = React.useState(initialNote);
  const [dateValue, setDateValue] = React.useState(
    toDateInputValue(initialDate),
  );

  React.useEffect(() => {
    setValue(initialNote);
    setDateValue(toDateInputValue(initialDate));
  }, [initialNote, initialDate]);

  const handleSave = async () => {
    await onSave?.(value, parseDateInputValue(dateValue));
  };

  const handleDelete = async () => {
    await onDelete?.();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose?.()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialNote ? "Upraviť poznámku" : "Pridať poznámku"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="note-date"
              className="text-sm font-medium text-foreground"
            >
              Dátum
            </label>
            <input
              id="note-date"
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="note-body"
              className="text-sm font-medium text-foreground"
            >
              Text poznámky
            </label>
            <Textarea
              id="note-body"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Napíšte poznámku..."
              className="min-h-28 w-full whitespace-pre-wrap wrap-anywhere"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              {onDelete ? (
                <Button variant="destructive" onClick={handleDelete}>
                  Vymazať
                </Button>
              ) : null}
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => onClose?.()}>
                Zrušiť
              </Button>
              <Button onClick={handleSave}>Uložiť</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
