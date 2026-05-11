import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { UpcomingUserBookings } from "@/components/user/upcoming-bookings";
import { PreviousUserBookings } from "@/components/user/previous-bookings";
import { SmallInfoText } from "@/components/ui/brand-text-ui/small-info-text";
import { Skeleton } from "@/components/ui/skeleton";

function UpcomingBookingsSkeleton() {
    return (
        <section>
            <Skeleton className="my-3 h-8 w-56" />
            <div className="flex gap-10 rounded-2xl bg-white p-10">
                <div className="flex flex-1 flex-col gap-5">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-28" />
                    <div className="mt-2 flex gap-2">
                        <Skeleton className="h-9 w-28 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                </div>
                <Skeleton className="hidden h-40 w-56 rounded-xl md:block" />
            </div>
        </section>
    );
}

function PreviousBookingsSkeleton() {
    return (
        <section>
            <div className="flex items-center">
                <Skeleton className="my-3 h-8 w-56 flex-1" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-col gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
            </div>
        </section>
    );
}
import { Metadata } from "next";

export const metadata: Metadata = { title: "Prehľad sedení" };

const Page = async () => {
  const userSession = await auth.api.getSession({ headers: await headers() });

  if (!userSession || userSession.user.role !== "user") {
    redirect("/");
  }

    return (
        <article className="bg-linear-to-b from-white to-surface-100">
            <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:px-8 md:pb-12 md:pt-20">
                <section>
                    <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
                        Prehľad sedení
                    </h1>
                    <SmallInfoText
                        content="Zoznam Vašich nadchadzajúcich aj minulých sedení na jednom mieste."
                    />
                </section>
                <div className="flex flex-col gap-10">
                    <Suspense fallback={<UpcomingBookingsSkeleton />}>
                        <UpcomingUserBookings userId={userSession.user.id}/>
                    </Suspense>
                    <Suspense fallback={<PreviousBookingsSkeleton />}>
                        <PreviousUserBookings userId={userSession.user.id} limit={5}/>
                    </Suspense>
                </div>
            </div>
        </article>
    );
}

export default Page;
