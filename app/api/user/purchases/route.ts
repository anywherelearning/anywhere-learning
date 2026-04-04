import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, orders, products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/user/purchases
 * Returns the slugs of all products the signed-in user has purchased.
 * Used by the shop page to show "Purchased" badges.
 */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ slugs: [] });
  }

  try {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ slugs: [] });
    }

    const purchased = await db
      .select({ slug: products.slug })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(and(eq(orders.userId, user[0].id), eq(orders.status, 'completed')));

    const slugs = purchased.map((p) => p.slug);
    return NextResponse.json({ slugs });
  } catch {
    return NextResponse.json({ slugs: [] });
  }
}
