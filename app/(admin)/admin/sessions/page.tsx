import { SessionsArchiveView } from "./_content/sessions-archive-view"
import { getBookingTypes } from "@/server/queries"

export default async function SessionsPage() {
  const bookingTypes = await getBookingTypes()
  return <SessionsArchiveView bookingTypes={bookingTypes} />
}
