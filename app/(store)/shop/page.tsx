import { Suspense } from "react";
import type { Metadata } from "next";
import { getActiveProducts, getProductsByCategory } from "@/lib/db/queries";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";
import BundleHighlight from "@/components/shop/BundleHighlight";
import TrustBadges from "@/components/shared/TrustBadges";
import EmailForm from "@/components/EmailForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Activity Packs",
  description:
    "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
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
    // DB not available — show empty store gracefully
  }

  // Separate bundles for the highlight section (only when showing all)
  const bundles = !category
    ? allProducts.filter((p) => p.isBundle)
    : [];
  const displayProducts = category
    ? allProducts
    : allProducts;

  // Get the master bundle for the featured highlight
  const masterBundle = bundles.find((b) => b.slug === "master-bundle") || bundles[0];

  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 text-center">
          <p className="text-sm font-medium text-gold uppercase tracking-widest mb-4">
            Printable Activity Packs
          </p>
          <h1 className="font-display text-4xl text-forest sm:text-5xl md:text-6xl leading-tight">
            Real Life Is the Best Classroom
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl text-gray-600">
            Printable activity packs that turn everyday moments into meaningful
            learning. No curriculum. No lesson plans. No prep &mdash; just
            print, pick one, and start.
          </p>
          <div className="mt-8">
            <TrustBadges />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
        {/* Featured Bundle */}
        {masterBundle && !category && (
          <section className="mb-10">
            <BundleHighlight
              name={masterBundle.name}
              slug={masterBundle.slug}
              priceCents={masterBundle.priceCents}
              compareAtPriceCents={masterBundle.compareAtPriceCents}
              activityCount={masterBundle.activityCount}
            />
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>
        </section>

        {/* Product Grid */}
        <section>
          <ProductGrid products={displayProducts} />
        </section>
      </div>

      {/* Bottom CTA — Dark Section */}
      <section className="bg-forest text-cream py-20 md:py-28">
        <div className="mx-auto max-w-xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl md:text-5xl mb-4">
            Not sure where to start?
          </h2>
          <p className="text-cream/80 text-lg mb-8">
            Grab our free Future-Ready Skills Map &mdash; a simple guide to
            what matters now, without the overwhelm. We&rsquo;ll send you ideas
            and inspiration every week.
          </p>
          <EmailForm variant="dark" />
        </div>
      </section>
    </div>
  );
}
