/**
 * Hardcoded product data used when the database is unavailable.
 * Both the shop listing and product detail pages fall back to this data.
 */

export interface FallbackProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  lemonVariantId: string;
  blobUrl: string;
  imageUrl: string | null;
  category: string;
  isBundle: boolean;
  bundleProductIds: string | null;
  activityCount: number | null;
  ageRange: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
}

export const fallbackProducts: FallbackProduct[] = [
  {
    id: "fb-master-bundle",
    name: "Master Bundle (Everything)",
    slug: "master-bundle",
    description:
      "Every activity pack we make, in one instant download. 220+ activities spanning nature, cooking, creative thinking, seasonal adventures, and real-world life skills. New packs are added as we create them — and you'll get those too. This is everything your family needs for years of meaningful, no-prep learning.",
    shortDescription:
      "Every activity pack we make — 220+ activities in one download.",
    priceCents: 8999,
    compareAtPriceCents: 19883,
    lemonVariantId: "",
    blobUrl: "",
    imageUrl: null,
    category: "bundle",
    isBundle: true,
    bundleProductIds: null,
    activityCount: 220,
    ageRange: "Ages 4–14",
    sortOrder: 0,
    active: true,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "fb-seasonal-bundle",
    name: "Full Seasonal Bundle",
    slug: "seasonal-bundle",
    description:
      "All four seasonal packs in one download — spring, summer, autumn, and winter. 80 outdoor activities designed to match each season's unique energy and opportunities. From spring planting and bird-watching to winter star-gazing and ice experiments. Your family gets a full year of outdoor learning, ready to print whenever the season changes.",
    shortDescription:
      "All 4 seasonal packs — 80 outdoor activities for every time of year.",
    priceCents: 4999,
    compareAtPriceCents: 5996,
    lemonVariantId: "",
    blobUrl: "",
    imageUrl: null,
    category: "bundle",
    isBundle: true,
    bundleProductIds: null,
    activityCount: 80,
    ageRange: "Ages 4–14",
    sortOrder: 1,
    active: true,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "fb-nature-journal",
    name: "Nature Journal & Walk Cards",
    slug: "nature-journal-walks",
    description:
      "25 nature walk prompts and journaling activities that turn any outdoor walk into a rich observation and science experience. Each card gives your child a specific focus — tracking shadows, sketching bark patterns, listening for bird calls, mapping a puddle ecosystem. No nature expertise required from you. Just print a card, step outside, and let curiosity lead.",
    shortDescription:
      "25 nature walk prompts and journaling activities that turn any outdoor walk into a rich observation and science experience.",
    priceCents: 999,
    compareAtPriceCents: null,
    lemonVariantId: "",
    blobUrl: "",
    imageUrl: null,
    category: "nature",
    isBundle: false,
    bundleProductIds: null,
    activityCount: 25,
    ageRange: "Ages 4–14",
    sortOrder: 2,
    active: true,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "fb-spring-outdoor",
    name: "Spring Outdoor Learning Pack",
    slug: "spring-outdoor-pack",
    description:
      "20 outdoor activities that use spring's energy to build real-world skills. Plant a seed and track its growth. Build a bug hotel. Create a rain gauge from a jar. Map the birds in your garden. Every activity connects to science, maths, or literacy — but feels like adventure, not homework. Designed for families who want their kids learning outside, not staring at screens.",
    shortDescription:
      "20 outdoor activities that use spring's energy to build real-world skills.",
    priceCents: 1499,
    compareAtPriceCents: null,
    lemonVariantId: "",
    blobUrl: "",
    imageUrl: null,
    category: "seasonal",
    isBundle: false,
    bundleProductIds: null,
    activityCount: 20,
    ageRange: "Ages 4–14",
    sortOrder: 3,
    active: true,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "fb-kitchen-maths",
    name: "Kitchen Maths & Cooking Cards",
    slug: "kitchen-maths-cooking",
    description:
      "20 recipe-based activities that turn cooking into real maths, science, and life skills practice. Double a recipe to practise fractions. Estimate cooking times. Convert measurements. Calculate the cost per serving. Your kids learn by making real food your family actually eats — not by filling in worksheets about imaginary pizzas.",
    shortDescription:
      "20 recipe-based activities that turn cooking into real maths, science, and life skills practice.",
    priceCents: 999,
    compareAtPriceCents: null,
    lemonVariantId: "",
    blobUrl: "",
    imageUrl: null,
    category: "real-world",
    isBundle: false,
    bundleProductIds: null,
    activityCount: 20,
    ageRange: "Ages 4–14",
    sortOrder: 4,
    active: true,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "fb-creative-thinking",
    name: "Creative Thinking Pack",
    slug: "creative-thinking-pack",
    description:
      "25 open-ended creative challenges that build divergent thinking and artistic confidence. Design a new animal species. Invent a game with rules. Create a map of an imaginary island. Build a structure from newspaper. These aren't crafts with a 'right' answer — they're invitations to think differently, take creative risks, and make something that didn't exist before.",
    shortDescription:
      "25 open-ended creative challenges that build divergent thinking and artistic confidence.",
    priceCents: 999,
    compareAtPriceCents: null,
    lemonVariantId: "",
    blobUrl: "",
    imageUrl: null,
    category: "creativity",
    isBundle: false,
    bundleProductIds: null,
    activityCount: 25,
    ageRange: "Ages 4–14",
    sortOrder: 5,
    active: true,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "fb-skills-map",
    name: "The Future-Ready Skills Map",
    slug: "future-ready-skills-map",
    description:
      "A comprehensive 42-page parent guide to the 10 skills that matter most for your child's future — from emotional intelligence and critical thinking to AI literacy and life skills. Organised into three age bands (0–6, 6–11, 11–14+), each section includes what to develop, what mastery looks like, hands-on activities, a sample week, and a one-page skills-at-a-glance overview. This isn't a curriculum — it's a map. It shows you what to prioritise so you can stop second-guessing and start trusting the learning that's already happening.",
    shortDescription:
      "A 42-page parent guide to the 10 skills that matter most — with activities, milestones, and sample weeks for ages 0–14+.",
    priceCents: 999,
    compareAtPriceCents: null,
    lemonVariantId: "",
    blobUrl: "",
    imageUrl: null,
    category: "life-skills",
    isBundle: false,
    bundleProductIds: null,
    activityCount: null,
    ageRange: "Ages 0–14+",
    sortOrder: 6,
    active: true,
    createdAt: new Date("2025-01-01"),
  },
];

export function getFallbackProductBySlug(slug: string): FallbackProduct | null {
  return fallbackProducts.find((p) => p.slug === slug) ?? null;
}

export function getFallbackProducts(): FallbackProduct[] {
  return fallbackProducts.filter((p) => p.active);
}
