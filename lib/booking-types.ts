export type TimeSlot = { time: string; available: boolean };
export type SlotsByDate = Record<string, TimeSlot[]>;

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
