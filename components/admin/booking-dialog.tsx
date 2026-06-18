"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { BookingWithUser } from "@/server/booking/schema";
import { UserOption } from "@/server/user/schema";
import { Textarea } from "../ui/textarea";
import { BOOKING_TYPE_COLORS, DEFAULT_THERAPY_COLOR } from "@/lib/constants";
import { createNonOAuthUserAction } from "@/server/user/actions";

const BOOKING_TYPE_PILL_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(BOOKING_TYPE_COLORS).map(([id, v]) => [id, v.bg]),
);
import { locationTypeEnum } from "@/lib/booking-enums";

function timeToMinutes(hhmm: string): number {
  const [hh, mm] = hhmm.split(":").map(Number);
  return (hh ?? 0) * 60 + (mm ?? 0);
}

const TIME_REGEX = /^\d{2}:\d{2}$/;

const bookingSchema = z
  .object({
    userId: z.string().nullable(),
    bookingTypeId: z.string().nullable(),
    startStr: z.string().regex(TIME_REGEX, "Neplatný čas"),
    endStr: z.string().regex(TIME_REGEX, "Neplatný čas"),
    note: z.string(),
    locationType: z.enum(locationTypeEnum),
  })
  .refine(
    (d) => timeToMinutes(d.endStr) > timeToMinutes(d.startStr),
    { message: "Koniec musí byť po začiatku", path: ["endStr"] },
  );

type BookingFormValues = z.infer<typeof bookingSchema>;

const createUserSchema = z.object({
  name: z.string().min(1, "Meno je povinné"),
  email: z.string().email("Neplatný email"),
  phone: z.string(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

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

  function buildFormValues() {
    return {
      userId: booking?.userId ?? null,
      bookingTypeId: booking ? (booking.bookingTypeId ?? null) : (bookingTypes[0]?.id ?? null),
      startStr: format(booking?.start ?? defaultStart ?? new Date(), "HH:mm"),
      endStr: format(booking?.end ?? defaultEnd ?? new Date(), "HH:mm"),
      note: booking?.note ?? "",
      locationType: booking?.locationType ?? ("onsite" as const),
    };
  }

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: buildFormValues(),
  });

  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    reset: resetUser,
    watch: watchUser,
    formState: { errors: userErrors, isSubmitting: createUserLoading },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (open) reset(buildFormValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking, defaultStart, defaultEnd, bookingTypes]);

  const selectedUserId = watch("userId");

  const [pendingUsers, setPendingUsers] = useState<UserOption[]>([]);
  const allUsers = useMemo(() => {
    const seen = new Set(initialUsers.map((u) => u.id));
    return [...initialUsers, ...pendingUsers.filter((u) => !seen.has(u.id))];
  }, [initialUsers, pendingUsers]);

  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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

  useEffect(() => {
    if (comboboxOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [comboboxOpen]);

  function parseTime(hhmm: string): Date {
    const mins = timeToMinutes(hhmm);
    const d = new Date(base);
    d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    return d;
  }

  function onSubmit(values: BookingFormValues) {
    onSave({
      id: booking?.id ?? crypto.randomUUID(),
      start: parseTime(values.startStr),
      end: parseTime(values.endStr),
      status: booking?.status ?? "confirmed",
      locationType: values.locationType,
      price: booking?.price ?? null,
      userId: values.userId,
      bookingTypeId: values.bookingTypeId,
      note: values.note.trim() || null,
      createdAt: booking?.createdAt ?? new Date(),
      variableSymbol: null,
      meetLink: null,
    });
  }

  function handleOpenCreateUser() {
    setComboboxOpen(false);
    setCreateUserOpen(true);
  }

  async function onCreateUser(values: CreateUserFormValues) {
    setCreateUserError("");
    const result = await createNonOAuthUserAction({
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
    });

    if (!result.ok || !result.user) {
      setCreateUserError(result.error ?? "Chyba pri vytváraní klienta.");
      return;
    }

    const newUser = result.user;
    setPendingUsers((prev) => [...prev, newUser]);
    setValue("userId", newUser.id);
    onUserCreated(newUser);
    setCreateUserOpen(false);
    resetUser();
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

          <form id="booking-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label>Klient</Label>
                <Controller
                  control={control}
                  name="userId"
                  render={({ field }) => (
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
                                  field.onChange(u.id);
                                  setComboboxOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 text-left"
                              >
                                <Check
                                  className={`h-3.5 w-3.5 shrink-0 ${field.value === u.id ? "text-brand-600" : "text-transparent"}`}
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
                  )}
                />
                {selectedUserId && (
                  <button
                    type="button"
                    onClick={() => setValue("userId", null)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 text-left w-fit"
                  >
                    Zrušiť výber
                  </button>
                )}
              </div>

              <Controller
                control={control}
                name="bookingTypeId"
                render={({ field }) => (
                  <div className="grid gap-1.5">
                    <Label>Typ stretnutia</Label>
                    <div className="flex flex-wrap gap-2">
                      {bookingTypes.map((bt) => (
                        <button
                          key={bt.id}
                          type="button"
                          onClick={() =>
                            field.onChange(field.value === bt.id ? null : bt.id)
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            field.value === bt.id
                              ? "text-white border-transparent"
                              : "text-neutral-600 border-surface-200 bg-white hover:bg-surface-50"
                          }`}
                          style={
                            field.value === bt.id
                              ? {
                                  backgroundColor: bt.color,
                                }
                              : undefined
                          }
                        >
                          {bt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />

              <Controller
                control={control}
                name="locationType"
                render={({ field }) => (
                  <div className="grid gap-1.5">
                    <Label>Forma stretnutia</Label>
                    <div className="flex gap-2">
                      {locationTypeEnum.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => field.onChange(type)}
                          className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                            field.value === type
                              ? "bg-brand-600 text-white border-transparent"
                              : "text-neutral-600 border-surface-200 bg-white hover:bg-surface-50"
                          }`}
                        >
                          {type === "onsite" ? "Na mieste" : "Online"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Začiatok</Label>
                  <Input type="time" {...register("startStr")} />
                  {errors.startStr && (
                    <p className="text-xs text-red-500">
                      {errors.startStr.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Koniec</Label>
                  <Input type="time" {...register("endStr")} />
                  {errors.endStr && (
                    <p className="text-xs text-red-500">
                      {errors.endStr.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Poznámka</Label>
                <Textarea
                  {...register("note")}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {isEdit && onDelete && (
                <>
                  <Separator />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Vymazať terapiu
                  </Button>
                </>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Zrušiť
            </Button>
            <Button
              type="submit"
              form="booking-form"
              disabled={!isEdit && !selectedUserId}
            >
              {isEdit ? "Uložiť" : "Vytvoriť"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createUserOpen}
        onOpenChange={(v) => {
          if (!v) {
            setCreateUserOpen(false);
            setCreateUserError("");
            resetUser();
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nový klient</DialogTitle>
          </DialogHeader>

          <form id="create-user-form" onSubmit={handleSubmitUser(onCreateUser)}>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label>Meno a priezvisko</Label>
                <Input
                  placeholder="Napr. Anna Kováčová"
                  {...registerUser("name")}
                />
                {userErrors.name && (
                  <p className="text-xs text-red-500">
                    {userErrors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="klient@example.com"
                  {...registerUser("email")}
                />
                {userErrors.email && (
                  <p className="text-xs text-red-500">
                    {userErrors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>
                  Telefón{" "}
                  <span className="text-gray-400 font-normal">(voliteľné)</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="+421 900 000 000"
                  {...registerUser("phone")}
                />
              </div>

              {createUserError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {createUserError}
                </p>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateUserOpen(false);
                setCreateUserError("");
                resetUser();
              }}
              disabled={createUserLoading}
            >
              Zrušiť
            </Button>
            <Button
              type="submit"
              form="create-user-form"
              disabled={createUserLoading || !watchUser("name").trim() || !watchUser("email").trim()}
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
