import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getProductsByCategory } from "@/lib/db/queries";
import {
  getFallbackProducts,
  filterByAge,
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

export const revalidate = 3600; // ISR: revalidate hourly

// ── Category metadata for SEO ──

const categoryMeta: Record<string, { title: string; description: string }> = {
  "ai-literacy": {
    title: "AI & Digital Literacy Packs",
    description:
      "Responsible tech, critical thinking about AI, and digital citizenship. Ages 9\u201314.",
  },
  creativity: {
    title: "Creativity & Imagination Packs",
    description:
      "Open-ended design projects \u2014 game design, filmmaking, sculpture, and more. Ages 6\u201314.",
  },
  "critical-thinking": {
    title: "Critical Thinking Activity Packs",
    description:
      "Data analysis, business planning, design challenges, and problem-solving. Ages 9\u201314.",
  },
  "life-skills": {
    title: "Life Skills Activity Packs",
    description:
      "Cooking, first aid, sewing, repairs \u2014 hands-on skills they\u2019ll use forever. Ages 4\u201314.",
  },
  literacy: {
    title: "Literacy & Communication Packs",
    description:
      "Real-world writing, active listening, interviewing, and communication skills. Ages 9\u201314.",
  },
  nature: {
    title: "Nature & Outdoor Activity Packs",
    description:
      "Hands-on nature and seasonal activities \u2014 task cards, STEM challenges, land art, and more. Ages 4\u201314.",
  },
  "real-world-math": {
    title: "Real-World Math & Money Packs",
    description:
      "Budgeting, shopping math, fractions in the kitchen, and financial thinking. Ages 4\u201314.",
  },
  "self-management": {
    title: "Self-Management Activity Packs",
    description:
      "Morning routines, time management, organization, and emotional skills. Ages 9\u201314.",
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

  return {
    title: meta?.title || "Shop Activity Packs",
    description:
      meta?.description ||
      "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
    alternates: {
      canonical: "https://anywherelearning.co/shop",
    },
    openGraph: {
      title: meta
        ? `${meta.title} \u2014 Anywhere Learning`
        : "Shop Activity Packs \u2014 Anywhere Learning",
      description:
        meta?.description ||
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
}

// ── Category sections for the All view ──

const categorySections = [
  {
    value: "ai-literacy",
    label: "AI & Digital",
    description:
      "Responsible tech, critical thinking about AI, and digital citizenship.",
  },
  {
    value: "creativity",
    label: "Creativity",
    description:
      "Open-ended projects that build design thinking and creative confidence.",
  },
  {
    value: "critical-thinking",
    label: "Critical Thinking",
    description:
      "Data analysis, business planning, design challenges, and spatial reasoning.",
  },
  {
    value: "life-skills",
    label: "Life Skills",
    description:
      "Cooking, first aid, sewing, repairs \u2014 hands-on skills they\u2019ll use forever.",
  },
  {
    value: "literacy",
    label: "Literacy",
    description:
      "Communication, active listening, interviewing, and writing in the real world.",
  },
  {
    value: "nature",
    label: "Nature & Outdoor",
    description:
      "Turn your backyard, park, or trail into a hands-on learning space.",
  },
  {
    value: "real-world-math",
    label: "Math & Money",
    description:
      "Budgeting, shopping math, fractions in the kitchen, and financial thinking.",
  },
  {
    value: "self-management",
    label: "Self-Management",
    description:
      "Morning routines, time management, organization, and emotional skills.",
  },
];

// ── Category → Bundle slug mapping ──

const categoryBundleMap: Record<string, string> = {
  "ai-literacy": "ai-digital-bundle",
  creativity: "creativity-mega-bundle",
  "life-skills": "real-world-mega-bundle",
  nature: "outdoor-toolkit-bundle",
  "real-world-math": "real-world-mega-bundle",
};

// ── Cross-sell mapping ──

const crossSellMap: Record<string, string> = {
  "ai-literacy": "critical-thinking",
  creativity: "ai-literacy",
  "critical-thinking": "ai-literacy",
  "life-skills": "self-management",
  literacy: "creativity",
  nature: "creativity",
  "real-world-math": "life-skills",
  "self-management": "life-skills",
};

// ── Page ──

const fallbackProducts = getFallbackProducts();

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string; age?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q, age } = await searchParams;

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

  // Apply age filter
  if (age) {
    const minAge = parseInt(age, 10);
    if (!isNaN(minAge)) {
      filteredProducts = filterByAge(filteredProducts, minAge);
    }
  }

  // Product counts for category pills (individual products only, from full catalog)
  const allIndividual = (
    allProducts.length > 0 ? products : fallbackProducts
  ).filter((p) => !p.isBundle);
  const productCounts = getProductCounts(allIndividual);

  // View mode
  const isSearchActive = !!(q || age);
  const isCategoryView = !!category && !isSearchActive;
  const isAllView = !category && !isSearchActive;

  // All view: master bundle + other bundles
  const masterBundle = isAllView
    ? filteredProducts.find((b) => b.slug === "master-bundle")
    : null;
  const otherBundles = isAllView
    ? filteredProducts.filter((p) => p.isBundle && p.slug !== "master-bundle")
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
                Activity Packs That Make
                <br className="hidden sm:block" /> Real Life the Lesson
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
                No-prep. Open on any device. Built for families who learn everywhere.
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
                  "Ages 4\u201314",
                  "14-day refund guarantee",
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
            </div>
          </div>
        </>
      )}

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-20">
        {/* ════════════════════════════════════════
            SEARCH BAR + AGE FILTER
        ════════════════════════════════════════ */}
        <section className="my-8">
          <Suspense fallback={null}>
            <ShopSearchBar />
          </Suspense>
        </section>

        {/* ════════════════════════════════════════
            SEARCH / AGE RESULTS VIEW
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
                {age && (
                  <span className="text-gray-400">
                    {" "}
                    &middot; Ages {age}+
                  </span>
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
            {/* Master Bundle */}
            {masterBundle && (
              <section className="mb-12">
                <BundleHighlight
                  name={masterBundle.name}
                  slug={masterBundle.slug}
                  priceCents={masterBundle.priceCents}
                  compareAtPriceCents={masterBundle.compareAtPriceCents}
                  activityCount={masterBundle.activityCount}
                />
              </section>
            )}

            {/* Other bundles */}
            {otherBundles.length > 0 && (
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
                <BundleCarousel products={otherBundles} />
              </section>
            )}

            {/* Category filter */}
            <section className="mb-10">
              <Suspense fallback={null}>
                <CategoryFilter
                  hideBundles
                  productCounts={productCounts}
                />
              </Suspense>
            </section>

            {/* Category sections */}
            {categorySections.map((cat) => {
              const catProducts = filteredProducts.filter(
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
