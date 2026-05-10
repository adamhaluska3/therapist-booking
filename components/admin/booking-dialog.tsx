"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Check, ChevronDown, Clock, Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Booking, BookingType } from "@/db/schema";
import { BOOKING_TYPE_COLORS as _btColors } from "@/components/admin/calendar-event-card";
import { BookingWithUser } from "@/server/booking/schema";
import { UserOption } from "@/server/user/schema";
import { createNonOAuthUser } from "@/server/user/mutations";
import { Textarea } from "../ui/textarea";

const BOOKING_TYPE_PILL_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(_btColors).map(([id, v]) => [id, v.bg]),
);

interface BookingDialogProps {
  open: boolean;
  booking?: BookingWithUser;
  defaultStart?: Date;
  defaultEnd?: Date;
  users: UserOption[];
  bookingTypes: BookingType[];
  onSave: (booking: Booking) => void;
  onDelete?: () => void;
  onClose: () => void;
  onUserCreated: (user: UserOption) => void;
}

export function BookingDialog({
  open,
  booking,
  defaultStart,
  defaultEnd,
  users: initialUsers,
  bookingTypes,
  onSave,
  onDelete,
  onClose,
  onUserCreated,
}: BookingDialogProps) {
  const base = booking?.start ?? defaultStart ?? new Date();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    booking?.userId ?? null,
  );
  const [selectedBookingTypeId, setSelectedBookingTypeId] = useState<
    string | null
  >(booking?.bookingTypeId ?? bookingTypes[0]?.id ?? null);
  const [startStr, setStartStr] = useState(() =>
    format(booking?.start ?? defaultStart ?? new Date(), "HH:mm"),
  );
  const [endStr, setEndStr] = useState(() =>
    format(booking?.end ?? defaultEnd ?? new Date(), "HH:mm"),
  );
  const [note, setNote] = useState(booking?.note ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [locationType, setLocationType] = useState<"onsite" | "online">(
    booking?.locationType ?? "onsite",
  );

  // Local list: prop users + newly created users (to show immediately after creation)
  const [pendingUsers, setPendingUsers] = useState<UserOption[]>([]);
  const allUsers = useMemo(() => {
    const seen = new Set(initialUsers.map((u) => u.id));
    return [...initialUsers, ...pendingUsers.filter((u) => !seen.has(u.id))];
  }, [initialUsers, pendingUsers]);

  // Combobox state
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Create user dialog state
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const [createUserLoading, setCreateUserLoading] = useState(false);

  const isEdit = !!booking;

  const selectedUser = allUsers.find((u) => u.id === selectedUserId) ?? null;

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) =>
        (u.nickname ?? u.name).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [allUsers, searchQuery]);

  // Close combobox when clicking outside
  useEffect(() => {
    if (!comboboxOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(e.target as Node)
      ) {
        setComboboxOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [comboboxOpen]);

  // Focus search input when combobox opens
  useEffect(() => {
    if (comboboxOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [comboboxOpen]);

  function parseTime(hhmm: string): Date {
    const [hh, mm] = hhmm.split(":").map(Number);
    const d = new Date(base);
    d.setHours(hh ?? 0, mm ?? 0, 0, 0);
    return d;
  }

  function handleSave() {
    const start = parseTime(startStr);
    const end = parseTime(endStr);
    if (end <= start) return;

    onSave({
      id: booking?.id ?? crypto.randomUUID(),
      start,
      end,
      status: booking?.status ?? "confirmed",
      locationType,
      price: booking?.price ?? null,
      userId: selectedUserId,
      bookingTypeId: selectedBookingTypeId,
      note: note.trim() || null,
      createdAt: booking?.createdAt ?? new Date(),
      variableSymbol: null,
      meetLink: null
    });
  }

  function handleOpenCreateUser() {
    setComboboxOpen(false);
    setCreateUserOpen(true);
  }

  async function handleCreateUser() {
    setCreateUserError("");
    setCreateUserLoading(true);
    const result = await createNonOAuthUser(
      newUserName,
      newUserEmail,
      newUserPhone || undefined,
    );
    setCreateUserLoading(false);

    if (!result.ok || !result.user) {
      setCreateUserError(result.error ?? "Chyba pri vytváraní klienta.");
      return;
    }

    const newUser = result.user;
    setPendingUsers((prev) => [...prev, newUser]);
    setSelectedUserId(newUser.id);
    onUserCreated(newUser);
    setCreateUserOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle>
                {isEdit ? "Nastavenia terapie" : "Nová terapia"}
              </DialogTitle>
              {isEdit && booking?.status && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    booking.status === "confirmed"
                      ? "bg-brand-100 text-brand-700"
                      : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-surface-100 text-neutral-500"
                  }`}
                >
                  {booking.status === "confirmed" && (
                    <Check className="h-3 w-3" />
                  )}
                  {booking.status === "pending" && (
                    <Clock className="h-3 w-3" />
                  )}
                  {booking.status === "confirmed"
                    ? "Potvrdené"
                    : booking.status === "pending"
                      ? "Čaká na potvrdenie"
                      : "Dokončené"}
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* User select combobox */}
            <div className="grid gap-1.5">
              <Label>Klient</Label>
              <div ref={comboboxRef} className="relative">
                <button
                  type="button"
                  onClick={() => setComboboxOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-left transition-colors hover:bg-surface-50 focus:outline-none focus:border-brand-400"
                >
                  <span
                    className={
                      selectedUser ? "text-neutral-800" : "text-neutral-400"
                    }
                  >
                    {selectedUser
                      ? (selectedUser.nickname ?? selectedUser.name)
                      : "Vybrať klienta..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                </button>

                {comboboxOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border border-surface-200 bg-white shadow-lg">
                    {/* Search */}
                    <div className="flex items-center gap-2 border-b border-surface-200 px-3 py-2">
                      <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Hľadať klienta..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 text-sm outline-none bg-transparent placeholder:text-neutral-400"
                      />
                    </div>

                    {/* User list */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredUsers.length === 0 && (
                        <p className="px-3 py-2 text-sm text-neutral-400">
                          Žiadni klienti
                        </p>
                      )}
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setComboboxOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 text-left"
                        >
                          <Check
                            className={`h-3.5 w-3.5 shrink-0 ${selectedUserId === u.id ? "text-brand-600" : "text-transparent"}`}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-800 truncate">
                              {u.nickname ?? u.name}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                              {u.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Create new client */}
                    <div className="border-t border-surface-200">
                      <button
                        type="button"
                        onClick={handleOpenCreateUser}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 font-medium"
                      >
                        <UserPlus className="h-3.5 w-3.5 shrink-0" />
                        Vytvoriť nového klienta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear selection */}
              {selectedUserId && (
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 text-left w-fit"
                >
                  Zrušiť výber
                </button>
              )}
            </div>

            {/* Booking type select */}
            <div className="grid gap-1.5">
              <Label>Typ stretnutia</Label>
              <div className="flex flex-wrap gap-2">
                {bookingTypes.map((bt) => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() =>
                      setSelectedBookingTypeId(
                        selectedBookingTypeId === bt.id ? null : bt.id,
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedBookingTypeId === bt.id
                        ? "text-white border-transparent"
                        : "text-neutral-600 border-surface-200 bg-white hover:bg-surface-50"
                    }`}
                    style={
                      selectedBookingTypeId === bt.id
                        ? {
                            backgroundColor:
                              BOOKING_TYPE_PILL_COLORS[bt.id] ?? "#427a5c",
                          }
                        : undefined
                    }
                  >
                    {bt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Location type */}
            <div className="grid gap-1.5">
              <Label>Forma stretnutia</Label>
              <div className="flex gap-2">
                {(["onsite", "online"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLocationType(type)}
                    className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                      locationType === type
                        ? "bg-brand-600 text-white border-transparent"
                        : "text-neutral-600 border-surface-200 bg-white hover:bg-surface-50"
                    }`}
                  >
                    {type === "onsite" ? "Na mieste" : "Online"}
                  </button>
                ))}
              </div>
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

            <div className="grid gap-1.5">
              <Label>Poznámka</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {isEdit && onDelete && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Vymazať terapiu
                </Button>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Zrušiť
            </Button>
            <Button onClick={handleSave} disabled={!isEdit && !selectedUserId}>
              {isEdit ? "Uložiť" : "Vytvoriť"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create new client dialog */}
      <Dialog
        open={createUserOpen}
        onOpenChange={(v) => {
          if (!v) {
            setCreateUserOpen(false);
            setCreateUserError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nový klient</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Meno a priezvisko</Label>
              <Input
                placeholder="Napr. Anna Kováčová"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="klient@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>
                Telefón{" "}
                <span className="text-gray-400 font-normal">(voliteľné)</span>
              </Label>
              <Input
                type="tel"
                placeholder="+421 900 000 000"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
              />
            </div>

            {createUserError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {createUserError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateUserOpen(false);
                setCreateUserError("");
              }}
              disabled={createUserLoading}
            >
              Zrušiť
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                createUserLoading || !newUserName.trim() || !newUserEmail.trim()
              }
            >
              {createUserLoading ? "Vytváram..." : "Vytvoriť"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmingDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmingDelete(false);
        }}
      >
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Vymazať terapiu?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-500">
            Táto akcia sa nedá vrátiť späť.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmingDelete(false)}
            >
              Zrušiť
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={onDelete}
            >
              Vymazať
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
