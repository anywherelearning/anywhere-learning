import { db } from './index';
import { products, orders, users } from './schema';
import { eq, and, desc, ne } from 'drizzle-orm';

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
