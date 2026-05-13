export const BOOKINGS_PAGE_SIZE = 5;
export const SESSIONS_PAGE_SIZE = 10;
export const DASHBOARD_PAGE_SIZE = 10;

export const UNKNOWN_CLIENT = "Neznámy klient";

export const DEFAULT_DURATION_MINUTES = 60;

export const DEFAULT_BOOKABLE_TYPE_NAME = "Psychoterapia";

export const DEFAULT_THERAPY_COLOR = "#427a5c";
export const BOOKING_TYPE_COLORS: Record<
  string,
  { bg: string; label: string }
> = {
  "bt-psychoterapia": { bg: "#427a5c", label: "Psychoterapia" },
  "bt-supervizia": { bg: "#5a6abf", label: "Supervízia" },
  "bt-seminare": { bg: "#d96c4f", label: "Semináre" },
  "bt-koucing": { bg: "#bf8a2e", label: "Koučing" },
  "bt-outdoor": { bg: "#3d9e8a", label: "Outdoor terapia" },
};

export const BOOKING_STATE_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#10B981",
  finished: "#3B82F6",
  cancelled: "#EF4444",
};

export const ADDRESS_SHORT = "Svätopluková 12, Prešov"
