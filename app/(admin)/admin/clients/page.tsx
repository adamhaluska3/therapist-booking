import { format } from "date-fns";

import ClientsTable from "@/components/admin/clients-table";
import { getClientsTableRows } from "@/server/user/queries";

export const metadata = {
  title: "Klienti",
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
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-neutral-800 mb-2">
          Klienti
        </h1>
      </div>

      <ClientsTable items={items} />
    </section>
  );
}
