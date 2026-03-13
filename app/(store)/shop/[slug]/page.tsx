import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, getActiveProducts } from "@/lib/db/queries";
import { getFallbackProductBySlug, getFallbackProducts } from "@/lib/fallback-products";
import AddToCartButton from "@/components/shop/AddToCartButton";
import PreviewButton from "@/components/shop/PreviewButton";
import PriceDisplay from "@/components/shop/PriceDisplay";
import { hasPreview } from "@/lib/preview-map";
import ProductGrid from "@/components/shop/ProductGrid";
import StickyMobileBuy from "@/components/shop/StickyMobileBuy";
import BundleContents from "@/components/shop/BundleContents";
import ProductHighlights from "@/components/shop/ProductHighlights";
import ProductDescriptionSection from "@/components/shop/ProductDescriptionSection";
import ProductReviews from "@/components/shop/ProductReviews";
import { getProductReviewStats } from "@/lib/db/queries";
import {
  CategoryIcon,
  ZapIcon,
  DeviceIcon,
  ShieldCheckIcon,
} from "@/components/shop/icons";

export const revalidate = 86400; // ISR: revalidate daily

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
    product = getFallbackProductBySlug(slug);
  }
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `https://anywherelearning.co/shop/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `https://anywherelearning.co/shop/${product.slug}`,
      images: product.imageUrl
        ? [{ url: product.imageUrl }]
        : [{ url: 'https://anywherelearning.co/og-default.png', width: 1200, height: 630 }],
    },
  };
}


const categoryLabels: Record<string, string> = {
  "ai-literacy": "AI & Digital",
  creativity: "Creativity Series",
  "critical-thinking": "Critical Thinking",
  "life-skills": "Life Skills",
  literacy: "Literacy",
  nature: "Nature Learning",
  "real-world-math": "Math & Money",
  "self-management": "Self-Management",
  bundle: "Bundle",
};

const coverClasses: Record<string, string> = {
  "ai-literacy": "cover-ai-literacy",
  creativity: "cover-creativity",
  "critical-thinking": "cover-critical-thinking",
  "life-skills": "cover-life-skills",
  literacy: "cover-literacy",
  nature: "cover-nature",
  "real-world-math": "cover-real-world-math",
  "self-management": "cover-self-management",
  bundle: "cover-bundle",
};


export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    product = getFallbackProductBySlug(slug);
  }

  if (!product) notFound();

  // Get related products (same category, excluding this one)
  let relatedProducts: (typeof product)[] = [];
  try {
    const allProducts = await getActiveProducts();
    relatedProducts = allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  } catch {
    relatedProducts = getFallbackProducts()
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }

  // Get review stats for JSON-LD
  let reviewStats = { averageRating: 0, reviewCount: 0 };
  try {
    reviewStats = await getProductReviewStats(product.id);
  } catch { /* DB unavailable */ }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl || "https://anywherelearning.co/og-default.png",
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "Anywhere Learning",
    },
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://anywherelearning.co/shop/${product.slug}`,
    },
    ...(reviewStats.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewStats.averageRating.toFixed(1),
        reviewCount: String(reviewStats.reviewCount),
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://anywherelearning.co" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://anywherelearning.co/shop" },
      { "@type": "ListItem", position: 3, name: product.name, item: `https://anywherelearning.co/shop/${product.slug}` },
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

      <div className="bg-cream">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-6">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link
              href="/shop"
              className="hover:text-forest transition-colors"
            >
              Shop
            </Link>
            <span>&rsaquo;</span>
            <Link
              href={`/shop?category=${product.category}`}
              className="hover:text-forest transition-colors"
            >
              {categoryLabels[product.category] || product.category}
            </Link>
            <span>&rsaquo;</span>
            <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Product Detail — Two Columns */}
        <section className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-12">
            {/* Left: Product Visual (sticky on desktop) */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {product.imageUrl ? (
                /* Real cover image */
                <div className="relative aspect-[5/4] md:aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                    priority
                  />

                  {/* Bundle badge */}
                  {product.isBundle && (
                    <div className="absolute top-5 left-5 bg-gold text-white text-xs font-bold px-4 py-2 rounded-full shadow-md animate-pulse-glow z-10">
                      BEST VALUE
                    </div>
                  )}

                  {/* Category pill */}
                  <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 z-10">
                    <CategoryIcon category={product.category} className="w-4 h-4" />
                    {categoryLabels[product.category] || product.category}
                  </div>

                  {/* Preview button on image */}
                  {!product.isBundle && hasPreview(product.slug) && (
                    <div className="absolute bottom-5 right-5 z-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow">
                      <PreviewButton slug={product.slug} productName={product.name} />
                    </div>
                  )}
                </div>
              ) : (
                /* Category gradient cover */
                <div
                  className={`relative aspect-[5/4] md:aspect-[4/3] ${
                    coverClasses[product.category] || "cover-nature"
                  } rounded-3xl flex flex-col items-center justify-center p-8 text-white overflow-hidden shadow-lg`}
                >
                  {/* Decorative dot pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      <pattern id="cover-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1.5" fill="white" />
                      </pattern>
                      <rect width="200" height="200" fill="url(#cover-dots)" />
                    </svg>
                  </div>

                  {/* Category icon watermark */}
                  <div
                    className="absolute top-6 right-6 opacity-15"
                    aria-hidden="true"
                  >
                    <CategoryIcon category={product.category} className="w-20 h-20 text-white" />
                  </div>

                  {/* Product name */}
                  <p className="relative font-display text-3xl md:text-4xl lg:text-5xl text-center leading-snug text-white drop-shadow-sm max-w-[85%]">
                    {product.name}
                  </p>

                  {/* Activity count */}
                  {product.activityCount && (
                    <p className="relative mt-4 text-lg text-white/80 font-medium bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full">
                      {product.activityCount} activities inside
                    </p>
                  )}

                  {/* Category pill */}
                  <div className="absolute bottom-5 left-5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2">
                    <CategoryIcon category={product.category} className="w-4 h-4 text-white" />
                    {categoryLabels[product.category] || product.category}
                  </div>

                  {/* Bundle badge */}
                  {product.isBundle && (
                    <div className="absolute top-5 left-5 bg-gold text-white text-xs font-bold px-4 py-2 rounded-full shadow-md animate-pulse-glow">
                      BEST VALUE
                    </div>
                  )}

                  {/* Preview button on image */}
                  {!product.isBundle && hasPreview(product.slug) && (
                    <div className="absolute bottom-5 right-5 z-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow">
                      <PreviewButton slug={product.slug} productName={product.name} />
                    </div>
                  )}
                </div>
              )}

              {/* Buy section — under image, sticky on desktop */}
              <div className="mt-4" id="buy-button">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  {product.isBundle && (
                    <div className="flex items-center justify-between mb-3">
                      <PriceDisplay
                        priceCents={product.priceCents}
                        compareAtPriceCents={product.compareAtPriceCents}
                        size="sm"
                      />
                      <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                        BEST VALUE
                      </span>
                    </div>
                  )}
                  <AddToCartButton
                    stripePriceId={product.stripePriceId}
                    slug={product.slug}
                    productName={product.name}
                    priceCents={product.priceCents}
                    category={product.category}
                    isBundle={product.isBundle ?? false}
                    imageUrl={product.imageUrl}
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Instant download &middot; Use on any device
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                    <Link
                      href="/membership"
                      className="text-xs text-forest/70 hover:text-forest transition-colors"
                    >
                      Or access everything with a membership &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy + Purchase */}
            <div className="py-4">
              {/* Category label */}
              <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                <CategoryIcon category={product.category} className="w-4 h-4 text-gold" />
                {categoryLabels[product.category] || product.category}
              </p>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl text-forest leading-tight">
                {product.name}
              </h1>

              {/* Subtitle */}
              <p className="mt-2 text-lg text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Buy CTA — top of right column (desktop only) */}
              <div className="hidden lg:block mt-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  {product.isBundle && (
                    <div className="flex items-center justify-between mb-3">
                      <PriceDisplay
                        priceCents={product.priceCents}
                        compareAtPriceCents={product.compareAtPriceCents}
                        size="sm"
                      />
                      <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                        BEST VALUE
                      </span>
                    </div>
                  )}
                  <AddToCartButton
                    stripePriceId={product.stripePriceId}
                    slug={product.slug}
                    productName={product.name}
                    priceCents={product.priceCents}
                    category={product.category}
                    isBundle={product.isBundle ?? false}
                    imageUrl={product.imageUrl}
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Instant download &middot; Use on any device
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                    <Link
                      href="/membership"
                      className="text-xs text-forest/70 hover:text-forest transition-colors"
                    >
                      Or access everything with a membership &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Highlights strip */}
              <ProductHighlights
                slug={product.slug}
                description={product.description}
                category={product.category}
                activityCount={product.activityCount}
                ageRange={product.ageRange}
                isBundle={product.isBundle ?? false}
              />

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 py-3 px-2 text-center">
                  <span aria-hidden="true"><ZapIcon className="w-5 h-5 text-forest" /></span>
                  <span className="text-xs text-gray-500 font-medium">Instant Download</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 py-3 px-2 text-center">
                  <span aria-hidden="true"><DeviceIcon className="w-5 h-5 text-forest" /></span>
                  <span className="text-xs text-gray-500 font-medium">Use on Any Device</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 py-3 px-2 text-center">
                  <span aria-hidden="true"><ShieldCheckIcon className="w-5 h-5 text-forest" /></span>
                  <span className="text-xs text-gray-500 font-medium">Secure Checkout</span>
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Rich Description */}
              <ProductDescriptionSection
                slug={product.slug}
                description={product.description}
                category={product.category}
                activityCount={product.activityCount}
                isBundle={product.isBundle ?? false}
              />

              {/* Bundle: Included Products */}
              {product.isBundle && (
                <div className="mt-8">
                  <BundleContents
                    bundleSlug={product.slug}
                    bundlePriceCents={product.priceCents}
                  />
                </div>
              )}

              {/* Philosophy Badges */}
              <div className="bg-gold-light/10 rounded-2xl p-6 my-8">
                <p className="text-sm text-gray-500 mb-3">
                  Works beautifully with:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    "Charlotte Mason",
                    "Montessori",
                    "Unschool",
                    "Worldschool",
                    "Eclectic",
                  ].map((style) => (
                    <span
                      key={style}
                      className="bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200"
                    >
                      {style}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>No curriculum needed</span>
                  <span>&middot;</span>
                  <span>Works anywhere</span>
                  <span>&middot;</span>
                  <span>Adapts to your child</span>
                </div>
              </div>

              {/* Reviews */}
              <ProductReviews
                productId={product.id}
                productSlug={product.slug}
                productName={product.name}
              />

              {/* Buy CTA — bottom of right column (all screen sizes) */}
              <div className="bg-forest/5 border border-forest/15 rounded-2xl p-6 mt-8 text-center">
                <p className="font-display text-xl text-forest mb-4">
                  Ready to get started?
                </p>
                <div className="flex justify-center mb-4">
                  <PriceDisplay
                    priceCents={product.priceCents}
                    compareAtPriceCents={product.compareAtPriceCents}
                    size="sm"
                  />
                </div>
                <AddToCartButton
                  stripePriceId={product.stripePriceId}
                  slug={product.slug}
                  productName={product.name}
                  priceCents={product.priceCents}
                  category={product.category}
                  isBundle={product.isBundle ?? false}
                  imageUrl={product.imageUrl}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Instant download &middot; Use on any device
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-gray-200">
            <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
              <h2 className="font-display text-3xl text-forest mb-8 text-center">
                You might also like
              </h2>
              <ProductGrid products={relatedProducts} />
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Buy Bar */}
      <StickyMobileBuy
        productName={product.name}
        priceCents={product.priceCents}
        stripePriceId={product.stripePriceId}
        slug={product.slug}
        category={product.category}
        isBundle={product.isBundle ?? false}
        imageUrl={product.imageUrl}
      />
    </>
  );
}
