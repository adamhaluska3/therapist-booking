import { getFinishedBookings } from "@/server/queries"
import { SessionsArchiveView } from "./_content/sessions-archive-view"

export default async function SessionsPage() {
  const bookings = await getFinishedBookings()
  return <SessionsArchiveView bookings={bookings} />
}
