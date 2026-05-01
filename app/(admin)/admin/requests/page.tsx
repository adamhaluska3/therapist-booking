import { getPendingBookings } from "@/server/queries";
import { RequestsView } from "@/components/admin/requests-view";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { bookings, total } = await getPendingBookings(page);

  return <RequestsView bookings={bookings} total={total} page={page} />;
}
