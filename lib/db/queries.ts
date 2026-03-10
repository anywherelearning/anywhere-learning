import { db } from './index';
import { products, orders, users, reviews, subscriptions } from './schema';
import { eq, and, desc, ne, avg, count, gt } from 'drizzle-orm';

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

export async function getUserPurchases(clerkId: string) {
  const user = await db.select().from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (user.length === 0) return [];

  return db.select({
    order: orders,
    product: products,
  })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .where(and(
      eq(orders.userId, user[0].id),
      eq(orders.status, 'completed'),
    ))
    .orderBy(desc(orders.purchasedAt));
}

// ─── Reviews ────────────────────────────────────────────────────────

export async function getProductReviews(productId: string) {
  return db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    createdAt: reviews.createdAt,
    updatedAt: reviews.updatedAt,
    userEmail: users.email,
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

// ─── Subscriptions / Membership ─────────────────────────────────────

export async function getActiveSubscription(userId: string) {
  const result = await db.select().from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active'),
      gt(subscriptions.currentPeriodEnd, new Date()),
    ))
    .limit(1);
  return result[0] || null;
}

export async function hasActiveMembership(userId: string): Promise<boolean> {
  const sub = await getActiveSubscription(userId);
  return sub !== null;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0] || null;
}
