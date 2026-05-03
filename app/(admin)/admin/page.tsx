import { getBookingTypes } from "@/server/queries"
import { getAllUsers } from "@/server/queries/users"
import { DashboardView } from "./_content/dashboard-view"

export default async function AdminPage() {
  const [bookingTypes, users] = await Promise.all([
    getBookingTypes(),
    getAllUsers(),
  ])

  return <DashboardView bookingTypes={bookingTypes} users={users} />
}
