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
    confirmCta: "Potvrdiť rezerváciu",
    footer: "SEDENIE TRVÁ 60 MINÚT • ONLINE ALEBO OSOBNE",
    occupiedLabel: "Obsadené",
  },
};

export type { TimeSlot, SlotsByDate } from "@/lib/booking-types";
