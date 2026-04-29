import { startOfWeek, endOfWeek, addDays, parseISO, isValid } from "date-fns";
import { AvailabilityCalendar } from "@/components/admin/availability-calendar";
import { getCalendarData } from "@/server/queries/index";

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

  const rangeFrom = addDays(weekStart, -28);
  const rangeTo   = addDays(weekStart,  28);

  const { slots, bookings } = await getCalendarData(rangeFrom, rangeTo);

  return (
    <AvailabilityCalendar
      initialSlots={slots}
      initialBookings={bookings}
      initialDate={weekStart}
    />
  );
}
