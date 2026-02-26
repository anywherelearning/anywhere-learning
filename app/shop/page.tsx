import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getActiveProducts, getProductsByCategory } from '@/lib/db/queries';
import ProductGrid from '@/components/shop/ProductGrid';
import CategoryFilter from '@/components/shop/CategoryFilter';
import BundleHighlight from '@/components/shop/BundleHighlight';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Activity Packs',
  description:
    'Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.',
};

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;

  let allProducts: Awaited<ReturnType<typeof getActiveProducts>> = [];
  try {
    allProducts = category
      ? await getProductsByCategory(category)
      : await getActiveProducts();
  } catch {
    // Database not configured yet — show empty shop
  }

  // Separate bundles and individual products
  const bundles = allProducts.filter((p) => p.isBundle);
  const individual = allProducts.filter((p) => !p.isBundle);

  // Get master bundle for highlight (if showing all or bundles)
  const masterBundle = bundles.find((b) => b.slug === 'master-bundle');

  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl text-forest sm:text-5xl">
            Activity Packs That Make Real Life the Lesson
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            Printable. No-prep. Built for families who learn everywhere.
          </p>
        </div>
      </section>

      {/* Filter + Products */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Category filter */}
          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>

          {/* Master bundle highlight */}
          {!category && masterBundle && (
            <div className="mt-8">
              <BundleHighlight
                name={masterBundle.name}
                slug={masterBundle.slug}
                priceCents={masterBundle.priceCents}
                compareAtPriceCents={masterBundle.compareAtPriceCents}
                activityCount={masterBundle.activityCount}
              />
            </div>
          )}

          {/* Product grid — bundles first, then individual */}
          <div className="mt-10">
            {!category && bundles.length > 0 && (
              <>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Bundles
                </h2>
                <ProductGrid products={bundles} />
                <h2 className="mt-12 mb-6 text-xl font-semibold text-gray-900">
                  Individual Packs
                </h2>
              </>
            )}
            <ProductGrid products={category ? allProducts : individual} />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gold-light/20 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl text-forest sm:text-3xl">
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-gray-600">
            Grab our free guide with 10 real-world life skills activities your
            kids can try this week.
          </p>
          <Link
            href="/free-guide"
            className="mt-6 inline-block rounded-lg bg-forest px-6 py-3 font-semibold text-cream transition-colors hover:bg-forest-dark"
          >
            Get the Free Guide &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
