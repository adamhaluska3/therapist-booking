import { startOfWeek, addDays, parseISO, isValid } from "date-fns";
import { AvailabilityCalendar } from "@/components/admin/availability-calendar";
import { getAllUsers } from "@/server/user/queries";
import { getBookingTypes } from "@/server/booking-type/queries";
import { getBookingsWithUsers } from "@/server/booking/queries";
import { getAvailabilitySlots } from "@/server/availability-slots/queries";
export const metadata = {
  title: "Kalendár",
};

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const { from: fromParam } = await searchParams;

  const baseDate =
    fromParam && isValid(parseISO(fromParam))
      ? parseISO(fromParam)
      : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });

  const rangeFrom = weekStart;
  const rangeTo = addDays(weekStart, 6);

  const [slots, bookings, users, bookingTypes] = await Promise.all([
    getAvailabilitySlots({ from: rangeFrom, to: rangeTo }),
    getBookingsWithUsers({ from: rangeFrom, to: rangeTo }),
    getAllUsers(),
    getBookingTypes(),
  ]);

  return (
    <AvailabilityCalendar
      initialSlots={slots}
      initialBookings={bookings}
      initialDate={weekStart}
      initialUsers={users}
      bookingTypes={bookingTypes}
    />
  );
}
