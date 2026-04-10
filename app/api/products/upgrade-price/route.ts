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

    // Track which children the user owns
    const ownedChildIds = new Set(ownedOrders.map((o) => o.productId));
    const ownedCount = ownedChildIds.size;

    // If user already owns all guides in the bundle, no upgrade needed
    if (ownedCount >= childSlugs.length) {
      return NextResponse.json({ upgradePrice: null, alreadyOwnsAll: true });
    }

    // Calculate total credit: sum of individual purchases + sub-bundle purchases.
    // Children from bundle purchases have amountCents = 0, so we need to find
    // and credit the sub-bundle order directly.
    let totalCredit = 0;

    // 1. Credit individual purchases (orders with amountCents > 0)
    const paidByProduct: Record<string, number> = {};
    for (const o of ownedOrders) {
      if (o.amountCents > 0) {
        paidByProduct[o.productId] = Math.max(
          paidByProduct[o.productId] || 0,
          o.amountCents,
        );
      }
    }
    totalCredit += Object.values(paidByProduct).reduce((sum, v) => sum + v, 0);

    // 2. Credit sub-bundle purchases whose children overlap with this bundle.
    //    Each sub-bundle is credited once at full price (that's what the user paid).
    for (const [subBundleSlug, subChildSlugs] of Object.entries(BUNDLE_CONTENTS)) {
      if (subBundleSlug === slug) continue; // skip the bundle being upgraded to
      // Does this sub-bundle overlap with our target bundle's children?
      if (!subChildSlugs.some((s) => childSlugs.includes(s))) continue;

      const subBundle = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.slug, subBundleSlug), eq(products.isBundle, true)))
        .limit(1);
      if (subBundle.length === 0) continue;

      const subBundleOrder = await db
        .select({ amountCents: orders.amountCents })
        .from(orders)
        .where(
          and(
            eq(orders.userId, user[0].id),
            eq(orders.productId, subBundle[0].id),
            eq(orders.status, 'completed'),
          ),
        )
        .limit(1);

      if (subBundleOrder.length > 0) {
        totalCredit += subBundleOrder[0].amountCents;
      }
    }

    const upgradePrice = Math.max(0, bundle[0].priceCents - totalCredit);

    // User already paid more than the bundle costs - no upgrade needed
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
