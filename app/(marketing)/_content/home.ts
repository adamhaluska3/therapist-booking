export const homeContent = {
  services: {
    label: "Naša ponuka",
    heading: "Ako vám viem pomôcť",
    subheading:
      "Špecializujem sa na rôzne formy podpory, od hĺbkovej psychoterapie až po rozvojové semináre pre profesionálov.",
    items: [
      {
        title: "Psychoterapia",
        description:
          "Individuálne stretnutia zamerané na úzkosti, depresie, vzťahové problémy a traumy. Poskytujem bezpečný priestor pre vaše zdieľanie.",
        cta: "Rezervovať termín",
      },
      {
        title: "Supervízia",
        description:
          "Odborné vedenie pre kolegov v pomáhajúcich profesiách. Zamerané na prevenciu vyhorenia a rast profesionálnej identity.",
        cta: "Mám záujem",
      },
      {
        title: "Semináre",
        description:
          "Skupinové vzdelávacie podujatia zamerané na mindfulness, komunikáciu a psychohygienu pre firmy aj verejnosť.",
        cta: "Kontaktovať",
      },
      {
        title: "Koučing",
        description:
          "Orientácia na cieľ a riešenie. Spoločne nastavíme stratégiu pre váš osobný alebo pracovný progres a prekonanie bariér.",
        cta: "Mám záujem",
      },
    ],
  },
  outdoorTherapy: {
    label: "Nová forma terapie",
    heading: "Outdoorová terapia",
    description:
      "Prepojenie pohybu a prírody otvára nové dimenzie v terapeutickom procese. Namiesto štyroch stien kancelárie využívame pokoj bratislavských lesov a parkov ako katalyzátor reflexie. Štúdie potvrdzujú, že chôdza v prírode znižuje hladinu kortizolu a stimuluje kognitívnu flexibilitu. Práve v pohybe sa často uvoľňujú bloky, ktoré pri sedení zostávajú skryté.",
    benefits: [
      "Pocit slobody a väčšieho priestoru pre myšlienky",
      "Prirodzený rytmus chôdze uľahčuje zdieľanie ťažkých tém",
      "Hlboké ukotvenie v prítomnom okamihu vďaka zmyslovým vnemom",
    ],
    cta: "Chcem vyskúšať outdoor terapiu",
    images: [
      {
        src: "/images/outdoor-therapy/session-1.png",
        alt: "Outdoorová terapia 1",
      },
      {
        src: "/images/outdoor-therapy/session-2.png",
        alt: "Outdoorová terapia 2",
      },
      {
        src: "/images/outdoor-therapy/session-3.png",
        alt: "Outdoorová terapia 3",
      },
      {
        src: "/images/outdoor-therapy/session-4.png",
        alt: "Outdoorová terapia 4",
      },
      {
        src: "/images/outdoor-therapy/session-5.png",
        alt: "Outdoorová terapia 5",
      },
    ] satisfies { src: string; alt: string }[],
  },
  about: {
    name: "Mgr. Ján Šolc, Dis",
    yearsOfExperience: "12+",
    photo: { src: "/images/about/jan-solc.png", alt: "Ján Šolc" },
    bio: [
      "Moja cesta k psychológii začala túžbou porozumieť hĺbke ľudskej skúsenosti. Verím, že každý z nás má v sebe potenciál na uzdravenie, ak dostane správnu podporu a pochopenie.",
      "Vo svojej praxi využívam kombináciu kognitívno-behaviorálnej terapie a humanistických prístupov. Kladiem dôraz na autenticitu a rešpekt k jedinečnému životnému príbehu každého klienta.",
      "Pravidelne sa vzdelávam v nových metodikách, aby som vám mohla poskytnúť starostlivosť najvyššej kvality. Moje vzdelanie zahŕňa doktorát z klinickej psychológie a certifikované výcviky v systemickej terapii.",
    ],
    stats: {
      happyClients: "450+",
      publications: "15+",
    },
  },
  contact: {
    heading: "Napíšte mi",
    description:
      "Máte otázky alebo sa chcete dohodnúť na prvé nezáväzné stretnutie? Vyplňte formulár a ozvem sa vám do 24 hodín.",
    address: "Vojňany 38, 05902, Vojňany",
    email: "terapie@jansolc.sk",
    phone: "+421 900 123 456",
  },
};
