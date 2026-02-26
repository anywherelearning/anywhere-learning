import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getProductsByCategory } from "@/lib/db/queries";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";
import BundleHighlight from "@/components/shop/BundleHighlight";
import TrustBadges from "@/components/shared/TrustBadges";

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
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-forest sm:text-5xl lg:text-6xl">
            Activity Packs That Make Real Life the Lesson
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Printable. No-prep. Built for families who learn everywhere.
          </p>
          <div className="mt-8">
            <TrustBadges />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        {/* Featured Bundle */}
        {masterBundle && !category && (
          <section className="mb-10">
            <BundleHighlight bundle={masterBundle} />
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

        {/* Bottom CTA */}
        <section className="mt-16 text-center">
          <p className="text-gray-600">Not sure where to start?</p>
          <Link
            href="/"
            className="mt-2 inline-block text-forest font-medium underline underline-offset-2 hover:text-forest-dark"
          >
            Grab our free guide first →
          </Link>
        </section>
      </div>
    </div>
  );
}
