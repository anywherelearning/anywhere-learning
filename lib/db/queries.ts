import { db } from './index';
import { products, orders, users, reviews } from './schema';
import { eq, and, desc, ne, avg, count, gt, inArray, sql } from 'drizzle-orm';

export async function getActiveProducts() {
  return db.select().from(products)
    .where(eq(products.active, true))
    .orderBy(products.sortOrder);
}

export async function getProductBySlug(slug: string) {
  const result = await db.select().from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  return result[0] || null;
}

export async function getProductsByCategory(category: string) {
  return db.select().from(products)
    .where(and(eq(products.category, category), eq(products.active, true)))
    .orderBy(products.sortOrder);
}

export async function getRelatedProducts(currentSlug: string, category: string, limit = 3) {
  return db.select().from(products)
    .where(and(
      eq(products.active, true),
      ne(products.slug, currentSlug),
      eq(products.category, category),
    ))
    .orderBy(products.sortOrder)
    .limit(limit);
}

export async function getUserByClerkId(clerkId: string) {
  const result = await db.select().from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return result[0] || null;
}

export async function getUserPurchases(clerkId: string, email?: string) {
  let user = await db.select().from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  // If no user found by clerkId but we have an email, check for an existing user
  // created by the Stripe webhook (before sign-in) or from a different Clerk
  // instance (e.g. test → production migration). Update the stale clerkId so
  // future lookups are instant.
  if (user.length === 0 && email) {
    const existingUser = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].clerkId !== clerkId) {
      // Link this Clerk account to the existing user
      await db.update(users)
        .set({ clerkId })
        .where(eq(users.id, existingUser[0].id));
      user = [{ ...existingUser[0], clerkId }];
    }
  }

  if (user.length === 0) return [];

  const allPurchases = await db.select({
    order: orders,
    product: products,
  })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .where(and(
      eq(orders.userId, user[0].id),
      inArray(orders.status, ['completed', 'partially_refunded']),
    ))
    .orderBy(desc(orders.purchasedAt));

  // Deduplicate by product ID - keep the order with the highest amountCents
  // (so individual purchases aren't shadowed by $0 bundle-expansion orders)
  const bestByProduct = new Map<string, typeof allPurchases[0]>();
  for (const p of allPurchases) {
    const existing = bestByProduct.get(p.product.id);
    if (!existing || p.order.amountCents > existing.order.amountCents) {
      bestByProduct.set(p.product.id, p);
    }
  }
  return Array.from(bestByProduct.values());
}

// ─── Downloads Page: Growth Queries ──────────────────────────────────

/** Cross-sell mapping: category → complementary categories (ordered by relevance) */
const crossSellMap: Record<string, string[]> = {
  'outdoor-learning': ['creativity-maker', 'real-world-math'],
  'creativity-maker': ['outdoor-learning', 'communication-writing'],
  'ai-literacy': ['planning-problem-solving', 'communication-writing'],
  'real-world-math': ['entrepreneurship', 'outdoor-learning'],
  'communication-writing': ['creativity-maker', 'entrepreneurship'],
  'entrepreneurship': ['real-world-math', 'planning-problem-solving'],
  'planning-problem-solving': ['entrepreneurship', 'real-world-math'],
  'start-here': ['outdoor-learning', 'creativity-maker'],
};

/** Season slug mapping for seasonal prompts */
const seasonalSlugs: Record<string, string> = {
  spring: 'spring-outdoor-pack',
  summer: 'summer-outdoor-pack',
  fall: 'fall-outdoor-pack',
  winter: 'winter-outdoor-pack',
};

function getCurrentSeason(): string {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

/**
 * Get seasonal product suggestion if user doesn't own the current season's pack.
 */
export async function getSeasonalSuggestion(purchasedProductIds: string[]) {
  const season = getCurrentSeason();
  const slug = seasonalSlugs[season];
  if (!slug) return null;

  const product = await getProductBySlug(slug);
  if (!product) return null;
  if (purchasedProductIds.includes(product.id)) return null;

  return { product, season };
}

/**
 * Get cross-sell products from complementary categories.
 * Returns up to 3 products the user hasn't purchased yet.
 */
export async function getCrossSellProducts(
  purchasedProductIds: string[],
  purchasedCategories: string[],
  limit = 3,
) {
  // Find complementary categories the user hasn't bought from yet
  const targetCategories = new Set<string>();
  for (const cat of purchasedCategories) {
    const targets = crossSellMap[cat];
    if (targets) {
      for (const target of targets) {
        if (!purchasedCategories.includes(target)) {
          targetCategories.add(target);
        }
      }
    }
  }

  if (targetCategories.size === 0) {
    // Fallback: suggest from any category user hasn't bought from
    const allCats = Object.values(crossSellMap).flat();
    for (const cat of allCats) {
      if (!purchasedCategories.includes(cat)) {
        targetCategories.add(cat);
        if (targetCategories.size >= 2) break;
      }
    }
  }

  if (targetCategories.size === 0) return [];

  const targetArray = Array.from(targetCategories);
  const allResults = await db.select().from(products)
    .where(and(
      eq(products.active, true),
      eq(products.isBundle, false),
      inArray(products.category, targetArray),
    ))
    .orderBy(products.sortOrder)
    .limit(limit + purchasedProductIds.length);

  // Filter out already-purchased
  return allResults
    .filter(p => !purchasedProductIds.includes(p.id))
    .slice(0, limit);
}

/**
 * Get products added in the last 30 days that the user hasn't purchased.
 */
export async function getNewProducts(purchasedProductIds: string[], limit = 2) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const results = await db.select().from(products)
    .where(and(
      eq(products.active, true),
      eq(products.isBundle, false),
      gt(products.createdAt, thirtyDaysAgo),
    ))
    .orderBy(desc(products.createdAt))
    .limit(limit + purchasedProductIds.length);

  return results
    .filter(p => !purchasedProductIds.includes(p.id))
    .slice(0, limit);
}

// ─── Reviews ────────────────────────────────────────────────────────

export async function getProductReviews(productId: string) {
  return db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    createdAt: reviews.createdAt,
    updatedAt: reviews.updatedAt,
    // Only extract the first name from the email - never expose full email
    displayName: sql<string>`initcap(split_part(split_part(${users.email}, '@', 1), '.', 1))`,
  })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function getUserReviewForProduct(userId: string, productId: string) {
  const result = await db.select().from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
    .limit(1);
  return result[0] || null;
}

export async function getProductReviewStats(productId: string) {
  const result = await db.select({
    avgRating: avg(reviews.rating),
    reviewCount: count(reviews.id),
  })
    .from(reviews)
    .where(eq(reviews.productId, productId));
  return {
    averageRating: result[0]?.avgRating ? parseFloat(result[0].avgRating) : 0,
    reviewCount: Number(result[0]?.reviewCount ?? 0),
  };
}

/**
 * Fetch review stats for every product in a single query, keyed by slug.
 * Used by the shop grid / homepage carousel so ProductCard can render
 * stars + count without an N+1 query fanout.
 */
export async function getAllReviewStatsBySlug(): Promise<Record<string, { averageRating: number; reviewCount: number }>> {
  const rows = await db.select({
    slug: products.slug,
    avgRating: avg(reviews.rating),
    reviewCount: count(reviews.id),
  })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .groupBy(products.slug);

  const statsBySlug: Record<string, { averageRating: number; reviewCount: number }> = {};
  for (const row of rows) {
    statsBySlug[row.slug] = {
      averageRating: row.avgRating ? parseFloat(row.avgRating) : 0,
      reviewCount: Number(row.reviewCount ?? 0),
    };
  }
  return statsBySlug;
}

export async function hasUserPurchasedProduct(userId: string, productId: string) {
  const result = await db.select().from(orders)
    .where(and(
      eq(orders.userId, userId),
      eq(orders.productId, productId),
      eq(orders.status, 'completed'),
    ))
    .limit(1);
  return result.length > 0;
}

