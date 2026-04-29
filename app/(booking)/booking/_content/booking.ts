export const bookingContent = {
  hero: {
    heading: "Priestor pre vaše myšlienky.",
    subheading:
      "Každé sedenie je vedené s maximálnou empatiou v bezpečnom prostredí prispôsobenom vašim potrebám.",
  },
  main: {
    heading: "Nájdite si svoj čas na pokoj.",
    subheading:
      "Vaša cesta k duševnej rovnováhe začína tu. Vyberte si termín, ktorý vám najlepšie vyhovuje v našom tichom digitálnom priestore.",
  },
  calendar: {
    label: "Vyberte dátum",
    weekDays: ["PO", "UT", "ST", "ŠT", "PI", "SO", "NE"] as const,
    months: [
      "Január",
      "Február",
      "Marec",
      "Apríl",
      "Máj",
      "Jún",
      "Júl",
      "August",
      "September",
      "Október",
      "November",
      "December",
    ] as const,
  },
  slots: {
    label: "Dostupné časy",
    note: "Rezerváciu je možné zmeniť alebo zrušiť najneskôr 48 hodín vopred.",
    confirmCta: "Confirm Booking",
    footer: "SEDENIE TRVÁ 50 MINÚT • ONLINE ALEBO OSOBNE",
    occupiedLabel: "Obsadené",
  },
};

export type BookingSlot = { time: string; occupied: boolean };

const WEEKDAY_SLOTS: Record<number, BookingSlot[]> = {
  0: [
    // Monday
    { time: "09:00", occupied: false },
    { time: "10:30", occupied: false },
    { time: "14:00", occupied: true },
    { time: "15:30", occupied: false },
  ],
  1: [
    // Tuesday
    { time: "09:00", occupied: false },
    { time: "10:30", occupied: true },
    { time: "14:00", occupied: false },
  ],
  2: [
    // Wednesday
    { time: "09:00", occupied: true },
    { time: "10:30", occupied: false },
    { time: "14:00", occupied: false },
    { time: "15:30", occupied: false },
  ],
  3: [
    // Thursday
    { time: "10:30", occupied: false },
    { time: "14:00", occupied: false },
    { time: "15:30", occupied: true },
  ],
  4: [
    // Friday
    { time: "09:00", occupied: false },
    { time: "10:30", occupied: false },
  ],
};

export function getSlotsForDate(date: Date): BookingSlot[] {
  const dow = (date.getDay() + 6) % 7;
  return WEEKDAY_SLOTS[dow] ?? [];
}

export function hasAvailability(date: Date): boolean {
  const slots = getSlotsForDate(date);
  return slots.some((s) => !s.occupied);
}
