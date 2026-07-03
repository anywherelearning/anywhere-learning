import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, getActiveProducts } from "@/lib/db/queries";
import {
  getFallbackProductBySlug,
  getFallbackProducts,
  type FallbackProduct,
} from "@/lib/fallback-products";
import { CATEGORY_LABELS } from "@/lib/categories";
import { getProductDescription } from "@/lib/product-descriptions";
import { hasPreview } from "@/lib/preview-map";
import { coverSrc } from "@/lib/cover";
import PreviewButton from "@/components/shop/PreviewButton";
import CheckoutButton from "@/components/checkout/CheckoutButton";
import ReviewForm from "@/components/shop/ReviewForm";
import {
  IS_FOUNDER_PHASE,
  MEMBERSHIP_PRICE_YR,
  MEMBERSHIP_PRICE_YEAR,
} from "@/lib/membership";
import { getProductSkills } from "@/lib/skills";

// Render per-request so the access card reflects the visitor's real tier.
// (Was statically generated with `revalidate = 86400`, which served every
// visitor the build-time 'guest' state and made members see "Unlock with
// membership" on activities they actually owned.)
export const dynamic = 'force-dynamic';

/* ─────────────────────────────────────────────────────────────────
   Per-category accent + content maps
   ───────────────────────────────────────────────────────────────── */

interface CategoryTheme {
  color: string;
  deep: string;
  soft: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "real-world-math": { color: "#588157", deep: "#3A5A40", soft: "#E6EBDF" },
  entrepreneurship: { color: "#C97B5C", deep: "#7A3D24", soft: "#F2DECF" },
  "ai-literacy": { color: "#B6913F", deep: "#7A5E1F", soft: "#F5E7BC" },
  "communication-writing": { color: "#3A5A40", deep: "#26331F", soft: "#CFDCC4" },
  "planning-problem-solving": { color: "#588157", deep: "#3A5A40", soft: "#E6EBDF" },
  "creativity-maker": { color: "#C97B5C", deep: "#7A3D24", soft: "#F2DECF" },
  "outdoor-learning": { color: "#3A5A40", deep: "#26331F", soft: "#CFDCC4" },
  worldschooling: { color: "#8A8470", deep: "#5A5240", soft: "#DAD7CD" },
  "emotional-social-skills": { color: "#B6748A", deep: "#7A4858", soft: "#F4E4E9" },
};

function themeFor(category: string): CategoryTheme {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES["real-world-math"];
}

/** Per-category "Why it matters" callout (parent-facing, motivational). */
const WHY_IT_MATTERS: Record<string, string> = {
  "real-world-math":
    "By the time a kid budgets, shops, and cooks a real meal, they have practiced more applied math than a textbook chapter — and they did it with you. That is the moment \"I taught my kid something real\" starts to feel possible.",
  entrepreneurship:
    "Pitching, pricing, failing, and trying again — these are the skills no school subject teaches but every adult life needs. One small business taught at home beats a hundred worksheets on \"economics.\"",
  "ai-literacy":
    "Your kid will spend the rest of their life around AI. Whether they treat it like magic, an oracle, or a tool they direct is up to what you teach them now. This is the literacy that defines the next twenty years.",
  "communication-writing":
    "A kid who can write a clear email, defend an opinion, or hold a real conversation is a kid who will be heard. Writing as a tool, not a school subject.",
  "planning-problem-solving":
    "The skill of breaking a fuzzy problem into clear steps quietly compounds. Kids who practice it run their own day in their teens, their own life in their twenties.",
  "creativity-maker":
    "Real creative thinking is not glittery crafts. It is the patience to design, build, fail, and rebuild. Every invention, every business, every solution starts here.",
  "outdoor-learning":
    "The patch of grass behind the house is the most underrated educational space on the planet. These activities turn outside time into learning time without any kid noticing the difference.",
  worldschooling:
    "Travel can be a vacation or it can be a curriculum. The difference is whether you ask the right questions. These activities turn any trip into something they will carry into adulthood.",
  "emotional-social-skills":
    "Self-regulation, repair, resilience, and reading the room are the skills that quietly run every part of adult life. Schools never had time for them. Most of us parents were never taught them either. These activities teach them on purpose, while the weather is still good.",
};

function whyItMattersFor(category: string): string {
  return WHY_IT_MATTERS[category] || WHY_IT_MATTERS["real-world-math"];
}

/* ─────────────────────────────────────────────────────────────────
   generateStaticParams + generateMetadata (kept for SEO)
   ───────────────────────────────────────────────────────────────── */

export async function generateStaticParams() {
  try {
    const allProducts = await getActiveProducts();
    return allProducts.map((p) => ({ slug: p.slug }));
  } catch {
    return getFallbackProducts().map((p) => ({ slug: p.slug }));
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    /* DB unavailable */
  }
  if (!product) product = getFallbackProductBySlug(slug);
  if (!product) return {};

  const categoryKeywords: Record<string, string> = {
    "outdoor-learning": "Outdoor Learning Activities",
    "creativity-maker": "Creative Activities for Kids",
    "ai-literacy": "AI & Digital Literacy for Kids",
    "real-world-math": "Real-World Math Activities",
    "communication-writing": "Writing & Communication Activities",
    entrepreneurship: "Entrepreneurship Activities for Kids",
    "planning-problem-solving": "Problem-Solving Activities",
    worldschooling: "Worldschooling Activities",
    "emotional-social-skills": "Emotional & Social Skills for Kids",
  };
  const suffix = categoryKeywords[product.category] || "Real-World Learning Activities";
  const ageBand = product.ageRange?.replace(/^Ages\s*/i, "") || "6-14";

  // Build a meaningful ~150-char description: keep the short product blurb,
  // add age + category + key practical points so Google has more keyword space.
  const baseDesc = product.shortDescription.trim().replace(/\.$/, "");
  const description = `${baseDesc}. ${suffix} for ages ${ageBand}. Parent-led activity guide, no curriculum needed, use on any device.`.slice(0, 160);

  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `https://anywherelearning.co${product.imageUrl}`
    : "https://anywherelearning.co/og-default.jpg";

  return {
    title: `${product.name} | ${suffix}`,
    description,
    keywords: [
      product.name,
      suffix,
      "homeschool activity",
      "worldschool activity",
      `ages ${ageBand}`,
      "real-world learning",
      "parent-led activity",
    ],
    alternates: {
      canonical: `https://anywherelearning.co/shop/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      url: `https://anywherelearning.co/shop/${product.slug}`,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: product.imageUrl ? 1500 : 630,
          alt: `${product.name} cover — ${suffix}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [imageUrl],
    },
  };
}

/* ─────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────── */

import type { AccessTier } from '@/lib/access';

// Resolve the visitor's access tier. Real lookup goes through Clerk auth →
// the `users` table → a subscription (member, or trial while the free trial
// runs). Falls back to a query param (development-only) when Clerk isn't
// configured.
async function detectAccessTier(searchParams: { tier?: string }): Promise<AccessTier> {
  // Dev/preview override (NEVER in production — only affects the "in your
  // library" badge here; content is gated by the download endpoint).
  if (process.env.NODE_ENV !== 'production') {
    if (searchParams.tier === 'member') return 'member';
    if (searchParams.tier === 'trial') return 'trial';
    if (searchParams.tier === 'guest') return 'guest';
  }

  // Real lookup: Clerk → DB
  let tier: AccessTier = 'guest';
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { getAccessTierForClerkId } = await import('@/lib/access');
    const { userId } = await auth();
    if (userId) tier = await getAccessTierForClerkId(userId);
  } catch {
    /* Clerk or DB not configured */
  }

  // The old sandbox `al_tier_preview` cookie fallback was removed — it
  // persisted access for 7 days in the browser, letting refunded users
  // continue to see member content. DB is now the only source of truth.

  return tier;
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const tier = await detectAccessTier(sp);

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    /* DB unavailable */
  }
  if (!product) product = getFallbackProductBySlug(slug);
  if (!product) notFound();

  // Bundles are no longer part of the public flow. Send people to /shop.
  if (product.isBundle) notFound();

  const theme = themeFor(product.category);
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const ageRange = product.ageRange?.replace(/[-–]/g, "–") || "Ages 6–14";
  const ageRangeDisplay = ageRange.startsWith("Ages") ? ageRange : `Ages ${ageRange}`;

  // Related: same category, exclude this one, cap at 3.
  let relatedProducts: FallbackProduct[] = [];
  try {
    const all = await getActiveProducts();
    relatedProducts = all
      .filter((p) => p.category === product.category && p.id !== product.id && !p.isBundle)
      .slice(0, 3) as unknown as FallbackProduct[];
  } catch {
    relatedProducts = getFallbackProducts()
      .filter((p) => p.category === product.category && p.id !== product.id && !p.isBundle)
      .slice(0, 3);
  }

  // Per-product enrichment (opening paragraph, skillTags).
  const desc = getProductDescription(
    product.slug,
    product.description,
    product.category,
    product.activityCount ?? null,
    product.isBundle ?? false,
  );

  const opening = desc.opening || product.shortDescription;
  const whatsIncluded = desc.whatsIncluded || [];
  // Prefer OCR-extracted canonical skills (source of truth from the actual PDF
  // content). Fall back to hand-written skillTags for products we couldn't
  // extract (card packs, bundles, parent guides).
  const ocrSkills = getProductSkills(product.slug);
  const skillTags = (
    ocrSkills?.canonical && ocrSkills.canonical.length > 0
      ? ocrSkills.canonical
      : desc.skillTags || []
  ).slice(0, 6);

  /* ─── JSON-LD ─── */

  const typicalAgeRange = (product.ageRange || "6-14")
    .replace(/^Ages\s*/i, "")
    .replace(/[–—]/g, "-");

  // Reviews — fetched from DB. Each row carries an author-name + imageUrl
  // snapshot from when it was written, so we don't need a per-row Clerk lookup.
  let reviews: {
    author: string;
    authorImageUrl: string | null;
    rating: number;
    text: string;
    datePublished: string;
  }[] = [];
  try {
    const { db } = await import('@/lib/db');
    const { reviews: reviewsTable } = await import('@/lib/db/schema');
    const { eq, desc } = await import('drizzle-orm');
    const rows = await db
      .select({
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        createdAt: reviewsTable.createdAt,
        authorName: reviewsTable.authorName,
        authorImageUrl: reviewsTable.authorImageUrl,
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.productSlug, slug))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(12);
    reviews = rows.map((r) => ({
      author: r.authorName || 'Member',
      authorImageUrl: r.authorImageUrl,
      rating: r.rating,
      text: r.comment,
      datePublished: r.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('[shop/[slug]] could not load reviews:', err);
  }
  const aggregateRating = reviews.length > 0
    ? {
        "@type": "AggregateRating" as const,
        ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      }
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "Product"],
    learningResourceType: "Activity Guide",
    educationalUse: ["Homeschool", "Self-directed learning", "Worldschooling"],
    educationalLevel: `Ages ${typicalAgeRange}`,
    ...(skillTags.length > 0 && { teaches: skillTags }),
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "Parent",
    },
    name: product.name,
    description: product.shortDescription,
    image: product.imageUrl
      ? product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `https://anywherelearning.co${product.imageUrl}`
      : "https://anywherelearning.co/og-default.jpg",
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "Anywhere Learning",
    },
    provider: {
      "@type": "Organization",
      name: "Anywhere Learning",
      url: "https://anywherelearning.co",
    },
    isAccessibleForFree: false,
    typicalAgeRange,
    inLanguage: "en",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
    offers: {
      "@type": "Offer",
      url: "https://anywherelearning.co/join",
      priceCurrency: "USD",
      price: String(99),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 99,
        priceCurrency: "USD",
        unitText: "YEAR",
      },
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "Service",
        name: "Anywhere Learning Membership",
      },
      seller: {
        "@type": "Organization",
        name: "Anywhere Learning",
      },
    },
    ...(aggregateRating && { aggregateRating }),
    ...(reviews.length > 0 && {
      review: reviews.map((r) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
        author: { "@type": "Person", name: r.author },
        reviewBody: r.text,
        datePublished: r.datePublished,
      })),
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Library", item: "https://anywherelearning.co/shop" },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `https://anywherelearning.co/shop?track=${product.category}#full-library`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://anywherelearning.co/shop/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* BREADCRUMB */}
      <div className="bg-[#F2EFE4] border-b border-[#D8D4C5]">
        <div className="mx-auto max-w-[1180px] px-6">
          <nav
            aria-label="Breadcrumb"
            className="py-3.5 flex items-center gap-2.5 flex-wrap text-[13px] text-gray-500"
          >
            <Link href="/shop" className="hover:text-forest-dark transition-colors">
              Library
            </Link>
            <span className="text-[#C9C5B7]" aria-hidden="true">›</span>
            <Link
              href={`/shop?track=${product.category}#full-library`}
              className="hover:text-forest-dark transition-colors"
            >
              {categoryLabel}
            </Link>
            <span className="text-[#C9C5B7]" aria-hidden="true">›</span>
            <span aria-current="page" className="text-gray-500 truncate max-w-[260px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* HEADER */}
      <header className="pt-12 md:pt-14 pb-8">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1fr] gap-10 lg:gap-14 items-start">
            {/* LEFT: Cover + preview */}
            <div className="flex flex-col gap-3.5">
              <div
                className="relative aspect-[4/5] w-full max-w-[420px] mx-auto lg:mx-0 rounded-[14px] overflow-hidden border border-[#D8D4C5] shadow-[0_28px_50px_-30px_rgba(45,58,46,0.4)]"
                style={{ background: theme.soft }}
              >
                {product.imageUrl && (
                  <Image
                    src={coverSrc(product.imageUrl)!}
                    alt={`${product.name} — ${categoryLabel} activity guide cover`}
                    fill
                    sizes="(max-width: 1024px) 90vw, 420px"
                    priority
                    className="object-cover object-top"
                  />
                )}
              </div>
              {hasPreview(product.slug) && (
                <div className="w-full max-w-[420px] mx-auto lg:mx-0">
                  <PreviewButton
                    slug={product.slug}
                    productName={product.name}
                    variant="block"
                  />
                </div>
              )}
            </div>

            {/* RIGHT: Title, copy, access card, pills, tags, trust row */}
            <div className="flex flex-col">
              <span
                className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: theme.color }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                {categoryLabel}
              </span>
              <h1 className="mt-3 font-display text-[clamp(2.125rem,4.4vw,3.125rem)] leading-[1.04] tracking-tight text-balance">
                {product.name}
              </h1>
              <p
                className="mt-4 text-[17px] leading-[1.55] text-gray-600 max-w-[560px]"
                data-speakable
              >
                {opening}
              </p>

              {/* Access card */}
              {(() => {
                const hasAccess = tier === 'member' || tier === 'trial';

                if (hasAccess) {
                  // Member or trial member — this activity is in their library
                  return (
                    <div className="mt-6 max-w-[400px] bg-[#E6EBDF] border border-[#C9D3BE] rounded-[14px] px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_18px_36px_-26px_rgba(58,90,64,0.28)]">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-forest/15 text-forest-dark text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full">
                          <span aria-hidden="true">✓</span>
                          In your library
                        </span>
                        <span className="font-display italic text-[13px] text-forest-dark">
                          {tier === 'member' ? 'Member' : 'Free trial'}
                        </span>
                      </div>
                      <Link
                        href={`/api/download/activity/${product.slug}?view=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        prefetch={false}
                        className="w-full inline-flex items-center justify-center gap-2 bg-forest text-cream font-semibold py-2.5 px-5 rounded-xl text-[14px] shadow-[0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all"
                      >
                        Open this activity
                        <span aria-hidden="true">→</span>
                      </Link>
                      <p className="mt-1.5 text-center text-[11.5px] text-gray-500">
                        Use on any device · Year after year
                      </p>
                    </div>
                  );
                }

                // Guest (default)
                return (
                  <div className="mt-6 max-w-[400px] bg-cream border border-[#D8D4C5] rounded-[14px] px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_18px_36px_-26px_rgba(45,58,46,0.28)]">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 bg-[#F2EFE4] text-gray-500 text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full">
                        <span aria-hidden="true">🔒</span>
                        Members only
                      </span>
                      <span className="font-display italic text-[14px] text-[#C97B5C]">
                        {MEMBERSHIP_PRICE_YEAR}
                      </span>
                    </div>
                    <Link
                      href="/start-trial"
                      className="w-full inline-flex items-center justify-center gap-2 bg-forest text-cream font-semibold py-2.5 px-5 rounded-xl text-[14px] shadow-[0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all"
                    >
                      Unlock with membership
                      <span aria-hidden="true">→</span>
                    </Link>
                    <p className="mt-1.5 text-center text-[11.5px] text-gray-500">
                      In the Membership · 14-day refund
                    </p>
                  </div>
                );
              })()}

              {/* Meta line */}
              <p className="mt-5 text-[12.5px] text-gray-500 tracking-[0.02em]">
                {ageRangeDisplay} · Project guide · 3 skill levels
              </p>

              {/* Skill tags */}
              {skillTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skillTags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#F2EFE4] text-gray-600 text-[12.5px] font-medium px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-5 text-[13.5px] text-gray-500 italic">
                Designed by a teacher with 15 years of classroom experience, now homeschooling her own kids.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* DETAILS SECTION — 2-column layout */}
      <section className="pb-8">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* LEFT — product structure */}
            <div className="text-gray-600 text-[16.5px] leading-[1.7]">
              {/* What's inside */}
              {whatsIncluded.length > 0 && (
                <>
                  <h2 className="font-display text-[26px] leading-[1.18] tracking-tight text-ink">
                    What&apos;s{" "}
                    <em className="not-italic italic" style={{ color: theme.color }}>inside.</em>
                  </h2>
                  <ul className="mt-4 list-none p-0 m-0 flex flex-col gap-2.5">
                    {whatsIncluded.map((item) => (
                      <li key={item} className="flex gap-3 text-[15.5px] leading-[1.55] text-gray-700">
                        <span
                          className="flex-none w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold mt-0.5"
                          style={{ background: theme.soft, color: theme.deep }}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span className="flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Every project guide includes */}
              <h2 className="font-display text-[26px] leading-[1.18] tracking-tight text-ink mt-10">
                Every guide{" "}
                <em className="not-italic italic" style={{ color: theme.color }}>includes.</em>
              </h2>
              <ul className="mt-4 list-none p-0 m-0 flex flex-col gap-2.5">
                {[
                  "What this activity builds: clear learning focus",
                  "Materials needed (minimal or none)",
                  "Before you start: parent-friendly guidance",
                  "Step-by-step instructions to follow along",
                  "3 skill levels: Explore / Develop / Extend",
                  "Support tips and conversation starters",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[15.5px] leading-[1.55] text-gray-700">
                    <span
                      className="flex-none w-1.5 h-1.5 rounded-full mt-2.5"
                      style={{ background: theme.color }}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT — value + audience */}
            <div className="text-gray-600 text-[16.5px] leading-[1.7]">
              {/* Why families love it */}
              <h2 className="font-display text-[26px] leading-[1.18] tracking-tight text-ink">
                Why families{" "}
                <em className="not-italic italic" style={{ color: theme.color }}>love it.</em>
              </h2>
              <ul className="mt-4 list-none p-0 m-0 flex flex-col gap-2.5">
                {[
                  "Low prep. Open and follow along on any device",
                  "Reusable year after year, different each time",
                  "Works for one child or five, multi-age friendly",
                  "Curiosity-driven, not curriculum-driven",
                  "Use one activity a day or one a week",
                  "Real-world skills through real-world experiences",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[15.5px] leading-[1.55] text-gray-700">
                    <span className="flex-none mt-1 text-[14px]" style={{ color: "#C97B5C" }} aria-hidden="true">
                      ♥
                    </span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Best for */}
              <h2 className="font-display text-[26px] leading-[1.18] tracking-tight text-ink mt-10">
                Best{" "}
                <em className="not-italic italic" style={{ color: theme.color }}>for.</em>
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Homeschool families",
                  "Worldschool families",
                  "After-school & weekends",
                  "Families who value hands-on learning",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="bg-cream border border-[#D8D4C5] text-gray-600 text-[13.5px] px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Why it matters callout — full-width below both columns */}
          <div className="mt-12 bg-[#F2DECF] border border-[#E8D4C2] rounded-[12px] py-5 px-6 max-w-[640px] mx-auto text-center">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A3D24] mb-2">
              Why it matters
            </span>
            <p className="m-0 font-display italic text-[16.5px] leading-[1.5] text-ink text-balance">
              {whyItMattersFor(product.category)}
            </p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-12 border-t border-[#D8D4C5] bg-[#F7F4EC]">
        <div className="mx-auto max-w-[920px] px-6">
          <div className="mb-7 text-center">
            <p
              className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: theme.deep }}
            >
              <span className="block h-px w-[22px]" style={{ background: theme.color }} />
              From the families
            </p>
            <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.4rem)] leading-[1.12] tracking-tight mt-3 text-balance">
              What members are{" "}
              <em className="not-italic italic" style={{ color: theme.color }}>saying.</em>
            </h2>
            {reviews.length > 0 && aggregateRating && (
              <p className="mt-2 text-[14px] text-gray-500">
                <span className="font-display italic text-[#C97B5C] text-base">
                  {aggregateRating.ratingValue}
                </span>{" "}
                / 5 from {aggregateRating.reviewCount}{" "}
                {aggregateRating.reviewCount === 1 ? "review" : "reviews"}
              </p>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map((r, i) => {
                const initial = r.author.trim().charAt(0).toUpperCase() || 'M';
                return (
                  <article
                    key={i}
                    className="rounded-[14px] border border-[#D8D4C5] bg-cream px-6 py-6 shadow-[0_12px_24px_-22px_rgba(45,58,46,.18)]"
                  >
                    <header className="flex items-center gap-3 mb-3">
                      <span
                        className="w-10 h-10 rounded-full overflow-hidden border border-[#D8D4C5] bg-[#F2EFE4] grid place-items-center flex-shrink-0"
                        aria-hidden="true"
                      >
                        {r.authorImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.authorImageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-display italic text-[18px] text-forest-dark">
                            {initial}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="m-0 text-[14.5px] font-medium text-ink truncate">
                          {r.author}
                        </p>
                        <p className="m-0 mt-0.5 font-display text-[13px] tracking-wider text-[#C97B5C]">
                          {"★".repeat(r.rating)}
                          <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                        </p>
                      </div>
                    </header>
                    <p className="text-[15px] leading-[1.6] text-gray-700 italic m-0">
                      &ldquo;{r.text}&rdquo;
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-cream border border-[#D8D4C5] rounded-[14px] py-9 px-6">
              <span
                aria-hidden="true"
                className="inline-grid place-items-center w-12 h-12 rounded-full mb-3"
                style={{ background: theme.soft, color: theme.deep }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              {tier === 'member' || tier === 'trial' ? (
                <>
                  <p className="m-0 font-display italic text-[18px] leading-[1.4] text-ink">
                    Tried it with your kids? Be the first to tell other members what worked.
                  </p>
                  <p className="m-0 mt-1.5 text-[14px] text-gray-500">
                    No reviews yet for {product.name}.
                  </p>
                </>
              ) : (
                <>
                  <p className="m-0 font-display italic text-[18px] leading-[1.4] text-ink">
                    Be the first to share your experience with {product.name}.
                  </p>
                  <p className="m-0 mt-1.5 text-[14px] text-gray-500">
                    Reviews come from members who&rsquo;ve actually done the activity with their kids.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Write a review — inline form for members and trial members */}
          <div className="mt-7">
            {tier === "member" || tier === "trial" ? (
              <ReviewForm slug={product.slug} productName={product.name} />
            ) : (
              <p className="text-center text-[14px] text-gray-500">
                Only members who&rsquo;ve used the activity can write reviews.{" "}
                <Link href="/start-trial" className="text-forest-dark font-medium hover:text-forest underline decoration-forest/30 underline-offset-2">
                  Join the membership
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      {/* RELATED */}
      {relatedProducts.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-[1100px] px-6">
            <div className="mb-8">
              <p
                className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: theme.deep }}
              >
                <span className="w-[22px] h-px" style={{ background: theme.color }} />
                Related activities
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.1] tracking-tight text-balance">
                More from{" "}
                <em className="not-italic italic" style={{ color: theme.color }}>
                  {categoryLabel}.
                </em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProducts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/shop/${p.slug}`}
                  className="group bg-cream border border-[#D8D4C5] rounded-[12px] overflow-hidden no-underline text-ink flex flex-col shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.3)] hover:border-[#C9C5B7] transition-all duration-200"
                >
                  <div
                    className="relative aspect-[16/10] overflow-hidden border-b border-[#D8D4C5]"
                    style={{ background: theme.soft }}
                  >
                    {p.imageUrl && (
                      <img
                        src={coverSrc(p.imageUrl)}
                        alt={p.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: theme.color }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: theme.color }}
                      />
                      {categoryLabel}
                    </span>
                    <h3 className="font-display italic text-[18px] leading-[1.18] text-ink mt-1.5 mb-2">
                      {p.name}
                    </h3>
                    <p className="text-[14px] leading-[1.5] text-gray-600 m-0">{p.shortDescription}</p>
                    <div
                      className="mt-3.5 pt-3.5 border-t border-dashed border-[#C9C5B7] flex items-center justify-between gap-2.5"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500 bg-[#F2EFE4] px-2.5 py-1 rounded-full">
                        🔒 Locked
                      </span>
                      <span className="font-semibold text-[13px] text-forest-dark group-hover:text-forest transition-colors">
                        More details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MEMBERSHIP OFFER */}
      <section className="py-12">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="max-w-[1000px] mx-auto bg-[#E6EBDF] border border-[#C9D3BE] rounded-[18px] p-10 md:p-14 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                All 100+ activities
              </p>
              <h2 className="mt-3.5 font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.08] tracking-tight text-balance">
                This activity is one of{" "}
                <em className="not-italic italic text-forest-dark">100+ in the membership.</em>
              </h2>
              <p className="mt-4 mb-6 text-[16.5px] leading-[1.6] text-gray-600 max-w-[520px]">
                The full library covers nine categories — math, AI, communication, planning,
                creativity, outdoor, entrepreneurship, worldschooling, emotional & social skills — with new activities every
                quarter. {MEMBERSHIP_PRICE_YEAR}
                {IS_FOUNDER_PHASE ? ', locked in for life as a founding member.' : '.'}
              </p>
              <Link
                href="/start-trial"
                className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-3.5 px-6 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
              >
                Unlock everything &mdash; {MEMBERSHIP_PRICE_YR}
                <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                  &rarr;
                </span>
              </Link>
              <p className="mt-3.5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-gray-500">
                <span className="text-forest-dark font-semibold">
                  {MEMBERSHIP_PRICE_YEAR}{IS_FOUNDER_PHASE ? ' founder rate' : ''}
                </span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>14-day money-back guarantee</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>Cancel anytime</span>
              </p>
            </div>
            <div>
              <h3 className="font-display italic text-[20px] text-forest-dark mb-3.5">
                What you get.
              </h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {[
                  "All 100+ activities (every category)",
                  "3 levels per activity (ages 6 to 14)",
                  "New activities every quarter",
                  "The Future-Ready Skills Map (parent guide)",
                  "Member-only resources",
                  "14-day money-back guarantee",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5 text-[15.5px] leading-[1.5] text-ink">
                    <span className="text-forest font-bold flex-none">✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECONDARY OPTION — Free 7-day guide */}
      <section className="pt-4 pb-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="max-w-[1000px] mx-auto text-center mb-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 inline-flex items-center gap-2.5">
              <span className="w-[22px] h-px bg-[#C9C5B7] inline-block" />
              Not ready for a year?
              <span className="w-[22px] h-px bg-[#C9C5B7] inline-block" />
            </p>
          </div>
          <div className="max-w-[560px] mx-auto">
            {/* Free Guide card — butter-tinted */}
            <div className="bg-[#F7EFD3] border border-[#E3D8A8] rounded-[16px] p-7 text-center flex flex-col h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A5E1F]">
                Free 7-day guide
              </p>
              <h3 className="mt-2.5 font-display text-[22px] leading-[1.18] text-ink text-balance">
                Try it{' '}
                <em className="not-italic italic text-[#7A5E1F]">free for a week.</em>
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-[1.55] text-gray-600 mb-5 flex-1">
                Seven real-world activities. One a day, for a week. No payment, no commitment.
              </p>
              <div>
                <Link
                  href="/free-guide"
                  className="inline-flex items-center gap-2 bg-[#B6913F] text-cream font-semibold py-2.5 px-5 rounded-xl text-[14px] hover:bg-[#7A5E1F] hover:-translate-y-px transition-all"
                >
                  Send me the free guide
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Helper: three-level card
   ───────────────────────────────────────────────────────────────── */

