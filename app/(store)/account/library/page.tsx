import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserByClerkId, hasActiveMembership, getActiveProducts, getUserPurchases } from '@/lib/db/queries';
import LibraryGrid from '@/components/account/LibraryGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Library',
  description: 'Browse and open every activity pack included in your membership.',
  robots: { index: false, follow: false },
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect('/sign-in');

  const isMember = await hasActiveMembership(user.id);
  if (!isMember) redirect('/membership');

  const { welcome } = await searchParams;

  // Get all active products for the library
  const allProducts = await getActiveProducts();

  // Get user's purchases to show download badges
  const purchases = await getUserPurchases(clerkId);
  const purchasedIds = new Set(purchases.map((p) => p.product.id));

  // Filter to non-bundle individual products for the library grid
  // (bundles are access containers - their individual products are what members view)
  const libraryProducts = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    imageUrl: p.imageUrl,
    category: p.category,
    isBundle: p.isBundle,
    ageRange: p.ageRange,
    activityCount: p.activityCount,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      {/* Welcome banner for new members */}
      {welcome && (
        <div className="mb-8 bg-forest/5 border border-forest/15 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">&#x1F389;</p>
          <h2 className="font-display text-xl text-forest mb-1">
            Welcome to your membership!
          </h2>
          <p className="text-gray-500 text-sm">
            Every activity pack is now yours to explore. Pick one and dive in.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 bg-forest rounded-full animate-pulse" />
            Active Member
          </div>
          <h1 className="font-display text-3xl text-forest sm:text-4xl">
            Your Library
          </h1>
          <p className="mt-2 text-gray-500">
            {libraryProducts.length} activity guides, all included in your membership.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/account/downloads"
            className="text-sm text-gray-500 hover:text-forest transition-colors"
          >
            My Downloads
          </Link>
          <Link
            href="/api/billing/portal"
            className="text-sm text-gray-500 hover:text-forest transition-colors"
          >
            Manage Subscription
          </Link>
        </div>
      </div>

      <LibraryGrid products={libraryProducts} purchasedIds={purchasedIds} />
    </div>
  );
}
