import { startOfWeek, addDays, parseISO, isValid } from "date-fns";
import { AvailabilityCalendar } from "@/components/admin/availability-calendar";
import { getCalendarData, getAllUsers, getBookingTypes } from "@/server/queries/index";

export const metadata = {
  title: "Správa dostupnosti – Kalendár",
};

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const { from: fromParam } = await searchParams;

  const baseDate = fromParam && isValid(parseISO(fromParam)) ? parseISO(fromParam) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });

  const rangeFrom = weekStart;
  const rangeTo = addDays(weekStart, 6);

  const [{ slots, bookings }, users, bookingTypes] = await Promise.all([
    getCalendarData(rangeFrom, rangeTo),
    getAllUsers(),
    getBookingTypes(),
  ]);

  return (
    <AvailabilityCalendar
      key={weekStart.toISOString()}
      initialSlots={slots}
      initialBookings={bookings}
      initialDate={weekStart}
      initialUsers={users}
      bookingTypes={bookingTypes}
    />
  );
}
