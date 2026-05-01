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
  readOnlyInitially?: boolean;
  initialNote?: string;
  initialDate?: Date;
  onClose?: () => void;
  onSave?: (text: string, date: Date) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

export default function NoteEditorOverlay({
  open = false,
  readOnlyInitially = false,
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
  const [isEditing, setIsEditing] = React.useState(!readOnlyInitially);

  React.useEffect(() => {
    setValue(initialNote);
    setDateValue(toDateInputValue(initialDate));
    setIsEditing(!readOnlyInitially);
  }, [initialNote, initialDate, readOnlyInitially]);

  const handleSave = async () => {
    await onSave?.(value, parseDateInputValue(dateValue));
  };

  const handleDelete = async () => {
    await onDelete?.();
  };

  const handleBackToDetail = () => {
    setValue(initialNote);
    setDateValue(toDateInputValue(initialDate));
    setIsEditing(false);
  };

  const title = readOnlyInitially
    ? isEditing
      ? "Upraviť poznámku"
      : "Detail poznámky"
    : "Pridať poznámku";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose?.()}>
      <DialogContent className="flex h-auto min-h-[50vh]! w-[50vw]! max-h-[75vh]! max-w-[50vw]! flex-col overflow-hidden sm:max-w-[50vw]!">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
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
                className="h-9 rounded-md ml-2 border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col space-y-1">
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
                className="min-h-0 flex-1 w-full whitespace-pre-wrap wrap-anywhere"
              />
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col space-y-3 text-sm">
            <div>
              <div className="mb-1 font-medium text-foreground">Dátum</div>
              <div className="text-muted-foreground">
                {initialDate.toLocaleDateString()}
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-1 font-medium text-foreground">
                Text poznámky
              </div>
              <p className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap text-muted-foreground">
                {initialNote || "-"}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="p-2 sm:p-2">
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              {onDelete ? (
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  Vymazať
                </Button>
              ) : null}
            </div>
            <div className="ml-auto flex gap-2">
              {readOnlyInitially && !isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onClose?.()}
                  >
                    Zavrieť
                  </Button>
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    Upraviť
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (readOnlyInitially) {
                        handleBackToDetail();
                        return;
                      }
                      onClose?.();
                    }}
                  >
                    {readOnlyInitially ? "Späť" : "Zrušiť"}
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Uložiť
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
