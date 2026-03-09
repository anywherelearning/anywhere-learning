/** Shopping cart types, constants, and localStorage helpers. */

export interface CartItem {
  slug: string;
  name: string;
  priceCents: number;
  stripePriceId: string;
  category: string;
  isBundle: boolean;
  imageUrl: string | null;
}

export const CART_STORAGE_KEY = 'al_cart';

/** Bundle slug → individual product slugs it contains. */
export const BUNDLE_CONTENTS: Record<string, string[]> = {
  'master-bundle': [
    // Seasonal
    'spring-outdoor-pack', 'summer-outdoor-pack', 'fall-outdoor-pack', 'winter-outdoor-pack',
    // Nature
    'nature-journal-walks', 'nature-walk-task-cards', 'nature-choice-boards',
    'outdoor-learning-missions', 'outdoor-stem-challenges', 'land-art-challenges', 'nature-crafts',
    // Creativity
    'board-game-studio', 'rube-goldberg-machine', 'survival-base',
    'imaginary-world', 'creature-habitat', 'theme-park', 'mini-movie',
    'invent-a-sport', 'kinetic-sculpture', 'build-a-museum',
    // Real-World
    'budget-challenge', 'community-impact', 'kitchen-math-challenge',
    'media-info-check', 'micro-business', 'problem-solver', 'smart-shopper',
    'time-energy-planner', 'travel-day', 'write-like-a-pro',
    // AI & Digital
    'ai-basics', 'algorithm-awareness', 'bias-fairness-lab', 'build-ai-helper',
    'create-with-ai', 'deepfake-spotter', 'hallucination-detective',
    'healthy-tech-boundaries', 'privacy-footprint', 'prompt-like-a-coach',
    // Life Skills
    'future-ready-skills-map', 'my-small-business-project', 'time-capsule',
  ],
  'seasonal-bundle': [
    'spring-outdoor-pack', 'summer-outdoor-pack', 'fall-outdoor-pack', 'winter-outdoor-pack',
  ],
  'creativity-mega-bundle': [
    'board-game-studio', 'rube-goldberg-machine', 'survival-base',
    'imaginary-world', 'creature-habitat', 'theme-park', 'mini-movie',
    'invent-a-sport', 'kinetic-sculpture', 'build-a-museum',
  ],
  'real-world-mega-bundle': [
    'budget-challenge', 'community-impact', 'kitchen-math-challenge',
    'media-info-check', 'micro-business', 'problem-solver', 'smart-shopper',
    'time-energy-planner', 'travel-day', 'write-like-a-pro',
  ],
  'ai-digital-bundle': [
    'ai-basics', 'algorithm-awareness', 'bias-fairness-lab', 'build-ai-helper',
    'create-with-ai', 'deepfake-spotter', 'hallucination-detective',
    'healthy-tech-boundaries', 'privacy-footprint', 'prompt-like-a-coach',
  ],
  'nature-art-bundle': [
    'land-art-challenges', 'nature-crafts', 'nature-journal-walks',
  ],
  'outdoor-toolkit-bundle': [
    'nature-walk-task-cards', 'outdoor-learning-missions', 'outdoor-stem-challenges', 'nature-choice-boards',
  ],
};

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable — cart works as session-only
  }
}

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents, 0);
}

/** Check if any items in the cart overlap with a bundle's contents. */
export function getBundleOverlaps(cartItems: CartItem[], bundleSlug: string): string[] {
  const contained = BUNDLE_CONTENTS[bundleSlug];
  if (!contained) return [];
  return cartItems
    .filter((item) => contained.includes(item.slug))
    .map((item) => item.name);
}
