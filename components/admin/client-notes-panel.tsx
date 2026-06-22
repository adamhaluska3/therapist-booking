"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginationControls } from "@/components/admin/pagination-controls";
import NoteEditorOverlay from "@/components/admin/note-editor-overlay";
import {
  deleteUserNoteAction,
  saveUserNoteAction,
} from "@/server/user-note/actions";

type NoteItem = {
  id: string;
  date: string | number | Date;
  note: string;
};

export function ClientNotesPanel({
  userId,
  initialNotes = [],
}: {
  userId: string;
  initialNotes?: NoteItem[];
}) {
  const [notesState, setNotesState] = useState<NoteItem[]>(initialNotes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NoteItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isPending, setIsPending] = useState(false);

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
      notesState.map((note) => ({ ...note, dateValue: new Date(note.date) })),
    [notesState],
  );

  const columns: ColumnDef<(typeof rows)[number]>[] = [
    {
      accessorKey: "dateValue",
      header: "Dátum",
      meta: { className: "whitespace-nowrap" },
      cell: ({ getValue }) => (
        <div className="text-sm text-neutral-600">
          {getValue<Date>().toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: "Poznámka",
      cell: ({ getValue }) => (
        <div className="max-w-2xl max-h-60 text-sm text-neutral-800 truncate">
          <p className="truncate whitespace-pre-wrap">{getValue<string>()}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Akcie",
      meta: { className: "whitespace-nowrap" },
      cell: ({ row }) => (
        <div className="flex flex-col md:flex-row items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
            disabled={isPending}
          >
            Detail
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => confirmDelete(row.original.id)}
            disabled={isPending}
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
    setIsPending(true);
    try {
      await deleteUserNoteAction({ id });
      if (editing?.id === id) {
        setOpen(false);
        setEditing(null);
      }
      toast.success("Poznámka vymazaná");
    } catch (e) {
      console.error(e);
      setNotesState(prev);
      toast.error("Nepodarilo sa vymazať poznámku, skúste to prosím znovu");
    } finally {
      setPendingDeleteId(null);
      setIsPending(false);
    }
  };

  const handleSave = async (text: string, date: Date) => {
    if (editing) {
      const prev = notesState;
      const prevEditing = editing;
      setNotesState((s) =>
        s.map((it) =>
          it.id === editing.id ? { ...it, note: text, date } : it,
        ),
      );
      setEditing((curr) =>
        curr && curr.id === editing.id ? { ...curr, note: text, date } : curr,
      );
      setIsPending(true);
      try {
        await saveUserNoteAction({ id: editing.id, userId, date, note: text });
        toast.success("Poznámka aktualizována");
      } catch (e) {
        console.error(e);
        setNotesState(prev);
        setEditing(prevEditing);
        toast.error(
          "Nepodarilo sa aktualizovať poznámku, skúste to prosím znovu",
        );
      } finally {
        setIsPending(false);
      }
    } else {
      setOpen(false);
      const tempId = "temp-" + Math.random().toString(36).slice(2);
      const prev = notesState;
      setNotesState((s) => [{ id: tempId, date, note: text }, ...s]);
      setIsPending(true);
      try {
        const newId = await saveUserNoteAction({ userId, date, note: text });
        setNotesState((s) =>
          s.map((it) => (it.id === tempId ? { ...it, id: newId } : it)),
        );
        toast.success("Poznámka pridaná");
      } catch (e) {
        console.error(e);
        setNotesState(prev);
        toast.error("Nepodarilo sa pridať poznámku, skúste to prosím znovu");
      } finally {
        setIsPending(false);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Súkromné poznámky</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex justify-end">
            <Button variant="outline" onClick={openNew} disabled={isPending}>
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

          <div className="mt-4">
            <PaginationControls
              page={pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              rangeStart={
                rows.length === 0
                  ? 0
                  : pagination.pageIndex * pagination.pageSize + 1
              }
              rangeEnd={Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                rows.length,
              )}
              total={rows.length}
              isPending={isPending}
              label="poznámok"
              onNavigate={(page) => table.setPageIndex(page - 1)}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
        readOnlyInitially={Boolean(editing)}
        initialNote={editing?.note}
        initialDate={editing ? new Date(editing.date) : new Date()}
        onClose={() => setOpen(false)}
        onDelete={editing ? () => confirmDelete(editing.id) : undefined}
        onSave={handleSave}
      />
    </>
  );
}
