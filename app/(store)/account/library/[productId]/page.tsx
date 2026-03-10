import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkProductAccess } from '@/lib/access';
import nextDynamic from 'next/dynamic';

// Dynamic import — react-pdf requires client-side rendering
const PDFViewer = nextDynamic(() => import('@/components/account/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading viewer&hellip;</p>
    </div>
  ),
});

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await db
    .select({ name: products.name })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return {
    title: product[0]?.name || 'View Pack',
    robots: { index: false, follow: false },
  };
}

export default async function LibraryViewerPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  // Check access (membership or purchase)
  const access = await checkProductAccess(clerkId, productId);

  if (!access.hasAccess) {
    redirect('/membership');
  }

  // Get product info
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (product.length === 0) notFound();

  // User can download if they've purchased (not just a member)
  const canDownload = access.accessType === 'purchased' || access.accessType === 'both';

  return (
    <PDFViewer
      productId={productId}
      productName={product[0].name}
      canDownload={canDownload}
    />
  );
}
