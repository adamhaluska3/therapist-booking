import { getBookingTypes } from "@/server/booking-type/queries";
import { SessionsArchiveView } from "./_content/sessions-archive-view";

export const metadata = {
  title: "História sedení",
};

export default async function SessionsPage() {
  const bookingTypes = await getBookingTypes();
  return <SessionsArchiveView bookingTypes={bookingTypes} />;
}
