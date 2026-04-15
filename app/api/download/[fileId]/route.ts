import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDownloadUrl } from '@vercel/blob';
import { db } from '@/lib/db';
import { orders, products, downloads, users } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';
import { hasActivePass } from '@/lib/subscription';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  // Rate limit: 30 req / 60s
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

  // Check access: user owns this product OR has an active Annual Pass
  const isMember = await hasActivePass(clerkId);

  let order: { id: string }[] = [];
  if (!isMember) {
    order = await db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.userId, user[0].id),
          eq(orders.productId, productId),
          inArray(orders.status, ['completed', 'partially_refunded']),
        ),
      )
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json({ error: 'Not purchased' }, { status: 403 });
    }
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
  if (order.length > 0) {
    db.insert(downloads).values({
      orderId: order[0].id,
      userId: user[0].id,
      productId: productId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    }).catch(() => {});
  }

  // Redirect to the Vercel Blob CDN after auth checks pass.
  //
  // Why redirect instead of streaming through this serverless function:
  // streaming adds a cold-start + double network hop to every PDF open,
  // which made "Open Guide" feel like a download. Redirecting lets the
  // browser fetch the PDF directly from the Blob CDN edge, so inline
  // viewing is near-instant.
  //
  // Security tradeoff: Vercel Blob URLs contain a long random suffix and
  // are unguessable. They are not truly signed, so once a user has the
  // URL they could in theory share it. We accept this for low-priced
  // PDF guides in exchange for a much better UX. Rotating the store
  // path (re-uploading the blob) invalidates any leaked URL.
  //
  // - `?view=1` → raw blob URL. Vercel Blob serves PDFs with
  //   `Content-Disposition: inline` by default, so the browser opens
  //   them in its built-in PDF viewer.
  // - default   → `getDownloadUrl()` appends `?download=1`, which tells
  //   the Blob CDN to serve `Content-Disposition: attachment` and
  //   trigger the browser's save dialog.
  const targetUrl = isView
    ? product[0].blobUrl
    : getDownloadUrl(product[0].blobUrl);

  return NextResponse.redirect(targetUrl, 302);
}
