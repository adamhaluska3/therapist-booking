import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AbsolvedBookingsTable } from "@/components/user/absolved-bookings-table";
import { SmallInfoText } from "@/components/ui/brand-text-ui/small-info-text";
import { db } from "@/lib/db";
import { getClientAbsolvedBookings } from "@/server/booking/queries";

const PAGE_SIZE = 10;

export const metadata = { title: "Záznamy sedení" };

const Page = async () => {
  const userSession = await auth.api.getSession({ headers: await headers() });

  if (!userSession || userSession.user.role !== "user") {
    redirect("/");
  }

  const [{ rows, total }, paymentSettings] = await Promise.all([
    getClientAbsolvedBookings({
      userId: userSession.user.id,
      page: 1,
      pageSize: PAGE_SIZE,
    }),
    db.query.paymentSettings.findFirst(),
  ]);

  return (
    <article className="bg-linear-to-b from-white to-surface-100">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:px-8 md:pb-12 md:pt-20">
        <section className="mb-8">
          <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
            Záznamy sedení
          </h1>
          <SmallInfoText content="Prehľad všetkých Vašich absolvovaných sedení." />
        </section>

        <AbsolvedBookingsTable
          initialRows={rows}
          initialTotal={total}
          userId={userSession.user.id}
          pageSize={PAGE_SIZE}
          paymentSettings={paymentSettings ?? null}
        />
      </div>
    </article>
  );
};

export default Page;
