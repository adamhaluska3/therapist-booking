import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { AbsolvedBookingsTable, ClientAbsolvedBookingMonthFilter } from "@/components/user/absolved-bookings-table";
import { SmallInfoText } from "@/components/ui/brand-text-ui/small-info-text";
import { getClientAbsolvedBookings } from "@/server/booking/queries";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPaymentSettings } from "@/server/payment-settings/queries";

const PAGE_SIZE = 10;

export const metadata: Metadata = { title: "Záznamy sedení" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const userSession = await auth.api.getSession({ headers: await headers() });

  if (!userSession || userSession.user.role !== "user") {
    redirect("/");
  }

  const params = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

  const from = str(params.from);
  const to = str(params.to);
  const filter = (str(params.filter) || "all") as ClientAbsolvedBookingMonthFilter;
  const page = Math.max(1, Number(str(params.page)) || 1);

  const [{ rows, total }, paymentSettings] = await Promise.all([
    getClientAbsolvedBookings({
      userId: userSession.user.id,
      page,
      pageSize: PAGE_SIZE,
      from: from || undefined,
      to: to || undefined,
    }),
    getPaymentSettings(),
  ]);

  return (
    <article className="bg-linear-to-b from-white to-surface-100">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:px-8 md:pb-12 md:pt-20">
            <section className="mb-8">
                <Link href="/client" className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600 flex items-center">
                    <ArrowLeft/>
                    <p>Naspäť na prehľad</p>
                </Link>
                <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
                    História sedení
                </h1>
                <SmallInfoText content="Prehľad všetkých Vašich absolvovaných sedení." />
            </section>
            <AbsolvedBookingsTable
              rows={rows}
              total={total}
              from={from}
              to={to}
              filter={filter}
              page={page}
              pageSize={PAGE_SIZE}
              paymentSettings={paymentSettings ?? null}
            />
        </div>
    </article>
  );
};

export default Page;
