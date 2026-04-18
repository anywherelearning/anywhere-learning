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
import BestForSection from "@/components/shop/BestForSection";
import ProductReviews from "@/components/shop/ProductReviews";
import { getAllReviewStatsBySlug, getProductReviewStats } from "@/lib/db/queries";
import {
  CategoryIcon,
  ZapIcon,
  DeviceIcon,
  ShieldCheckIcon,
} from "@/components/shop/icons";
import NativeOnly from "@/components/mobile/NativeOnly";
import NativeHide from "@/components/mobile/NativeHide";
import NativeProductDetail from "@/components/mobile/NativeProductDetail";
import BundleUpgradePrice from "@/components/shop/BundleUpgradePrice";
import BundlePreviewButton from "@/components/shop/BundlePreviewButton";
import type { BundlePreviewItem } from "@/components/shop/BundlePreviewModal";
import FreeGuideCTA from "@/components/shop/FreeGuideCTA";
import { CATEGORY_LABELS, coverClassFor } from "@/lib/categories";
import { FREE_BONUS_SLUG, BUNDLE_CONTENTS } from "@/lib/bundles";

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
    // DB not available
  }
  if (!product) product = getFallbackProductBySlug(slug);
  if (!product) return {};
  const categoryKeywords: Record<string, string> = {
    'outdoor-learning': 'Outdoor Learning Activities',
    'creativity-anywhere': 'Creative Activities for Kids',
    'ai-literacy': 'AI & Digital Literacy for Kids',
    'real-world-math': 'Real-World Math Activities',
    'communication-writing': 'Writing & Communication Activities',
    'entrepreneurship': 'Entrepreneurship Activities for Kids',
    'planning-problem-solving': 'Problem-Solving Activities',
    'start-here': 'Homeschool Activities',
    bundle: 'Homeschool Activity Bundle',
  };
  const suffix = categoryKeywords[product.category] || 'Homeschool Activities';
  return {
    title: `${product.name} | ${suffix}`,
    description: `${product.shortDescription} Low-prep digital guide for ${product.ageRange || 'ages 6-14'}. Instant download. Use on any device.`,
    alternates: {
      canonical: `https://anywherelearning.co/shop/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `https://anywherelearning.co/shop/${product.slug}`,
      images: product.imageUrl
        ? [{ url: product.imageUrl.startsWith('http') ? product.imageUrl : `https://anywherelearning.co${product.imageUrl}` }]
        : [{ url: 'https://anywherelearning.co/og-default.png', width: 1200, height: 630 }],
    },
  };
}


/** "Works beautifully with" badges block. Shared between the right column
 *  (non-bundles + mobile bundles) and the left column (desktop bundles). */
function PhilosophyBadges() {
  return (
    <div className="bg-gold-light/10 rounded-2xl p-6 my-8">
      <p className="text-sm text-gray-500 mb-3">Works beautifully with:</p>
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
  );
}

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
    // DB not available
  }
  if (!product) product = getFallbackProductBySlug(slug);

  if (!product) notFound();

  // Get related products (same category, excluding this one)
  let relatedProducts: (typeof product)[] = [];
  let relatedStatsBySlug: Awaited<ReturnType<typeof getAllReviewStatsBySlug>> = {};
  try {
    const [allProducts, stats] = await Promise.all([
      getActiveProducts(),
      getAllReviewStatsBySlug(),
    ]);
    relatedStatsBySlug = stats;
    relatedProducts = allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  } catch {
    relatedProducts = getFallbackProducts()
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }

  // Enrich related products with review stats so grid cards can render stars.
  relatedProducts = relatedProducts.map((p) => ({
    ...p,
    ...(relatedStatsBySlug[p.slug] ?? {}),
  }));

  // Get review stats for JSON-LD
  let reviewStats = { averageRating: 0, reviewCount: 0 };
  try {
    reviewStats = await getProductReviewStats(product.id);
  } catch { /* DB unavailable */ }

  // Parse product.ageRange ("Ages 6-14", "Ages 0–14+", etc.) into numeric
  // min/max for PeopleAudience. Google Merchant requires PeopleAudience with
  // suggestedMinAge/suggestedMaxAge for Product.audience; EducationalAudience
  // was rejected in GSC. Fall back to 6-14 (the site's stated default range).
  const ageRangeMatch = product.ageRange?.match(/(\d+)\s*[\u2013\u2014-]\s*(\d+)/);
  const suggestedMinAge = ageRangeMatch ? Number(ageRangeMatch[1]) : 6;
  const suggestedMaxAge = ageRangeMatch ? Number(ageRangeMatch[2]) : 14;

  // priceValidUntil: Google wants an explicit expiry for merchant listings.
  // Set to end of next year; ISR revalidates daily so it never goes stale.
  const priceValidUntil = `${new Date().getUTCFullYear() + 1}-12-31`;

  // Shared offer fields — digital download with zero-cost worldwide shipping
  // and a 48-hour money-back guarantee. Reused on both top-level and variant
  // offers so Google Merchant listings validate on every Offer.
  const shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0",
      currency: "USD",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      geoTargetName: "Worldwide",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 0,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 0,
        unitCode: "DAY",
      },
    },
  } as const;

  const merchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "US",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 2,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  } as const;

  // Bundles are re-typed as ProductGroup with hasVariant referencing member
  // products by URL so AI engines can answer "what's in this bundle".
  const bundleChildSlugs = product.isBundle ? (BUNDLE_CONTENTS[product.slug] || []) : [];
  const hasVariant = bundleChildSlugs
    .map((childSlug) => getFallbackProductBySlug(childSlug))
    .filter((child): child is NonNullable<typeof child> => child !== null)
    .map((child) => ({
      "@type": "Product" as const,
      "@id": `https://anywherelearning.co/shop/${child.slug}`,
      name: child.name,
      url: `https://anywherelearning.co/shop/${child.slug}`,
      sku: child.slug,
      ...(child.imageUrl && {
        image: child.imageUrl.startsWith('http')
          ? child.imageUrl
          : `https://anywherelearning.co${child.imageUrl}`,
      }),
      offers: {
        "@type": "Offer",
        price: (child.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        priceValidUntil,
        availability: "https://schema.org/InStock",
        url: `https://anywherelearning.co/shop/${child.slug}`,
        shippingDetails,
        hasMerchantReturnPolicy: merchantReturnPolicy,
      },
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": product.isBundle ? "ProductGroup" : "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl
      ? (product.imageUrl.startsWith('http') ? product.imageUrl : `https://anywherelearning.co${product.imageUrl}`)
      : "https://anywherelearning.co/og-default.png",
    sku: product.slug,
    ...(product.isBundle && {
      productGroupID: product.slug,
      variesBy: ["https://schema.org/category"],
      hasVariant,
    }),
    brand: {
      "@type": "Brand",
      name: "Anywhere Learning",
    },
    category: CATEGORY_LABELS[product.category] || product.category,
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge,
      suggestedMaxAge,
    },
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      url: `https://anywherelearning.co/shop/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "Anywhere Learning",
      },
      shippingDetails,
      hasMerchantReturnPolicy: merchantReturnPolicy,
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

  // For bundle products, build the list of included items for the preview modal.
  let bundlePreviewItems: BundlePreviewItem[] = [];
  if (product.isBundle) {
    const childSlugs = BUNDLE_CONTENTS[product.slug] || [];
    bundlePreviewItems = childSlugs
      .map((childSlug) => {
        const child = getFallbackProductBySlug(childSlug);
        if (!child) return null;
        return {
          slug: child.slug,
          name: child.name,
          imageUrl: child.imageUrl,
          hasPreview: hasPreview(child.slug),
        } satisfies BundlePreviewItem;
      })
      .filter((i): i is BundlePreviewItem => i !== null);
  }

  // Prepare data for native view
  const nativeProduct = {
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl,
    category: product.category,
    isBundle: product.isBundle ?? false,
    ageRange: product.ageRange,
    activityCount: product.activityCount,
  };
  const nativeRelated = relatedProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    priceCents: p.priceCents,
    imageUrl: p.imageUrl,
    category: p.category,
  }));

  return (
    <>
      <NativeOnly>
        <NativeProductDetail product={nativeProduct} relatedProducts={nativeRelated} />
      </NativeOnly>
      <NativeHide>
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
          <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
            <ol className="flex items-center gap-2 list-none p-0 m-0">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-forest transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">&rsaquo;</li>
              <li>
                <Link
                  href={`/shop?category=${product.category}`}
                  className="hover:text-forest transition-colors"
                >
                  {CATEGORY_LABELS[product.category] || product.category}
                </Link>
              </li>
              <li aria-hidden="true">&rsaquo;</li>
              <li aria-current="page" className="text-gray-600 truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>
        </div>

        {/* Product Detail - Two Columns.
            Non-bundle: left (sticky image + buy box) / right (title, desc, reviews).
            Bundle: TpT-style — left holds image + preview button + description;
            right holds title, price, highlights, products-in-bundle, reviews.
            For bundles, each column flows independently, so tall right-column
            content never leaves dead space next to the description. */}
        <section className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-12 lg:items-start">
            {/* Left: Product Visual + description (matches bundle layout). */}
            <div>
              {product.imageUrl ? (
                /* Real cover image */
                <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-3xl overflow-hidden shadow-lg">
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
                    <div className="absolute top-5 left-5 bg-gold text-white text-xs font-bold px-4 py-2 rounded-full shadow-md z-10">
                      BEST VALUE
                    </div>
                  )}

                  {/* Category pill */}
                  <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 z-10">
                    <CategoryIcon category={product.category} className="w-4 h-4" />
                    {CATEGORY_LABELS[product.category] || product.category}
                  </div>

                </div>
              ) : (
                /* Category gradient cover */
                <div
                  className={`relative aspect-[3/4] max-w-sm mx-auto ${
                    coverClassFor(product.category)
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
                    {CATEGORY_LABELS[product.category] || product.category}
                  </div>

                  {/* Bundle badge */}
                  {product.isBundle && (
                    <div className="absolute top-5 left-5 bg-gold text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
                      BEST VALUE
                    </div>
                  )}

                </div>
              )}

              {/* View Preview button below the image for non-bundles */}
              {!product.isBundle && hasPreview(product.slug) && (
                <div className="mt-4 max-w-sm mx-auto">
                  <PreviewButton slug={product.slug} productName={product.name} variant="block" />
                </div>
              )}

              {/* Under-image block.
                  Bundle: prominent "View Preview" button (buy box moves to right column).
                  Non-bundle: buy box stays here, sticky with the image. */}
              {product.isBundle ? (
                <>
                  {/* View Preview button below the image */}
                  <div className="mt-4 max-w-sm mx-auto">
                    <BundlePreviewButton
                      bundle={{
                        slug: product.slug,
                        name: product.name,
                        imageUrl: product.imageUrl,
                        description: product.description,
                      }}
                      items={bundlePreviewItems}
                      variant="block"
                    />
                  </div>
                  {/* Description - on the left column for bundles (desktop only).
                      On mobile the description renders inside the right column
                      so the natural read order is image → title → price → highlights → description.
                      "Works beautifully with" is slotted in before the tagline so the
                      left column height better matches the right (Products in Bundle list). */}
                  <div className="hidden lg:block mt-8 lg:mt-10">
                    <h2 className="font-display text-2xl md:text-3xl text-forest mb-4">
                      Description
                    </h2>
                    <ProductDescriptionSection
                      slug={product.slug}
                      description={product.description}
                      category={product.category}
                      activityCount={product.activityCount}
                      isBundle={product.isBundle ?? false}
                      beforeTagline={<PhilosophyBadges />}
                    />
                  </div>
                  {/* Reviews on the left column (desktop bundles only) to
                      balance column heights against "Products in this Bundle". */}
                  <div className="hidden lg:block mt-8">
                    <ProductReviews
                      productId={product.id}
                      productSlug={product.slug}
                      productName={product.name}
                    />
                  </div>
                </>
              ) : (
                /* Non-bundle: description moves into the left column on desktop
                   (bundle-style layout). Best For / Works beautifully / Reviews
                   stay on the right. Buy box also moves to the right (near title). */
                <div className="hidden lg:block mt-8 lg:mt-10">
                  <h2 className="font-display text-2xl md:text-3xl text-forest mb-4">
                    Description
                  </h2>
                  <ProductDescriptionSection
                    slug={product.slug}
                    description={product.description}
                    category={product.category}
                    activityCount={product.activityCount}
                    isBundle={product.isBundle ?? false}
                    includeBestFor={false}
                  />
                </div>
              )}
            </div>

            {/* Right: Copy + Purchase.
                For bundles this column also shows the buy box (price + Get Bundle)
                near the top and the "Products in this Bundle" list below highlights. */}
            <div className="py-4">
              {/* Category label */}
              <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                <CategoryIcon category={product.category} className="w-4 h-4 text-gold" />
                {CATEGORY_LABELS[product.category] || product.category}
              </p>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl text-forest leading-tight">
                {product.name}
              </h1>

              {/* Subtitle */}
              <p className="mt-2 text-lg text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Free-with-bundle callout (Skills Map only) */}
              {product.slug === FREE_BONUS_SLUG && (
                <div className="mt-4 bg-gold/10 border border-gold/20 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5a3 3 0 015-3 3 3 0 015 3 3 3 0 01-2.83 3H13a1 1 0 011 1v1a1 1 0 01-1 1h-1v7a1 1 0 01-1 1H9a1 1 0 01-1-1v-7H7a1 1 0 01-1-1V9a1 1 0 011-1h.83A3 3 0 015 5zm4-1a1 1 0 10-2 0 1 1 0 002 0zm4 0a1 1 0 10-2 0 1 1 0 002 0z"/></svg>
                  <div>
                    <p className="text-sm font-semibold text-forest">Free with any bundle purchase</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Get this guide at no extra cost when you grab any bundle.{' '}
                      <Link href="/shop?category=bundle" className="text-forest font-medium underline underline-offset-2 hover:text-forest-dark transition-colors">
                        Browse bundles &rarr;
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Non-bundle buy box — mirrors the bundle TpT-style layout with
                  price + Get This CTA sitting right under the title. */}
              {!product.isBundle && (
                <div className="mt-6" id="buy-button">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="mb-3">
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
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Instant download &middot; Use on any device &middot; 48-hr money-back guarantee
                    </p>
                  </div>
                </div>
              )}

              {/* Bundle buy box - moved up here so price + Get Bundle CTA
                  sit under the title like TpT. */}
              {product.isBundle && (
                <div className="mt-6" id="buy-button">
                  <BundleUpgradePrice
                    slug={product.slug}
                    stripePriceId={product.stripePriceId}
                    fullPriceCents={product.priceCents}
                  >
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
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
                        Instant download &middot; Use on any device &middot; 48-hr money-back guarantee
                      </p>
                    </div>
                  </BundleUpgradePrice>
                </div>
              )}

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

              <p className="text-sm text-gray-400 text-center mt-3">
                Designed by a teacher with 15 years of classroom experience who left to homeschool her own kids.
              </p>

              <hr className="my-8 border-gray-200" />

              {/* Non-bundle description — mobile only on the right column.
                  Desktop version lives in the left column (matches bundle layout).
                  Best For is omitted here because it renders as a separate block
                  on the right so it stays visible on desktop too. */}
              {!product.isBundle && (
                <div className="lg:hidden mb-8">
                  <h2 className="font-display text-2xl md:text-3xl text-forest mb-4">
                    Description
                  </h2>
                  <ProductDescriptionSection
                    slug={product.slug}
                    description={product.description}
                    category={product.category}
                    activityCount={product.activityCount}
                    isBundle={product.isBundle ?? false}
                    includeBestFor={false}
                  />
                </div>
              )}

              {/* Best For — right column standalone for non-bundles
                  (visible on all breakpoints). */}
              {!product.isBundle && (
                <BestForSection category={product.category} />
              )}

              {/* Bundle description — mobile only (desktop version lives in
                  the left column below the image/preview button). This keeps
                  the natural mobile read order: image → preview → title →
                  price → highlights → trust → description → products list. */}
              {product.isBundle && (
                <div className="lg:hidden mb-8">
                  <h2 className="font-display text-2xl md:text-3xl text-forest mb-4">
                    Description
                  </h2>
                  <ProductDescriptionSection
                    slug={product.slug}
                    description={product.description}
                    category={product.category}
                    activityCount={product.activityCount}
                    isBundle={product.isBundle ?? false}
                  />
                </div>
              )}

              {/* Bundle: Included Products */}
              {product.isBundle && (
                <div>
                  <BundleContents
                    bundleSlug={product.slug}
                    bundlePriceCents={product.priceCents}
                  />
                </div>
              )}

              {/* Philosophy Badges.
                  Non-bundles: render here always.
                  Bundles: render on mobile only — on desktop this block moves
                  to the left column (inside ProductDescriptionSection) to balance
                  column heights. */}
              <div className={product.isBundle ? "lg:hidden" : ""}>
                <PhilosophyBadges />
              </div>

              {/* Reviews.
                  Non-bundles: render here always.
                  Bundles: render on mobile only — on desktop this block moves
                  to the left column (below the description) to balance column heights. */}
              <div className={product.isBundle ? "lg:hidden" : ""}>
                <ProductReviews
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                />
              </div>

            </div>
          </div>

          {/* Closing tagline — full-width, centered below both columns. */}
          <div className="mt-12 text-center">
            <p className="font-display text-xl md:text-2xl text-gold">
              Low prep. Flexible. Meaningful learning, wherever you are.
            </p>
          </div>
        </section>

        {/* Free Guide CTA */}
        <FreeGuideCTA />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-gray-200">
            <div className="mx-auto max-w-4xl px-5 sm:px-8 pb-16">
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
      </NativeHide>
    </>
  );
}
