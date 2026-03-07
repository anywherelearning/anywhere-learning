import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getProductsByCategory } from "@/lib/db/queries";
import { getFallbackProducts } from "@/lib/fallback-products";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";
import BundleHighlight from "@/components/shop/BundleHighlight";
import ScrollReveal from "@/components/shared/ScrollReveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Activity Packs",
  description:
    "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
  openGraph: {
    title: "Shop Activity Packs — Anywhere Learning",
    description:
      "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
    url: "https://anywherelearning.co/shop",
    type: "website",
    images: [
      {
        url: "https://anywherelearning.co/og-default.png",
        width: 1200,
        height: 630,
        alt: "Anywhere Learning Activity Packs",
      },
    ],
  },
};

/* Use shared fallback when DB is unavailable */
const fallbackProducts = getFallbackProducts();

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
    // DB not available — use fallback products
  }

  // Use fallback if DB returned nothing
  const products = allProducts.length > 0 ? allProducts : fallbackProducts;

  // Filter by category if using fallback data
  const filteredProducts = allProducts.length > 0
    ? products
    : category
      ? products.filter((p) => p.category === category)
      : products;

  // Separate bundles for the highlight section (only when showing all)
  const bundles = !category
    ? filteredProducts.filter((p) => p.isBundle)
    : [];

  // Get the master bundle for the featured highlight
  const masterBundle = bundles.find((b) => b.slug === "master-bundle") || bundles[0];

  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Soft background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-gold/[0.04] to-cream" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 text-center hero-stagger">
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            Print &amp; Use Activity Packs
          </p>
          <h1 className="font-display text-4xl text-forest sm:text-5xl lg:text-6xl text-balance mb-4">
            Activity Packs That Make
            <br className="hidden sm:block" /> Real Life the Lesson
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            Printable. No-prep. Built for families who learn everywhere.
          </p>
        </div>
      </section>

      {/* Soft divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-forest/8 to-transparent" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-20">
        {/* Featured Bundle */}
        {masterBundle && !category && (
          <section className="my-12">
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
        <section className="mb-10">
          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>
        </section>

        {/* Product Grid */}
        <section>
          <ProductGrid products={filteredProducts} />
        </section>

        {/* Bottom CTA */}
        <ScrollReveal>
          <section className="mt-20 text-center">
            <div className="bg-forest-section rounded-3xl p-10 md:p-14 shadow-xl">
              <h3 className="font-display text-2xl md:text-4xl text-cream mb-3">
                Not sure where to start?
              </h3>
              <p className="text-cream/60 mb-8 max-w-md mx-auto text-lg">
                Grab our free guide and discover the 10 life skills your kids can build through everyday moments.
              </p>
              <Link
                href="/free-guide"
                className="inline-block bg-gold hover:bg-gold-light text-gray-900 font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg text-lg"
              >
                Get the Free Guide
              </Link>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
