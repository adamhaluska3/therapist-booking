import React from "react";
import { getUserById, getUserBookings } from "@/server/user/queries";
import ClientBookings from "@/components/admin/client-bookings";
import { NicknameChangeDialog } from "@/components/admin/nickname-change-dialog";
import { RemoveNicknameButton } from "@/components/admin/remove-nickname-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClientNotes from "@/components/admin/client-notes";
import { getInitials } from "@/lib/formatting";
import { getUserNotes } from "@/server/user-note/queries";
import { deleteUserNote, saveUserNote } from "@/server/user-note/mutations";
import { RedirectBackButton } from "@/components/admin/redirect-back-button";

type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
  const { id } = await params;
  const [user, notes, bookings] = await Promise.all([
    getUserById(id),
    getUserNotes(id),
    getUserBookings(id),
  ]);

  const userId = id;

  async function addNote(text: string, dateParam: string | Date) {
    "use server";
    const date = new Date(dateParam);
    const newId = await saveUserNote({ userId, date, note: text });
    return newId;
  }

  async function updateNote(
    noteId: string,
    text: string,
    dateParam: string | Date,
  ) {
    "use server";
    const date = new Date(dateParam);
    await saveUserNote({ id: noteId, userId, date, note: text });
    return noteId;
  }

  async function deleteNote(noteId: string) {
    "use server";
    await deleteUserNote(noteId);
    return true;
  }

  async function redirectBack() {
    "use server";
    navigation.back();
  }

  if (!user) return <div className="p-6">Klient nenájdený</div>;

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <RedirectBackButton href="/admin" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        <div className="w-full lg:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
                    {getInitials(user.nickname ?? user.name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="mb-1">
                      {user.nickname ?? user.name}
                    </CardTitle>
                    {user.nickname && (
                      <p className="text-xs text-muted-foreground">
                        {user.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <NicknameChangeDialog
                    userId={user.id}
                    currentNickname={user.nickname}
                  />
                  {user.nickname && <RemoveNicknameButton userId={user.id} />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Emailová adresa
                  </div>
                  <div className="font-medium">{user.email}</div>
                </div>
                {user.phone && (
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Telefónne číslo
                    </div>
                    <div className="font-medium">{user.phone}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex w-full flex-col gap-6 lg:col-span-8">
          <ClientBookings
            bookings={bookings.map((b: any) => ({
              id: b.id,
              start: b.start,
              end: b.end,
              status: b.status,
            }))}
          />

          <ClientNotes
            notes={notes.map((n: any) => ({
              id: n.id,
              date: n.date,
              note: n.note,
            }))}
            userId={id}
            onAdd={addNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        </div>
      </div>
    </>
  );
}
