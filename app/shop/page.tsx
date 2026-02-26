import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getActiveProducts, getProductsByCategory } from '@/lib/db/queries';
import ProductGrid from '@/components/shop/ProductGrid';
import CategoryFilter from '@/components/shop/CategoryFilter';
import BundleHighlight from '@/components/shop/BundleHighlight';
import EmailForm from '@/components/EmailForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Activity Packs',
  description:
    'Printable activity packs that turn everyday moments into meaningful learning. No curriculum, no worksheets, no prep.',
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
      {/* ─── Section 1: Shop Hero ─── */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 text-center">
          <p className="text-sm font-medium text-gold uppercase tracking-widest mb-4">
            Printable Activity Packs
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-forest leading-tight mb-6">
            Real Life Is the Best Classroom
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Printable activity packs that turn everyday moments into meaningful learning.
            No curriculum. No lesson plans. No prep &mdash; just print, pick one, and start.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="text-forest">&#10003;</span> Instant PDF download
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-forest">&#10003;</span> Ages 4&ndash;14
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-forest">&#10003;</span> Works for any learning style
            </span>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Featured Bundle Banner ─── */}
      {!category && masterBundle && (
        <section className="py-12 bg-gold-light/20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <BundleHighlight
              name={masterBundle.name}
              slug={masterBundle.slug}
              priceCents={masterBundle.priceCents}
              compareAtPriceCents={masterBundle.compareAtPriceCents}
              activityCount={masterBundle.activityCount}
            />
          </div>
        </section>
      )}

      {/* ─── Section 3: Category Filter + Product Grid ─── */}
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>

          <div className="mt-10">
            {!category && bundles.length > 0 && (
              <>
                <h2 className="mb-6 font-display text-2xl text-forest">
                  Bundles &mdash; Best Value
                </h2>
                <ProductGrid products={bundles} />
                <h2 className="mt-16 mb-6 font-display text-2xl text-forest">
                  Individual Packs
                </h2>
              </>
            )}
            <ProductGrid products={category ? allProducts : individual} />
          </div>
        </div>
      </section>

      {/* ─── Section 4: Bottom CTA (Email Capture) ─── */}
      <section className="py-20 md:py-28 bg-forest text-cream">
        <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl md:text-5xl mb-4">
            Not sure where to start?
          </h2>
          <p className="text-cream/80 text-lg mb-8 leading-relaxed">
            Grab our free Future-Ready Skills Map &mdash; a simple guide to what matters now,
            without the overwhelm. We&apos;ll send you ideas and inspiration every week.
          </p>
          <EmailForm variant="dark" />
          <p className="text-cream/50 text-sm mt-4">
            No spam. No fluff. Unsubscribe any time.
          </p>
        </div>
      </section>
    </>
  );
}
