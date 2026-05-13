import Link from "next/link";
import { Clock, MapPin, Check } from "lucide-react";
import { LocationBadge } from "@/components/booking/location-badge"
import type { BookingWithUser } from "@/server/booking/schema";
import { formatTime, formatMonthShort } from "@/lib/date-utils";
import { getInitials, formatPrice } from "@/lib/formatting";
import { UNKNOWN_CLIENT } from "@/lib/constants";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BOOKING_TYPE_COLORS } from "@/components/admin/calendar-event-card";
import { BookingType } from "@/db/schema";

export function ArchiveCard({
  booking,
  bookingTypes,
}: {
  booking: BookingWithUser;
  bookingTypes: BookingType[];
}) {
  const clientName =
    booking.user?.nickname ?? booking.user?.name ?? UNKNOWN_CLIENT;
  const isLinked = Boolean(booking.userId);
  const bookingType =
    bookingTypes.find((t) => t.id === booking.bookingTypeId) ?? null;

  const inner = (
    <AdminCard
      className={cn(
        "lg:flex-row lg:items-center lg:gap-6 transition-colors",
        isLinked && "group-hover:border-brand-300 group-hover:bg-surface-50",
      )}
    >
      {/* Mobile layout */}
      <div className="lg:hidden flex items-center gap-3">
        <div className="w-12 shrink-0 text-center border-r border-surface-200 pr-3 self-stretch flex flex-col justify-center">
          <p className="text-2xl font-bold text-neutral-800 leading-none">
            {booking.start.getDate()}
          </p>
          <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">
            {formatMonthShort(booking.start)}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
              {getInitials(clientName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-neutral-800 text-sm leading-tight truncate">
                {clientName}
              </p>
              <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                <Clock size={11} className="shrink-0" />
                <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
              </div>
              <LocationBadge locationType={booking.locationType} size={11} className="text-xs text-neutral-400 mt-0.5" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                {bookingType && (
                  <>
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: BOOKING_TYPE_COLORS[bookingType.id]?.bg ?? "#427a5c" }}
                    />
                    <span>{bookingType.name}</span>
                    {formatPrice(booking.price) && (
                      <span>· {formatPrice(booking.price)}</span>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Hash size={11} className="shrink-0"/>
                <span>{booking.variableSymbol}</span>
              </div>
            </div>
            <Badge className="bg-brand-100 text-brand-700 border-brand-200 px-3 py-1 h-auto text-xs font-medium shrink-0 ml-2">
              <Check size={11} />Absolvované
            </Badge>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:contents">
        <div className="w-16 shrink-0 text-center border-r border-surface-200 pr-6">
          <p className="text-3xl font-bold text-neutral-800 leading-none">
            {booking.start.getDate()}
          </p>
          <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">
            {formatMonthShort(booking.start)}
          </p>
        </div>

        <div className="flex items-center gap-3 w-52 shrink-0">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
            {getInitials(clientName)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-800 text-sm leading-tight truncate">
              {clientName}
            </p>
            {bookingType && (
              <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5 min-w-0">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      BOOKING_TYPE_COLORS[bookingType.id]?.bg ?? "#427a5c",
                  }}
                />
                <span className="truncate min-w-0 flex-1">{bookingType.name}</span>
                {formatPrice(booking.price) && (
                  <span className="shrink-0">· {formatPrice(booking.price)}</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <Hash size={11} className="shrink-0"/>
              <span>{booking.variableSymbol}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            <Clock size={11} className="shrink-0 text-neutral-400" />
            <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
          </div>
          <LocationBadge locationType={booking.locationType} size={11} className="text-xs text-neutral-400" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Badge className="bg-brand-100 text-brand-700 border-brand-200 px-3 py-1 h-auto text-xs font-medium">
            <Check size={11} />Absolvované
          </Badge>
        </div>
      </div>
    </AdminCard>
  );

  if (booking.userId) {
    return (
      <Link href={`/admin/clients/${booking.userId}`} className="group block">
        {inner}
      </Link>
    );
  }

  return inner;
}
