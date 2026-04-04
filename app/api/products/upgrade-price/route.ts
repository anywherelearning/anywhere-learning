import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { BUNDLE_CONTENTS } from '@/lib/cart';

/**
 * GET /api/products/upgrade-price?slug=nature-art-bundle
 * Returns the upgrade price for a bundle if the signed-in user owns child products.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ upgradePrice: null });
  }

  try {
    // Find user
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ upgradePrice: null });
    }

    // Get bundle info
    const bundle = await db
      .select({ id: products.id, priceCents: products.priceCents })
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isBundle, true)))
      .limit(1);

    if (bundle.length === 0) {
      return NextResponse.json({ upgradePrice: null });
    }

    // Check if user already owns this bundle
    const bundleOrder = await db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.userId, user[0].id),
          eq(orders.productId, bundle[0].id),
          eq(orders.status, 'completed'),
        ),
      )
      .limit(1);

    if (bundleOrder.length > 0) {
      return NextResponse.json({ upgradePrice: null, alreadyOwnsAll: true });
    }

    // Find child products
    const childSlugs = BUNDLE_CONTENTS[slug];
    if (!childSlugs || childSlugs.length === 0) {
      return NextResponse.json({ upgradePrice: null });
    }

    const childProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(inArray(products.slug, childSlugs));

    if (childProducts.length === 0) {
      return NextResponse.json({ upgradePrice: null });
    }

    const childIds = childProducts.map((p) => p.id);

    // Get completed orders for child products
    const ownedOrders = await db
      .select({
        productId: orders.productId,
        amountCents: orders.amountCents,
      })
      .from(orders)
      .where(
        and(
          eq(orders.userId, user[0].id),
          inArray(orders.productId, childIds),
          eq(orders.status, 'completed'),
        ),
      );

    if (ownedOrders.length === 0) {
      return NextResponse.json({ upgradePrice: null });
    }

    // Sum max payment per product
    const paidByProduct: Record<string, number> = {};
    for (const o of ownedOrders) {
      paidByProduct[o.productId] = Math.max(
        paidByProduct[o.productId] || 0,
        o.amountCents,
      );
    }
    const ownedCount = Object.keys(paidByProduct).length;

    // If user already owns all packs in the bundle, no upgrade needed
    if (ownedCount >= childSlugs.length) {
      return NextResponse.json({ upgradePrice: null, alreadyOwnsAll: true });
    }

    const totalCredit = Object.values(paidByProduct).reduce((sum, v) => sum + v, 0);
    const upgradePrice = Math.max(0, bundle[0].priceCents - totalCredit);

    // User already paid more than the bundle costs — no upgrade needed
    if (upgradePrice === 0) {
      return NextResponse.json({ upgradePrice: null });
    }

    return NextResponse.json({
      upgradePrice,
      totalCredit,
      ownedCount,
      totalCount: childSlugs.length,
    });
  } catch (error) {
    console.error('Upgrade price error:', error);
    return NextResponse.json({ upgradePrice: null });
  }
}
