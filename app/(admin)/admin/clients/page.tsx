import { format } from "date-fns";

import ClientsTable from "@/components/admin/clients-table";
import { getClientsTableRows } from "@/server/queries";

export const metadata = {
  title: "Správa klientov",
};

export default async function ClientsPage() {
  const rows = await getClientsTableRows();

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatarUrl,
    lastSession: row.lastSessionAt
      ? format(new Date(row.lastSessionAt), "d. M. yyyy")
      : null,
    totalSessions: row.totalSessions,
  }));

  return (
    <section className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold italic text-brand-900">
          Klienti
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500">
          Prehľad klientov, posledného sedenia a počtu absolvovaných stretnutí.
        </p>
      </div>

      <ClientsTable items={items} />
    </section>
  );
}
