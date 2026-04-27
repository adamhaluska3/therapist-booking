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
  },
  {
    slug: "umenie-spomalit-preco-je-nicnerobenie-dolezite",
    title: "Umenie spomalit: Prečo je ničnerobenie dôležité",
    excerpt:
      "V spoločnosti orientovanej na výkon sme zabudli na silu odpočinku. Zistite, ako pasívna relaxácia regeneruje váš mozog a prečo je nevynímateľná pre kreativitu.",
    date: "6. marca 2026",
    category: "relaxacia",
    image: { src: "/images/blog/blog-2.png", alt: "relaxacia" },
  },
  {
    slug: "sebaprijatie-ako-prvy-krok-k-zmene",
    title: "Sebaprijatie ako prvý krok k zmene",
    excerpt:
      "Nemôžete sa zmeniť, kým neprijmete to, kým ste práve teraz. Skúmame hĺbku sebaprijatia a jeho celostného vplyvu na našu psychiku.",
    date: "19. októbra 2025",
    category: "sebarozvoj",
    image: { src: "/images/blog/blog-3.png", alt: "sebarozvoj" },
  },
  {
    slug: "hranice-vo-vztahoch-ako-povedat-nie-s-laskou",
    title: "Hranice vo vzťahoch: Ako povedať nie s láskou",
    excerpt:
      "Zdravé hranice nie sú múry, ale dvere. Naučíte sa komunikovať svoje potreby bez pocitu viny a strachu. Čím jemnejšie svoje hranice artikulujete.",
    date: "24. septembra 2025",
    category: "vztahy",
    image: { src: "/images/blog/blog-4.png", alt: "Abstraktný drak" },
  },
  {
    slug: "digitalny-detox-ako-znovu-najst-spojenie-so-sebou",
    title: "Digitálny detox: Ako znovu nájsť spojenie so sebou",
    excerpt:
      "V svete neustálych notifikácií je ticho luxusom. Praktický návod, ako odpojiť a znásobiť svoju pozornosť a duševnú pohodu v digitálnej dobe.",
    date: "19. októbra 2024",
    category: "sebarozvoj",
    image: { src: "/images/blog/blog-5.png", alt: "sebarozvoj" },
  },
  {
    slug: "vedome-dychanie-nastroj-pre-okamzity-pokoj",
    title: "Vedomé dýchanie: Nástroj pre okamžitý pokoj",
    excerpt:
      "Dych je most medzi telom a mysľou. Jednoduchá technika vedomého dýchania dokáže za minúty znížiť stres a ukotviť vás v prítomnom okamihu.",
    date: "29. septembra 2024",
    category: "relaxacia",
    image: { src: "/images/blog/blog-6.png", alt: "relaxacia" },
  },
];
