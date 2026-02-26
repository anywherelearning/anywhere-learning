import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { orders, products, downloads, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { streamBlobToResponse } from '@/lib/blob';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
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

  // Log download
  await db.insert(downloads).values({
    orderId: order[0].id,
    userId: user[0].id,
    productId: productId,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  });

  // Stream the file from Vercel Blob
  try {
    const blobResponse = await streamBlobToResponse(product[0].blobUrl);
    const blob = await blobResponse.blob();
    const fileName = `${product[0].slug}.pdf`;

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not available' }, { status: 500 });
  }
}
