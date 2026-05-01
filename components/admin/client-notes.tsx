"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

  const rows = useMemo(
    () =>
      notesState.map((note) => ({
        ...note,
        dateValue: new Date(note.date),
      })),
    [notesState],
  );

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  useEffect(() => {
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, [rows.length]);

  const columns: ColumnDef<(typeof rows)[number]>[] = [
    {
      accessorKey: "dateValue",
      header: "Dátum",
      meta: { className: "whitespace-nowrap" },
      cell: ({ getValue }) => {
        const value = getValue<Date>();

        return (
          <div className="text-sm text-neutral-600">
            {value.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "note",
      header: "Poznámka",
      cell: ({ getValue }) => {
        const note = getValue<string>();

        return (
          <div className="max-w-2xl text-sm text-neutral-800">
            <p className="truncate whitespace-pre-wrap">{note}</p>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Akcie",
      meta: { className: "whitespace-nowrap" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            Upraviť
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => confirmDelete(row.original.id)}
          >
            Vymazať
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: rows,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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

  const formatPoznamky = (n: number) => {
    if (n === 1) return "poznámka";
    if (n >= 2 && n <= 4) return "poznámky";
    return "poznámok";
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

          <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-surface-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`px-4 py-3 text-xs font-medium text-neutral-500 ${(header.column.columnDef.meta as { className?: string } | undefined)?.className ?? ""}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-6 text-sm text-muted-foreground"
                    >
                      Žiadne poznámky
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-surface-200 hover:bg-surface-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`px-4 py-4 align-top ${(cell.column.columnDef.meta as { className?: string } | undefined)?.className ?? ""}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              {rows.length} {formatPoznamky(rows.length)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ‹
              </Button>
              <div className="px-3 text-sm text-neutral-600">
                {pagination.pageIndex + 1}
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                ›
              </Button>
            </div>
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
