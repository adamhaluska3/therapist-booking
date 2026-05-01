"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NoteEditorOverlay from "@/components/admin/note-editor-overlay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

type NoteItem = {
  id: string;
  date: string | number | Date;
  note: string;
};

export default function ClientNotes({
  notes = [],
  userId,
  onAdd,
  onUpdate,
  onDelete,
}: {
  notes?: NoteItem[];
  userId?: string;
  onAdd?: (text: string, date: Date) => Promise<string | void> | string | void;
  onUpdate?: (
    id: string,
    text: string,
    date: Date,
  ) => Promise<string | void> | string | void;
  onDelete?: (id: string) => Promise<boolean | void> | boolean | void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NoteItem | null>(null);
  const [notesState, setNotesState] = useState<NoteItem[]>(notes);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setNotesState(notes);
  }, [notes]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (n: NoteItem) => {
    setEditing(n);
    setOpen(true);
  };

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setConfirmOpen(false);

    const prev = notesState;
    setNotesState((s) => s.filter((x) => x.id !== id));

    try {
      await onDelete?.(id);
    } catch (e) {
      console.error(e);
      setNotesState(prev);
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Súkromné poznámky mentora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex justify-end">
            <Button variant="outline" onClick={openNew}>
              + Pridať poznámku
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {notesState.length === 0 && (
              <div className="text-muted-foreground">Žiadne poznámky</div>
            )}

            {notesState.map((n) => (
              <div key={n.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {new Date(n.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(n)}
                    >
                      Upraviť
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(n.id)}
                    >
                      Vymazať
                    </Button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap w-[80%]">
                  <p className="truncate">{n.note}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(v) => setConfirmOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdiť vymazanie</DialogTitle>
          </DialogHeader>
          <div className="py-2">Naozaj chcete vymazať túto poznámku?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Zrušiť
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Vymazať
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NoteEditorOverlay
        open={open}
        initialNote={editing?.note}
        initialDate={editing ? new Date(editing.date) : new Date()}
        onClose={() => setOpen(false)}
        onDelete={editing ? () => confirmDelete(editing.id) : undefined}
        onSave={async (text: string, date: Date) => {
          setOpen(false);
          if (editing) {
            const prev = notesState;
            setNotesState((s) =>
              s.map((it) =>
                it.id === editing.id ? { ...it, note: text, date } : it,
              ),
            );
            try {
              if (onUpdate) {
                await onUpdate(editing.id, text, date);
              } else {
                await fetch("/api/notes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: editing.id,
                    userId,
                    date: (date as Date).toISOString(),
                    note: text,
                  }),
                });
              }
            } catch (e) {
              console.error(e);
              setNotesState(prev);
            }
          } else {
            const tempId = "temp-" + Math.random().toString(36).slice(2);
            const newNote: NoteItem = { id: tempId, date, note: text };
            const prev = notesState;
            setNotesState((s) => [newNote, ...s]);
            try {
              if (onAdd) {
                const returned = await onAdd(text, date);
                if (typeof returned === "string") {
                  setNotesState((s) =>
                    s.map((it) =>
                      it.id === tempId ? { ...it, id: returned } : it,
                    ),
                  );
                }
              } else {
                await fetch("/api/notes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId,
                    date: (date as Date).toISOString(),
                    note: text,
                  }),
                });
              }
            } catch (e) {
              console.error(e);
              setNotesState(prev);
            }
          }
        }}
      />
    </>
  );
}
