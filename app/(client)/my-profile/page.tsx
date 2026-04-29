import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UpcomingUserBookings } from "@/components/user/upcoming-bookings";
import { PreviousUserBookings } from "@/components/user/previous-bookings";
import { SmallInfoText } from "@/components/ui/brand-text-ui/small-info-text";

const Page = async () => {
    const userSession = await auth.api.getSession({ headers: await headers() })

    if (!userSession || userSession.user.role !== "user") {
        redirect("/");
    }

    return (
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
                <UpcomingUserBookings userId={userSession.user.id} limit={2}/>
                <PreviousUserBookings userId={userSession.user.id} limit={5}/>
            </div>
        </div>
    );
}

export default Page;