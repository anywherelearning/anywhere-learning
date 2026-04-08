import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { products, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkProductAccess } from '@/lib/access';
import { streamBlobToResponse } from '@/lib/blob';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * PDF viewing route for members and purchasers.
 * - Members can view inline (no download)
 * - Purchasers can also view inline here
 * - Unlike /api/download, this does NOT log downloads
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  // Rate limit: 30 req / 60s - blob streaming is resource-intensive
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  const { productId } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check access (membership OR purchase)
  const access = await checkProductAccess(clerkId, productId);

  if (!access.hasAccess) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }

  // Get product blob URL
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (product.length === 0) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Stream the file inline (no download prompt)
  try {
    const blobResponse = await streamBlobToResponse(product[0].blobUrl);
    const blob = await blobResponse.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${product[0].slug}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not available' }, { status: 500 });
  }
}
