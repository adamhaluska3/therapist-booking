export const statusEnum = [
  "pending",
  "confirmed",
  "cancelled",
  "finished",
] as const;

export const locationTypeEnum = ["onsite", "online"] as const;

export type TimeSlot = { time: string; available: boolean };
export type SlotsByDate = Record<string, TimeSlot[]>;

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function bookingStatusTranslate(status: string) {
  switch (status) {
    case "pending":
      return "Čaká na potvrdenie";
    case "confirmed":
      return "Potvrdená";
    case "cancelled":
      return "Zrušená";
    case "finished":
      return "Absolvovaná";
    default:
      return status;
  }
}
