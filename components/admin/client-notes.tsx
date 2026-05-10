import { getUserNotes } from "@/server/queries/notes";
import { ClientNotesPanel } from "./client-notes-panel";

export default async function ClientNotes({ userId }: { userId: string }) {
  const notes = await getUserNotes(userId);
  return (
    <ClientNotesPanel
      userId={userId}
      initialNotes={notes.map((n) => ({ id: n.id, date: n.date, note: n.note }))}
    />
  );
}
