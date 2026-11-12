export type Flavor = {
  slug: string;
  name: string;
  short: string; // one/two words for giant type
  vibe: string;
  color: string; // primary glow
  color2: string; // secondary
  ink: string; // dark tone for overlays
  tagline: string;
  description: string;
  notes: string[];
  art: string;
  tube: string;
  disp: string;
  box: string;
  tall: string;
  /** textures for the real 3D models (tube label + dabs box faces) */
  tex: { tube: string; front: string | null; side: string | null };
};

const img = (slug: string, k: string) => `/img/p/${slug}-${k}.webp`;

const make = (f: Omit<Flavor, "art" | "tube" | "disp" | "box" | "tall" | "tex">, hasTall = true): Flavor => ({
  ...f,
  art: `/img/art/${f.slug}.webp`,
  tube: img(f.slug, "tube"),
  disp: img(f.slug, "disp"),
  box: img(f.slug, "box"),
  tall: hasTall ? img(f.slug, "tall") : img(f.slug, "box"),
  tex: {
    tube: `/img/3d/${f.slug}-tube.webp`,
    front: hasTall ? `/img/3d/${f.slug}-box-front.webp` : null,
    side: hasTall ? `/img/3d/${f.slug}-box-side.webp` : null,
  },
});

export const FLAVORS: Flavor[] = [
  make({
    slug: "blue-dreamz",
    name: "Blue Dreamz",
    short: "BLUE\nDREAMZ",
    vibe: "Relaxing",
    color: "#1fa8ff",
    color2: "#4b2bff",
    ink: "#020b2e",
    tagline: "Drift into the deep blue.",
    description:
      "The signature. Cold currents, glowing petals and a slow, easy pull. Blue Dreamz is the flavor that started the dive — clean, cool and smooth from the first draw to the last.",
    notes: ["Blueberry", "Cool mint", "Lotus petal"],
  }),
  make(
    {
      slug: "royal-haze",
      name: "Royal Haze",
      short: "ROYAL\nHAZE",
      vibe: "Uplifting",
      color: "#ffb21c",
      color2: "#ff5e00",
      ink: "#2a1400",
      tagline: "Crowned in liquid gold.",
      description:
        "Sunken treasure, finally surfaced. Royal Haze is bright and golden — warm honey up front, a citrus snap behind it and a long amber finish worthy of the throne.",
      notes: ["Golden honey", "Citrus peel", "Amber resin"],
    },
  ),
  make({
    slug: "purple-paradise",
    name: "Purple Paradise",
    short: "PURPLE\nPARADISE",
    vibe: "Mellow",
    color: "#b44bff",
    color2: "#ff2bd6",
    ink: "#1a0230",
    tagline: "An ultraviolet reef of flavor.",
    description:
      "Neon coral, violet tide. Purple Paradise layers dark grape and wild berries over a soft lavender breeze — lush, rounded and impossibly smooth.",
    notes: ["Concord grape", "Wild berry", "Lavender"],
  }),
  make({
    slug: "midnight-lotus",
    name: "Midnight Lotus",
    short: "MIDNIGHT\nLOTUS",
    vibe: "Euphoric",
    color: "#e9ecff",
    color2: "#7d7f99",
    ink: "#050508",
    tagline: "Where the light never reaches.",
    description:
      "The deepest trench. Midnight Lotus is monochrome and mysterious — black currant, night-blooming jasmine and a whisper of smoke from the bottom of the sea.",
    notes: ["Black currant", "Night jasmine", "Soft smoke"],
  }),
  make({
    slug: "cloud-9",
    name: "Cloud 9",
    short: "CLOUD\n9",
    vibe: "Happy",
    color: "#ff9ee0",
    color2: "#ffffff",
    ink: "#2a0b22",
    tagline: "Pearl-pink and weightless.",
    description:
      "Pearls and pink foam. Cloud 9 is sweet and airy — spun cotton candy, vanilla cream and a delicate lotus bloom that floats all the way up.",
    notes: ["Cotton candy", "Vanilla cream", "Pink lotus"],
  }),
  make({
    slug: "egyptian-nights",
    name: "Egyptian Nights",
    short: "EGYPTIAN\nNIGHTS",
    vibe: "Chill",
    color: "#ff2a3d",
    color2: "#ff8a00",
    ink: "#2a0006",
    tagline: "The sacred flower of the Nile.",
    description:
      "Blue Lotus was sacred on the Nile long before it was ours. Egyptian Nights pays tribute — ruby pomegranate, spiced dates and desert rose under a blood-red moon.",
    notes: ["Pomegranate", "Spiced date", "Desert rose"],
  }),
];

export const flavorBySlug = (slug: string) => FLAVORS.find((f) => f.slug === slug);

export const FORMATS = [
  {
    id: "preroll",
    name: "Blue Lotus Pre-Roll",
    size: "2G",
    kicker: "1 pre-roll · child-resistant tube",
    pack: "20-pack countertop display",
    text: "A full two grams of dried Blue Lotus flower and botanicals, hand-rolled and sealed in a glow-printed doob tube.",
    key: "tube" as const,
    pack_key: "disp" as const,
  },
  {
    id: "dabs",
    name: "Blue Lotus Dabs",
    size: "2.5G",
    kicker: "Botanical concentrate",
    pack: "6-flavor display",
    text: "Blue Lotus distilled into a 2.5G botanical concentrate. Same six flavors, a whole new depth.",
    key: "tall" as const,
    pack_key: "box" as const,
  },
];

export const INGREDIENTS = [
  { name: "Blue Lotus", latin: "Nymphaea caerulea", text: "The sacred water lily of ancient Egypt — the heart of every OCTOPUS product." },
  { name: "Damiana", latin: "Turnera diffusa", text: "A fragrant leaf with a sweet, herbal aroma and a long botanical history." },
  { name: "Mugwort", latin: "Artemisia vulgaris", text: "Earthy, sage-like and smooth — a classic herbal-blend base." },
  { name: "Marshmallow Leaf", latin: "Althaea officinalis", text: "Soft and mild, it gives the blend its smooth, even burn." },
];

export const DISCLAIMER =
  "This product is for botanical incense and aromatherapy purposes only. It is not intended for human consumption as a food or dietary supplement. This product is not intended to diagnose, treat, cure, or prevent any disease. These statements have not been evaluated by the Food and Drug Administration (FDA). Must be 21 years of age or older to purchase. Keep out of reach of children and pets. Smoking is hazardous to your health. May cause drowsiness — do not operate a vehicle or machinery after use. Consult a physician before use if you are pregnant, nursing, have a medical condition, or are taking any medication.";

/** OCTOPUS product lines. Add new lines here as they launch. */
export const LINES = [
  {
    id: "blue-lotus",
    name: "Blue Lotus",
    status: "available" as const,
    formats: ["Pre-Roll 2G", "Dabs 2.5G"],
    flavors: 6,
    text: "Six flavors in two formats: Pre-Roll 2G and Dabs 2.5G botanical concentrate — our first line out of the deep.",
    image: "/img/p/lineup-blue.webp",
    art: "/img/art/abyss.webp",
  },
];
