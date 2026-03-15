import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getProductsByCategory } from "@/lib/db/queries";
import {
  getFallbackProducts,
  getProductCounts,
} from "@/lib/fallback-products";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";
import BundleHighlight from "@/components/shop/BundleHighlight";
import BundleCarousel from "@/components/shop/BundleCarousel";
import CategorySection from "@/components/shop/CategorySection";
import CategoryHero from "@/components/shop/CategoryHero";
import ShopSearchBar from "@/components/shop/ShopSearchBar";
import ScrollReveal from "@/components/shared/ScrollReveal";
import SavingsExplainer from "@/components/shop/SavingsExplainer";
import SkillsMapBanner from "@/components/shop/SkillsMapBanner";

export const revalidate = 3600; // ISR: revalidate hourly

// ── Category metadata for SEO ──

const categoryMeta: Record<string, { title: string; description: string }> = {
  "ai-literacy": {
    title: "AI & Digital Literacy Packs",
    description:
      "Responsible tech, critical thinking about AI, and digital citizenship. Ages 9\u201314.",
  },
  "creativity-anywhere": {
    title: "Creativity Anywhere Activity Packs",
    description:
      "Open-ended projects that build design thinking and creative confidence. Ages 6\u201314.",
  },
  "communication-writing": {
    title: "Communication & Writing Packs",
    description:
      "Real-world writing and communication skills for kids who have something to say. Ages 9\u201314.",
  },
  "outdoor-learning": {
    title: "Outdoor Learning Activity Packs",
    description:
      "Turn your backyard, park, or trail into a hands-on learning space. Ages 6\u201314.",
  },
  "real-world-math": {
    title: "Real-World Math Packs",
    description:
      "Budgeting, shopping math, fractions in the kitchen, and financial thinking. Ages 6\u201314.",
  },
  "entrepreneurship": {
    title: "Entrepreneurship Activity Packs",
    description:
      "Plan, launch, and run real projects \u2014 from lemonade stands to micro-businesses. Ages 9\u201314.",
  },
  "planning-problem-solving": {
    title: "Planning & Problem-Solving Packs",
    description:
      "Tackle real logistics, plan adventures, and solve problems that actually matter. Ages 9\u201314.",
  },
  "start-here": {
    title: "Start Here Packs",
    description:
      "The foundation for your learning journey \u2014 start with the big picture.",
  },
  bundle: {
    title: "Activity Pack Bundles",
    description:
      "Save more with curated bundles \u2014 the best value for families who want it all.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const meta = category ? categoryMeta[category] : null;
  const canonicalUrl = category
    ? `https://anywherelearning.co/shop?category=${category}`
    : "https://anywherelearning.co/shop";

  return {
    title: meta?.title || "Shop Activity Packs",
    description:
      meta?.description ||
      "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta
        ? `${meta.title} \u2014 Anywhere Learning`
        : "Shop Activity Packs \u2014 Anywhere Learning",
      description:
        meta?.description ||
        "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
      url: canonicalUrl,
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
}

// ── Category sections for the All view ──

const categorySections = [
  {
    value: "start-here",
    label: "Start Here",
    description:
      "The foundation for your learning journey — start with the big picture.",
  },
  {
    value: "ai-literacy",
    label: "AI & Digital",
    description:
      "Responsible tech, critical thinking about AI, and digital citizenship.",
  },
  {
    value: "creativity-anywhere",
    label: "Creativity Anywhere",
    description:
      "Open-ended projects that build design thinking and creative confidence.",
  },
  {
    value: "outdoor-learning",
    label: "Outdoor Learning",
    description:
      "Turn your backyard, park, or trail into a hands-on learning space.",
  },
  {
    value: "real-world-math",
    label: "Real-World Math",
    description:
      "Budgeting, shopping math, fractions in the kitchen, and financial thinking.",
  },
  {
    value: "communication-writing",
    label: "Communication & Writing",
    description:
      "Real-world writing and communication skills for kids who have something to say.",
  },
  {
    value: "entrepreneurship",
    label: "Entrepreneurship",
    description:
      "Plan, launch, and run real projects \u2014 from lemonade stands to micro-businesses.",
  },
  {
    value: "planning-problem-solving",
    label: "Planning & Problem-Solving",
    description:
      "Tackle real logistics, plan adventures, and solve problems that actually matter.",
  },
];

// ── Category → Bundle slug mapping ──

const categoryBundleMap: Record<string, string> = {
  "ai-literacy": "ai-digital-bundle",
  "creativity-anywhere": "creativity-mega-bundle",
  "outdoor-learning": "outdoor-toolkit-bundle",
  "real-world-math": "real-world-math-bundle",
};

// ── Cross-sell mapping ──

const crossSellMap: Record<string, string> = {
  "ai-literacy": "creativity-anywhere",
  "creativity-anywhere": "ai-literacy",
  "outdoor-learning": "creativity-anywhere",
  "real-world-math": "entrepreneurship",
  "communication-writing": "creativity-anywhere",
  "entrepreneurship": "planning-problem-solving",
  "planning-problem-solving": "entrepreneurship",
  "start-here": "outdoor-learning",
};

// ── Page ──

const fallbackProducts = getFallbackProducts();

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q, sort } = await searchParams;

  // Fetch products from DB, fallback if unavailable
  let allProducts: Awaited<ReturnType<typeof getActiveProducts>> = [];
  try {
    allProducts = category
      ? await getProductsByCategory(category)
      : await getActiveProducts();
  } catch {
    // DB not available — use fallback products
  }

  const products = allProducts.length > 0 ? allProducts : fallbackProducts;

  // Filter by category (only needed for fallback path)
  let filteredProducts =
    allProducts.length > 0
      ? products
      : category
        ? products.filter((p) => p.category === category)
        : products;

  // Apply search filter
  if (q) {
    const query = q.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    );
  }

  // Apply sort
  const isSorted = !!sort && sort !== 'featured';
  if (isSorted) {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.priceCents - b.priceCents;
        case 'price-desc':
          return b.priceCents - a.priceCents;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }

  // Product counts for category pills (always from full fallback catalog for consistency)
  const allIndividual = fallbackProducts.filter((p) => !p.isBundle);
  const productCounts: Record<string, number> = getProductCounts(allIndividual);
  // Add bundle count separately
  const bundleCount = fallbackProducts.filter((p) => p.isBundle).length;
  if (bundleCount > 0) productCounts['bundle'] = bundleCount;

  // View mode
  const isSearchActive = !!q;
  const isCategoryView = !!category && !isSearchActive;
  const isAllView = !category && !isSearchActive && !isSorted;
  const isSortedAllView = !category && !isSearchActive && isSorted;

  // All view: bundles carousel
  const allBundles = isAllView
    ? filteredProducts.filter((p) => p.isBundle)
    : [];

  // Category view: relevant bundle + cross-sell products
  const categoryBundle =
    isCategoryView && category && category !== "bundle"
      ? (allProducts.length > 0 ? products : fallbackProducts).find(
          (p) => p.slug === categoryBundleMap[category] && p.isBundle,
        )
      : null;

  const crossSellCategory =
    isCategoryView && category ? crossSellMap[category] : null;
  const crossSellProducts = crossSellCategory
    ? (allProducts.length > 0 ? products : fallbackProducts)
        .filter((p) => p.category === crossSellCategory && !p.isBundle)
        .slice(0, 3)
    : [];

  // Structured data
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Anywhere Learning Activity Packs",
    description:
      "Real-world activity packs for homeschool and worldschool families.",
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

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      {isCategoryView ? (
        <CategoryHero
          category={category!}
          productCount={filteredProducts.filter((p) => !p.isBundle).length}
        />
      ) : (
        <>
          <section className="relative py-14 sm:py-20 md:py-24 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-b from-cream via-gold/[0.04] to-cream"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <svg
                className="absolute -left-4 top-8 w-24 md:w-32 opacity-[0.06] animate-soft-float"
                viewBox="0 0 100 100"
                fill="#588157"
              >
                <path d="M50 5 Q65 25 80 40 Q65 45 50 70 Q35 45 20 40 Q35 25 50 5Z" />
                <path
                  d="M50 20 L50 70"
                  stroke="#588157"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
              <svg
                className="absolute right-8 top-4 w-20 md:w-28 opacity-[0.05] animate-soft-float"
                style={{ animationDelay: "2s" }}
                viewBox="0 0 100 100"
                fill="#d4a373"
              >
                <path d="M50 5 Q65 25 80 40 Q65 45 50 70 Q35 45 20 40 Q35 25 50 5Z" />
              </svg>
              <div
                className="absolute left-[15%] bottom-12 w-3 h-3 rounded-full bg-gold/20 animate-soft-float"
                style={{ animationDelay: "1s" }}
              />
              <div
                className="absolute right-[20%] bottom-20 w-2 h-2 rounded-full bg-forest/15 animate-soft-float"
                style={{ animationDelay: "3s" }}
              />
            </div>
            <div className="relative mx-auto max-w-6xl px-5 sm:px-8 text-center hero-stagger">
              <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
                Ready-to-Use Activity Guides
              </p>
              <h1 className="font-display text-4xl text-forest sm:text-5xl lg:text-6xl text-balance mb-4">
                Homeschool Activity Packs
                <br className="hidden sm:block" /> for Real-World Learning
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
                No-prep activities for homeschool and worldschool families.
                Open on any device, use year after year.
              </p>
            </div>
          </section>

          {/* Trust Strip */}
          <div className="border-y border-gray-200/60 bg-white/50">
            <div className="mx-auto max-w-4xl px-5 sm:px-8 py-4">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
                {[
                  "No Prep Required",
                  "Download & Use Instantly",
                  "Ages 6\u201314",
                  "48-hour refund guarantee",
                ].map((text) => (
                  <span key={text} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-forest"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {text}
                  </span>
                ))}
              </div>
              <p className="text-center text-sm text-gray-400 mt-3">
                Designed by a teacher with 15 years of classroom experience who left to homeschool her own kids.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════
          SKILLS MAP BANNER (All Packs view only)
      ════════════════════════════════════════ */}
      {!isCategoryView && <SkillsMapBanner />}

      {/* ════════════════════════════════════════
          SAVINGS EXPLAINER
      ════════════════════════════════════════ */}
      <ScrollReveal>
        <SavingsExplainer />
      </ScrollReveal>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-20">
        {/* ════════════════════════════════════════
            SEARCH BAR + SORT
        ════════════════════════════════════════ */}
        <section className="my-8">
          <Suspense fallback={null}>
            <ShopSearchBar />
          </Suspense>
        </section>

        {/* ════════════════════════════════════════
            SEARCH RESULTS VIEW
        ════════════════════════════════════════ */}
        {isSearchActive && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {filteredProducts.length} result
                {filteredProducts.length !== 1 ? "s" : ""}
                {q && (
                  <>
                    {" "}
                    for &ldquo;
                    <span className="font-medium text-gray-700">{q}</span>
                    &rdquo;
                  </>
                )}
              </p>
            </div>
            <section>
              <ProductGrid products={filteredProducts} />
            </section>
          </>
        )}

        {/* ════════════════════════════════════════
            ALL PACKS VIEW — curated sections
        ════════════════════════════════════════ */}
        {isAllView && (
          <>
            {/* Bundles */}
            {allBundles.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900 text-xl">
                    Save More with Bundles
                  </h2>
                  <Link
                    href="/shop?category=bundle"
                    className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-forest hover:text-forest-dark transition-colors"
                  >
                    View all bundles &rarr;
                  </Link>
                </div>
                <BundleCarousel products={allBundles} />
              </section>
            )}

            {/* Category filter */}
            <section id="pick-packs" className="mb-10 scroll-mt-24">
              <Suspense fallback={null}>
                <CategoryFilter
                  productCounts={productCounts}
                />
              </Suspense>
            </section>

            {/* Category sections — always use fallback for complete catalog */}
            {categorySections.map((cat) => {
              const catProducts = fallbackProducts.filter(
                (p) => p.category === cat.value && !p.isBundle,
              );
              if (catProducts.length === 0) return null;
              return (
                <ScrollReveal key={cat.value}>
                  <section className="mb-14">
                    <CategorySection
                      category={cat.value}
                      label={cat.label}
                      description={cat.description}
                      products={catProducts}
                      totalCount={catProducts.length}
                    />
                  </section>
                </ScrollReveal>
              );
            })}
          </>
        )}

        {/* ════════════════════════════════════════
            SORTED ALL VIEW — flat grid when sorting
        ════════════════════════════════════════ */}
        {isSortedAllView && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {filteredProducts.length} packs &middot; sorted by{' '}
                <span className="font-medium text-gray-700">
                  {sort === 'price-asc' ? 'price (low to high)' :
                   sort === 'price-desc' ? 'price (high to low)' :
                   sort === 'newest' ? 'newest first' : sort}
                </span>
              </p>
            </div>
            <section>
              <ProductGrid products={filteredProducts} />
            </section>
          </>
        )}

        {/* ════════════════════════════════════════
            CATEGORY VIEW
        ════════════════════════════════════════ */}
        {isCategoryView && (
          <>
            {/* Category bundle */}
            {categoryBundle && (
              <section className="mb-10">
                <BundleHighlight
                  name={categoryBundle.name}
                  slug={categoryBundle.slug}
                  priceCents={categoryBundle.priceCents}
                  compareAtPriceCents={categoryBundle.compareAtPriceCents}
                  activityCount={categoryBundle.activityCount}
                  imageUrl={categoryBundle.imageUrl}
                  shortDescription={categoryBundle.shortDescription}
                />
              </section>
            )}

            {/* Category filter */}
            <section className="mb-10">
              <Suspense fallback={null}>
                <CategoryFilter productCounts={productCounts} />
              </Suspense>
            </section>

            {/* Full grid */}
            <section>
              <ProductGrid
                products={
                  category === "bundle"
                    ? filteredProducts.filter((p) => p.isBundle)
                    : filteredProducts.filter((p) => !p.isBundle)
                }
              />
            </section>

            {/* Cross-sell */}
            {crossSellProducts.length > 0 && (
              <section className="mt-16 pt-12 border-t border-gray-200">
                <h2 className="font-display text-2xl text-forest mb-6 text-center">
                  You might also like
                </h2>
                <ProductGrid products={crossSellProducts} />
              </section>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            BOTTOM CTA
        ════════════════════════════════════════ */}
        <ScrollReveal>
          <section className="mt-20 text-center">
            <div className="bg-forest-section rounded-3xl p-10 md:p-14 shadow-xl">
              <h3 className="font-display text-2xl md:text-4xl text-cream mb-3">
                Not sure where to start?
              </h3>
              <p className="text-cream/60 mb-8 max-w-md mx-auto text-lg">
                Grab our free guide and discover the 10 life skills your kids
                can build through everyday moments.
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
