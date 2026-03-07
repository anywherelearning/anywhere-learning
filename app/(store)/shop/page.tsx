import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getProductsByCategory } from "@/lib/db/queries";
import { getFallbackProducts } from "@/lib/fallback-products";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";
import BundleHighlight from "@/components/shop/BundleHighlight";
import ScrollReveal from "@/components/shared/ScrollReveal";

export const revalidate = 3600; // ISR: revalidate hourly

export const metadata: Metadata = {
  title: "Shop Activity Packs",
  description:
    "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
  alternates: {
    canonical: "https://anywherelearning.co/shop",
  },
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

  // ItemList structured data for search results
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Anywhere Learning Activity Packs",
    description: "Real-world activity packs for homeschool and worldschool families.",
    numberOfItems: filteredProducts.length,
    itemListElement: filteredProducts.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://anywherelearning.co/shop/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <div className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      {/* Hero Section */}
      <section className="relative py-14 sm:py-20 md:py-24 overflow-hidden">
        {/* Soft background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-gold/[0.04] to-cream" aria-hidden="true" />

        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Leaf shape top-left */}
          <svg
            className="absolute -left-4 top-8 w-24 md:w-32 opacity-[0.06] animate-soft-float"
            viewBox="0 0 100 100"
            fill="#588157"
          >
            <path d="M50 5 Q65 25 80 40 Q65 45 50 70 Q35 45 20 40 Q35 25 50 5Z" />
            <path d="M50 20 L50 70" stroke="#588157" strokeWidth="1" fill="none" />
          </svg>
          {/* Leaf shape top-right */}
          <svg
            className="absolute right-8 top-4 w-20 md:w-28 opacity-[0.05] animate-soft-float"
            style={{ animationDelay: '2s' }}
            viewBox="0 0 100 100"
            fill="#d4a373"
          >
            <path d="M50 5 Q65 25 80 40 Q65 45 50 70 Q35 45 20 40 Q35 25 50 5Z" />
          </svg>
          {/* Small circle decoration */}
          <div className="absolute left-[15%] bottom-12 w-3 h-3 rounded-full bg-gold/20 animate-soft-float" style={{ animationDelay: '1s' }} />
          <div className="absolute right-[20%] bottom-20 w-2 h-2 rounded-full bg-forest/15 animate-soft-float" style={{ animationDelay: '3s' }} />
        </div>

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

      {/* Trust Strip */}
      <div className="border-y border-gray-200/60 bg-white/50">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              No Prep Required
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Print &amp; Use Instantly
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Ages 4&ndash;14
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              14-day refund guarantee
            </span>
          </div>
        </div>
      </div>

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
                className="shimmer-effect inline-block bg-gold hover:bg-gold-light text-gray-900 font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg text-lg"
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
