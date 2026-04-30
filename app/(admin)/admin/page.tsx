import { getDashboardBookings } from "@/server/queries"
import { DashboardView } from "./_content/dashboard-view"

export default async function AdminPage() {
  const bookings = await getDashboardBookings()
  return <DashboardView bookings={bookings} />
}
