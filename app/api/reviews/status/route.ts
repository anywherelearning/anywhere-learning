import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, hasUserPurchasedProduct, getUserReviewForProduct } from '@/lib/db/queries';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  // Rate limit: 30 req / 60s — lightweight read endpoint
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = req.nextUrl.searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ hasPurchased: false, existingReview: null });
    }

    const hasPurchased = await hasUserPurchasedProduct(user.id, productId);
    const existingReview = hasPurchased
      ? await getUserReviewForProduct(user.id, productId)
      : null;

    return NextResponse.json({ hasPurchased, existingReview });
  } catch (error) {
    console.error('Error checking review status:', error);
    return NextResponse.json({ hasPurchased: false, existingReview: null });
  }
}
