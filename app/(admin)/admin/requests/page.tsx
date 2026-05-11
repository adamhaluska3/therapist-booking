import { getPendingBookings } from "@/server/booking/queries";
import { RequestsView } from "@/components/admin/requests-view";
import { getBookingTypes } from "@/server/booking-type/queries";

export const metadata = {
  title: "Žiadosti",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ bookings, total }, bookingTypes] = await Promise.all([
    getPendingBookings(page),
    getBookingTypes(),
  ]);

  return (
    <RequestsView
      bookings={bookings}
      total={total}
      page={page}
      bookingTypes={bookingTypes}
    />
  );
}
