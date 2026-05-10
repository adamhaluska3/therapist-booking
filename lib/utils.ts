import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
