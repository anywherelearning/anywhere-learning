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
    'spring-outdoor-pack', 'summer-outdoor-pack', 'autumn-outdoor-pack', 'winter-outdoor-pack',
    'nature-journal-walks', 'backyard-science-experiments',
    'creative-thinking-pack', 'storytelling-writing-pack',
    'kitchen-maths-cooking', 'map-reading-navigation', 'money-budgeting-pack',
    'critical-thinking-pack', 'problem-solving-pack',
    'ai-literacy-starter',
  ],
  'seasonal-bundle': [
    'spring-outdoor-pack', 'summer-outdoor-pack', 'autumn-outdoor-pack', 'winter-outdoor-pack',
  ],
  'real-world-bundle': [
    'kitchen-maths-cooking', 'map-reading-navigation', 'money-budgeting-pack',
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
