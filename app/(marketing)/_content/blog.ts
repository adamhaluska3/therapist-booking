export type BlogCategory =
  | "psychoterapia"
  | "sebarozvoj"
  | "relaxacia"
  | "vztahy";

export const blogHeader = {
  label: "Múdrosť & pohyb",
  heading: "Blog & Inšpirácia",
  subheading:
    "Články o duševnom zdraví, sebapознаní a životnej rovnováhe. Priestor pre vaše ticho a rast.",
};

export const blogCategories: {
  value: BlogCategory | "vsetko";
  label: string;
}[] = [
  { value: "vsetko", label: "Všetko" },
  { value: "psychoterapia", label: "Psychoterapia" },
  { value: "sebarozvoj", label: "Sebarozvoj" },
  { value: "relaxacia", label: "Relaxácia" },
  { value: "vztahy", label: "Vzťahy" },
];

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: BlogCategory;
  image: { src: string; alt: string } | null;
  featured?: boolean;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "ako-zvladat-uzkost-v-kazdodennom-zivote",
    title: "Ako zvládať úzkosť v každodennom živote",
    excerpt:
      "Úzkosť nemusí byť váš nepriateľ. Naučte sa techniky, ktoré vám pomôžu úzkosť si všimnúť v prítomnom okamihu a zladiť späť s vnútornou rovnováhou. Cesta k pokoju začína malým krokom.",
    date: "19. apríla 2026",
    category: "psychoterapia",
    image: { src: "/images/blog/blog-1.png", alt: "psychoterapia" },
    featured: true,
    body: [
      "Úzkosť je jednou z najrozšírenejších emócií moderného človeka. Nie je to slabosť — je to signál. Telo a myseľ nám dávajú vedieť, že niečo si vyžaduje pozornosť. Problém nastáva, keď tento signál ignorujeme alebo sa ho snažíme potlačiť namiesto toho, aby sme mu naslúchali.",
      "Prvým krokom je naučiť sa rozlišovať medzi funkčnou a dysfunkčnou úzkosťou. Funkčná úzkosť nás motivuje, pomáha nám pripraviť sa na výzvy a varuje pred skutočným nebezpečenstvom. Dysfunkčná úzkosť sa objavuje bez zjavnej príčiny, je neproporcionalná situácii a bráni nám normálne fungovať.",
      "Kognitívno-behaviorálna terapia ponúka konkrétne nástroje. Jedným z nich je technika tzv. kognitívneho reštrukturalizmu — keď si všimneme katastrofickú myšlienku, položíme si otázky: Je táto myšlienka skutočne pravdivá? Aké mám dôkazy pre a proti? Čo by som povedal blízkemu priateľovi v rovnakej situácii?",
      "Rovnako účinná je práca s telom. Úzkosť sa prejavuje fyzicky — zrýchlený tep, napätie v ramenách, plytké dýchanie. Keď vedome spomalíme dych a uvoľníme svaly, vysielame nervovému systému správu, že sme v bezpečí. Telo a myseľ sú v neustálom dialógu — a my môžeme vstúpiť do tohto dialógu.",
      "Pamätajte: práca s úzkosťou je beh na dlhé trate, nie šprint. Malé každodenné kroky — krátka meditácia, zápis do denníka, rozhovor s dôveryhodnou osobou — sa časom sčítavajú do výraznej zmeny. A ak cítite, že to sami nezvládnete, vyhľadanie odbornej pomoci je prejavom sily, nie slabosti.",
    ],
  },
  {
    slug: "umenie-spomalit-preco-je-nicnerobenie-dolezite",
    title: "Umenie spomalit: Prečo je ničnerobenie dôležité",
    excerpt:
      "V spoločnosti orientovanej na výkon sme zabudli na silu odpočinku. Zistite, ako pasívna relaxácia regeneruje váš mozog a prečo je nevynímateľná pre kreativitu.",
    date: "6. marca 2026",
    category: "relaxacia",
    image: { src: "/images/blog/blog-2.png", alt: "relaxacia" },
    body: [
      "Žijeme v kultúre, ktorá ospevuje zaneprázdnenosť. 'Nemám čas' sa stalo spoločenským statusom, zatiaľ čo oddych je vnímaný ako lenivosť. Neuroveda nám však hovorí niečo úplne iné — mozog potrebuje fázy nečinnosti rovnako ako fázy aktivity.",
      "Keď sa nudia, mozog sa prepína do tzv. sieťového módu pokoja — default mode network. Práve v tejto fáze spracováva zážitky, upevňuje spomienky, hľadá súvislosti a generuje kreatívne nápady. Nie náhodou prichádzajú tie najlepšie myšlienky pod sprchou alebo počas prechádzky.",
      "Pasívny odpočinok — pozeranie sa z okna, ležanie v tráve, bezúčelná prechádzka — nie je stratou času. Je to investícia do kognitívnej výkonnosti. Štúdie ukazujú, že ľudia, ktorí si pravidelne doprajú chvíle skutočného zahálania, sú dlhodobo produktívnejší a kreatívnejší ako tí, ktorí pracujú bez prestávky.",
      "Problém je, že mnohí z nás si skutočne oddýchnuť nevedia. Siahame po telefóne, zapíname seriál, organizujeme si zoznamy úloh. Toto nie je odpočinok — je to len iný druh stimulácie. Skutočný oddych znamená dovoliť mysli blúdiť bez ciela.",
      "Začnite s pätnástimi minútami denne. Žiadny telefón, žiadna hudba, žiadna agenda. Len vy, vaše myšlienky a ticho. Spočiatku to bude nepohodlné — a to je presne ten moment, kedy sa deje to najdôležitejšie.",
    ],
  },
  {
    slug: "sebaprijatie-ako-prvy-krok-k-zmene",
    title: "Sebaprijatie ako prvý krok k zmene",
    excerpt:
      "Nemôžete sa zmeniť, kým neprijmete to, kým ste práve teraz. Skúmame hĺbku sebaprijatia a jeho celostného vplyvu na našu psychiku.",
    date: "19. októbra 2025",
    category: "sebarozvoj",
    image: { src: "/images/blog/blog-3.png", alt: "sebarozvoj" },
    body: [
      "Existuje paradox, ktorý objavil psychoterapeut Arnold Beisser a nazval ho paradoxnou teóriou zmeny: skutočná zmena nastáva až vtedy, keď prestaneme bojovať s tým, čím sme, a plne prijmeme svoju súčasnú realitu. Čím viac sa tlačíme do ideálneho obrazu seba, tým viac sa od neho vzďaľujeme.",
      "Sebaprijatie nie je rezignácia. Nie je to povedať si 'toto je ono, nič sa nezmení.' Je to schopnosť pozrieť sa na seba bez odsudzovania — vidieť svoje silné stránky aj limity, svoje svetlé aj tmavé stránky, a povedať: toto som ja, práve teraz, a to je v poriadku.",
      "Výskumy v oblasti sebasúcitu — konceptu, ktorý rozvinula psychologička Kristin Neff — ukazujú, že ľudia s vyššou mierou self-compassion sú odolnejší voči stresu, menej úzkostní a paradoxne motivovanejší k zmene ako tí, ktorí na seba uplatňujú prísnu vnútornú kritiku.",
      "Praktické cvičenie: keď sa nabudúce pristihne pri sebakritickom myslení, zastavte sa. Položte si ruku na srdce a spýtajte sa: Čo by som povedal blízkemu priateľovi, keby bol v mojej situácii? S najväčšou pravdepodobnosťou by ste boli k nemu omnoho láskavejší ako k sebe.",
      "Cesta k sebaprijatiu je postupná a nie vždy lineárna. Sú dni, keď sa darí viac, a dni, keď menej. Dôležité je nevzdať sa a pamätať, že vzťah so sebou samým je najdlhší vzťah vo vašom živote — stojí za to ho pestovať.",
    ],
  },
  {
    slug: "hranice-vo-vztahoch-ako-povedat-nie-s-laskou",
    title: "Hranice vo vzťahoch: Ako povedať nie s láskou",
    excerpt:
      "Zdravé hranice nie sú múry, ale dvere. Naučíte sa komunikovať svoje potreby bez pocitu viny a strachu. Čím jemnejšie svoje hranice artikulujete.",
    date: "24. septembra 2025",
    category: "vztahy",
    image: { src: "/images/blog/blog-4.png", alt: "Abstraktný drak" },
    body: [
      "Mnohí z nás vyrastali v prostredí, kde povedať 'nie' bolo vnímané ako sebectvo, nevďačnosť alebo agresivita. Naučili sme sa súhlasiť, aby sme udržali pokoj — a postupne sme stratili kontakt s vlastnými potrebami. Zdravé hranice sú pritom základom každého funkčného vzťahu.",
      "Hranica nie je útok na druhú osobu. Je to informácia o tom, čo pre nás funguje a čo nie. Keď poviem 'nemôžem ti pomôcť tento víkend,' nehovorím 'nezáleží mi na tebe.' Hovorím 'záleží mi aj na sebe, a teraz potrebujem priestor pre seba.'",
      "Asertívna komunikácia — schopnosť vyjadriť svoje potreby priamo, bez agresivity aj bez pasivity — je zručnosť, ktorú sa dá naučiť. Začína sebapoznaním: čo pre mňa skutočne funguje? Kde cítim odpor, vyčerpanie, hnev? Tieto emócie sú kompasmi, ktoré nám ukazujú, kde hranice chýbajú.",
      "Konkrétna technika: keď potrebujete niečo odmietnuť, použite trojkrokové 'nie s empatiou' — uznajte potrebu druhého, vysvetlite svoju situáciu, navrhnite alternatívu ak je to možné. Napríklad: 'Chápem, že to pre teba veľa znamená. Tento týždeň to naozaj nestíham — čo takto budúci víkend?'",
      "Pamätajte, že ľudia, ktorí rešpektujú vaše hranice, sú ľudia, s ktorými stojí za to byť. A tí, ktorí ich nerešpektujú, vám vlastne ukazujú dôležitú informáciu o kvalite tohto vzťahu.",
    ],
  },
  {
    slug: "digitalny-detox-ako-znovu-najst-spojenie-so-sebou",
    title: "Digitálny detox: Ako znovu nájsť spojenie so sebou",
    excerpt:
      "V svete neustálych notifikácií je ticho luxusom. Praktický návod, ako odpojiť a znásobiť svoju pozornosť a duševnú pohodu v digitálnej dobe.",
    date: "19. októbra 2024",
    category: "sebarozvoj",
    image: { src: "/images/blog/blog-5.png", alt: "sebarozvoj" },
    body: [
      "Priemerný človek sa pozrie na telefón 96-krát denne — teda raz za desať minút. Každé toto prerušenie stojí v priemere 23 minút sústredenia, kým sa mozog vráti do hlbokého pracovného stavu. Sme najrozptýlenejšia generácia v histórii ľudstva.",
      "Digitálne technológie nie sú zlé samy o sebe. Problémom je dizajn aplikácií, ktorý je zámerné navrhnutý tak, aby maximalizoval čas strávený na platforme — pomocou notifikácií, nekonečného scrollovania a systémov odmien, ktoré aktivujú dopamínové obvody mozgu rovnako ako hazardné hry.",
      "Digitálny detox nemusí znamenať úplné odpojenie. Účinnejšie sú malé, udržateľné zmeny: žiadny telefón prvú hodinu po prebudení, telefón mimo spálne počas noci, vypnuté všetky notifikácie okrem hovorov. Tieto malé gestá zásadne menia váš vzťah s technológiami.",
      "Čo robiť s časom, ktorý sa takto uvoľní? Toto je kľúčová otázka. Mnohí ľudia zistia, že digitálna závislosť maskuje hlbší diskomfort — nudu, osamelosť, úzkosť. Detox je príležitosť stretnúť sa s týmito pocitmi a namiesto úniku ich preskúmať.",
      "Skúste jeden experiment: na týždeň si nastavte limit 30 minút denne na sociálne siete. Všimnite si, čo sa zmení — vo vašej koncentrácii, vo vzťahoch, v tom, ako trávite voľný čas. Výsledky vás môžu prekvapiť.",
    ],
  },
  {
    slug: "vedome-dychanie-nastroj-pre-okamzity-pokoj",
    title: "Vedomé dýchanie: Nástroj pre okamžitý pokoj",
    excerpt:
      "Dych je most medzi telom a mysľou. Jednoduchá technika vedomého dýchania dokáže za minúty znížiť stres a ukotviť vás v prítomnom okamihu.",
    date: "29. septembra 2024",
    category: "relaxacia",
    image: { src: "/images/blog/blog-6.png", alt: "relaxacia" },
    body: [
      "Dýchanie je jediná autonómna funkcia tela, ktorú vieme vedome ovládať. Práve táto vlastnosť z neho robí mocný most medzi našou vôľou a nervovým systémom. Keď spomalíme dych, vyšleme telu signál bezpečia — a telo reaguje okamžite.",
      "Technika 4-7-8 je jednou z najjednoduchších a najúčinnejších. Nadýchnite sa nosom na 4 sekundy, zadržte dych na 7 sekúnd a pomaly vydýchnite ústami na 8 sekúnd. Tento cyklus zopakujte štyrikrát. Výsledok? Znížená srdcová frekvencia, uvoľnené svaly a jasnejšia myseľ — všetko za menej ako dve minúty.",
      "Brušné dýchanie, známe aj ako bránicové, je ďalší nástroj, ktorý môžete využiť kedykoľvek. Na rozdiel od plytého hrudného dýchania aktivuje parasympatický nervový systém — ten zodpovedný za odpočinok a regeneráciu. Položte ruku na brucho a sledujte, ako sa pri nádychu dvíha. Ak sa dvíha hrudník, dýchate plytko.",
      "Vedomé dýchanie nie je len o zvládaní stresu. Pravidelná prax zlepšuje koncentráciu, zvyšuje energiu a pomáha pri nespavosti. Štúdie potvrdili, že ľudia, ktorí denne venujú päť minút dychovým cvičeniam, vykazujú nižšie hladiny kortizolu a lepšiu emocionálnu reguláciu po šiestich týždňoch.",
      "Začnite dnes — nepotrebujete žiadne vybavenie, špeciálne miesto ani čas. Stačí zavrieť oči, položiť ruku na brucho a tri hlboké nádechy. Niekedy práve toto malé gesto stačí na to, aby sa celý deň začal inak.",
    ],
  },
];
