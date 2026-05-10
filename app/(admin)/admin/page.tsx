import { getBookingTypes } from "@/server/booking-type/queries";
import { DashboardView } from "./_content/dashboard-view";
import { getAllUsers } from "@/server/user/queries";

export default async function AdminPage() {
  const [bookingTypes, users] = await Promise.all([
    getBookingTypes(),
    getAllUsers(),
  ]);

  return <DashboardView bookingTypes={bookingTypes} users={users} />;
}
