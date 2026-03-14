import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/db/queries';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * GET /api/products/lookup?slug=seasonal-bundle
 *
 * Returns the CartItem-compatible fields for a product by slug.
 * Used by the cart drawer to fetch real product data (with verified
 * stripePriceId) when performing a bundle swap — the hardcoded
 * BUNDLE_DATA map doesn't contain Stripe price IDs.
 */
export async function GET(req: NextRequest) {
  // Rate limit: 30 req / 60s — public DB query
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  const slug = req.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
  }

  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      stripePriceId: product.stripePriceId,
      category: product.category,
      isBundle: product.isBundle,
      imageUrl: product.imageUrl,
    });
  } catch (error) {
    console.error('Product lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to look up product' },
      { status: 500 },
    );
  }
}
