import { statusEnum } from "@/lib/booking-types";

export const BOOKINGS_PAGE_SIZE = 5;
export const SESSIONS_PAGE_SIZE = 10;
export const DASHBOARD_PAGE_SIZE = 10;

export const UNKNOWN_CLIENT = "Neznámy klient";

export const DEFAULT_DURATION_MINUTES = 60;

export const DEFAULT_THERAPY_COLOR = "#427a5c";

export const BOOKING_STATE_COLORS: Record<(typeof statusEnum)[number], string> = {
  pending: "#F59E0B",
  confirmed: "#10B981",
  finished: "#3B82F6",
  cancelled: "#EF4444",
};

export const ADDRESS_SHORT = "Svätopluková 12, Prešov"
