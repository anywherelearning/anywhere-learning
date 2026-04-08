import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { orders, products, downloads, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { streamBlobToResponse } from '@/lib/blob';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  // Rate limit: 30 req / 60s - blob streaming is resource-intensive
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  const { fileId: productId } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (user.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check user owns this product
  const order = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, user[0].id),
        eq(orders.productId, productId),
        eq(orders.status, 'completed'),
      ),
    )
    .limit(1);

  if (order.length === 0) {
    return NextResponse.json({ error: 'Not purchased' }, { status: 403 });
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

  const isView = req.nextUrl.searchParams.get('view') === '1';

  // Log download (don't await - fire-and-forget so it doesn't slow the response)
  db.insert(downloads).values({
    orderId: order[0].id,
    userId: user[0].id,
    productId: productId,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  }).catch(() => {});

  // For "view" mode: redirect straight to the Vercel Blob CDN URL.
  // Auth is already verified above, so the user earned access.
  // Blob URLs are long random strings (unguessable) and served from
  // Vercel's edge CDN - much faster than proxying through our server.
  if (isView && product[0].blobUrl) {
    return NextResponse.redirect(product[0].blobUrl);
  }

  // For downloads: stream through our server so we can set Content-Disposition
  try {
    const blobResponse = await streamBlobToResponse(product[0].blobUrl);
    const fileName = `${product[0].slug}.pdf`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    };

    // Forward content-length so the browser shows a progress bar
    const contentLength = blobResponse.headers.get('content-length');
    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new NextResponse(blobResponse.body, { headers });
  } catch {
    return NextResponse.json({ error: 'File not available' }, { status: 500 });
  }
}
