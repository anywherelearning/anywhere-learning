/** Single source of truth for product categories - used by shop page, downloads, and filters. */

export interface CategoryDef {
  value: string;
  label: string;
  description: string;
}

/**
 * Ordered list of product categories.
 * Update this ONE place when adding/removing categories.
 */
export const CATEGORIES: CategoryDef[] = [
  {
    value: 'start-here',
    label: 'Start Here',
    description:
      'The foundation for your learning journey. Start with the big picture.',
  },
  {
    value: 'ai-literacy',
    label: 'AI & Digital',
    description:
      'Responsible tech, critical thinking about AI, and digital citizenship.',
  },
  {
    value: 'communication-writing',
    label: 'Communication & Writing',
    description:
      'Real-world writing and communication skills for kids who have something to say.',
  },
  {
    value: 'creativity-anywhere',
    label: 'Creativity Anywhere',
    description:
      'Open-ended projects that build design thinking and creative confidence.',
  },
  {
    value: 'entrepreneurship',
    label: 'Entrepreneurship',
    description:
      'Plan, launch, and pitch real businesses, from brand building to Shark Tank pitches.',
  },
  {
    value: 'outdoor-learning',
    label: 'Outdoor Learning',
    description:
      'Turn your backyard, park, or trail into a hands-on learning space.',
  },
  {
    value: 'planning-problem-solving',
    label: 'Planning & Problem-Solving',
    description:
      'Tackle real logistics, plan adventures, and solve problems that actually matter.',
  },
  {
    value: 'real-world-math',
    label: 'Real-World Math',
    description:
      'Budgeting, shopping math, fractions in the kitchen, and financial thinking.',
  },
];

/** Quick lookup: category value → label. Includes 'bundle'. */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries([
  ...CATEGORIES.map((c) => [c.value, c.label]),
  ['bundle', 'Bundle'],
]);

/**
 * CSS class for the cover gradient of a product card, by category.
 * Class definitions live in app/globals.css (cover-<category>).
 * Used on shop pages, downloads, and checkout/success.
 */
export const COVER_CLASSES: Record<string, string> = {
  'ai-literacy': 'cover-ai-literacy',
  'creativity-anywhere': 'cover-creativity-anywhere',
  'communication-writing': 'cover-communication-writing',
  'outdoor-learning': 'cover-outdoor-learning',
  'real-world-math': 'cover-real-world-math',
  entrepreneurship: 'cover-entrepreneurship',
  'planning-problem-solving': 'cover-planning-problem-solving',
  'start-here': 'cover-start-here',
  bundle: 'cover-bundle',
};

/** Resolve a cover class for a category, falling back to outdoor-learning. */
export function coverClassFor(category: string | null | undefined): string {
  if (!category) return 'cover-outdoor-learning';
  return COVER_CLASSES[category] || 'cover-outdoor-learning';
}

/** Active pill color per category - used by both shop and downloads filters. */
export const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  '': 'bg-forest text-cream shadow-sm',
  'all': 'bg-forest text-cream shadow-sm',
  'ai-literacy': 'bg-[#7b88a8] text-white shadow-sm',
  'creativity-anywhere': 'bg-[#c47a8f] text-white shadow-sm',
  'communication-writing': 'bg-[#5b8fa8] text-white shadow-sm',
  'outdoor-learning': 'bg-forest text-cream shadow-sm',
  'real-world-math': 'bg-[#8b7355] text-white shadow-sm',
  'entrepreneurship': 'bg-[#c4836a] text-white shadow-sm',
  'planning-problem-solving': 'bg-[#7a6da8] text-white shadow-sm',
  'start-here': 'bg-[#d4a373] text-white shadow-sm',
  bundle: 'bg-gold text-white shadow-sm',
};
