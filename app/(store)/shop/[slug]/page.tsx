import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug, getActiveProducts } from "@/lib/db/queries";
import AddToCartButton from "@/components/shop/AddToCartButton";
import PriceDisplay from "@/components/shop/PriceDisplay";
import TestimonialBlock from "@/components/shared/TestimonialBlock";
import FAQSection from "@/components/shared/FAQSection";
import ProductGrid from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const allProducts = await getActiveProducts();
    return allProducts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
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
    return {};
  }
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  };
}

const productFAQ = [
  {
    question: "What age is this for?",
    answer:
      "Every pack includes adaptation notes for ages 4\u201314. Younger kids work with a parent; older kids work independently. The activities are designed so siblings of different ages can do them together at their own level.",
  },
  {
    question: "How do I use it?",
    answer:
      "Print the cards. Pick one. Go. There\u2019s no lesson plan, no prep, and no special materials. You can do one activity a day or one a week \u2014 whatever fits your family\u2019s rhythm.",
  },
  {
    question: "Can I use this with multiple kids?",
    answer:
      "Absolutely \u2014 every activity works for one child or five. Multi-age families love these because siblings can do the same activity at their own level. Many worldschool families use them with kids ranging from 4 to 14.",
  },
  {
    question: "What if my kids don\u2019t like it?",
    answer:
      "We\u2019re confident they will \u2014 these activities are designed around natural curiosity, not forced learning. But if it\u2019s not the right fit, email us within 14 days for a full refund. No questions, no hassle.",
  },
];

const categoryLabels: Record<string, string> = {
  seasonal: "Seasonal Pack",
  creativity: "Creativity Series",
  nature: "Nature Learning",
  "real-world": "Real-World Skills",
  "life-skills": "Life Skills",
  "ai-literacy": "AI & Digital",
  bundle: "Bundle",
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
    notFound();
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
    // DB unavailable for related products
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://anywherelearning.co/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-cream">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-6">
          <nav className="flex gap-2 text-sm text-gray-400">
            <Link
              href="/shop"
              className="hover:text-forest transition-colors"
            >
              Shop
            </Link>
            <span>&rsaquo;</span>
            <span className="text-gray-600">{product.name}</span>
          </nav>
        </div>

        {/* Product Detail — Two Columns */}
        <section className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-12">
            {/* Left: Product Visual (sticky on desktop) */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-cream to-gold-light/30 rounded-2xl flex items-center justify-center">
                {/* Floating document mockup */}
                <div className="w-4/5 aspect-[3/4] bg-white rounded-xl shadow-2xl border border-forest/10 p-8 transform rotate-1 animate-gentle-float flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-forest/20 mb-4" />
                  <p className="font-display text-center text-forest text-lg leading-snug mb-4">
                    {product.name}
                  </p>
                  <div className="space-y-2 w-full px-4">
                    <div className="h-1.5 bg-gray-200 rounded-full w-full" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-4/5" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-3/5" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-4/5" />
                  </div>
                </div>

                {/* Activity count badge */}
                {product.activityCount && (
                  <div className="absolute bottom-6 right-6 bg-forest text-cream text-sm font-bold px-4 py-2 rounded-full shadow-md">
                    {product.activityCount} activities
                  </div>
                )}
              </div>
            </div>

            {/* Right: Copy + Purchase */}
            <div className="py-4">
              {/* Category label */}
              <p className="text-sm font-medium text-gold uppercase tracking-widest mb-3">
                {categoryLabels[product.category] || product.category}
              </p>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl text-forest leading-tight">
                {product.name}
              </h1>

              {/* Subtitle */}
              <p className="mt-2 text-lg text-gray-600">
                {product.shortDescription}
              </p>

              {/* Star rating */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-gold text-lg tracking-wide">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </span>
                <span className="text-sm text-gray-400">
                  Loved by families everywhere
                </span>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Price */}
              <PriceDisplay
                priceCents={product.priceCents}
                compareAtPriceCents={product.compareAtPriceCents}
                size="lg"
              />

              {/* Buy Button */}
              <div className="mt-6">
                <AddToCartButton
                  lemonVariantId={product.lemonVariantId}
                  productName={product.name}
                  priceCents={product.priceCents}
                />
              </div>

              {/* Trust line */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>&#x1F4E5; Instant PDF download</span>
                <span>&#x1F5A8;&#xFE0F; Print at home</span>
                {product.ageRange && (
                  <span>&#x1F476; Ages {product.ageRange}</span>
                )}
              </div>

              <hr className="my-8 border-gray-200" />

              {/* What's Inside — 2-column grid */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  What&apos;s Inside
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.activityCount && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <span className="text-forest font-semibold">&#x2713;</span>
                      <span className="text-sm text-gray-700">
                        {product.activityCount} age-flexible activity cards
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest font-semibold">&#x2713;</span>
                    <span className="text-sm text-gray-700">
                      Each takes 15&ndash;45 minutes
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest font-semibold">&#x2713;</span>
                    <span className="text-sm text-gray-700">
                      No special materials needed
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest font-semibold">&#x2713;</span>
                    <span className="text-sm text-gray-700">
                      Works for one child or five
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest font-semibold">&#x2713;</span>
                    <span className="text-sm text-gray-700">
                      Age adaptation notes included
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest font-semibold">&#x2713;</span>
                    <span className="text-sm text-gray-700">
                      Printable PDF &mdash; instant download
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Philosophy Badges */}
              <div className="bg-gold-light/20 rounded-2xl p-6 mb-8">
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
                  <span>&#x1F6AB; No curriculum needed</span>
                  <span>&#x1F30D; Works anywhere</span>
                  <span>&#x1F3AF; Adapts to your child</span>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mb-8">
                <TestimonialBlock
                  testimonials={[
                    {
                      quote:
                        "My kids asked to do activities every single day. That\u2019s never happened before.",
                      name: "Sarah",
                      location:
                        "Tennessee \u00b7 homeschool of 3",
                    },
                    {
                      quote:
                        "We took these on our road trip and the kids were engaged the entire drive.",
                      name: "Mia",
                      location:
                        "Colorado \u00b7 worldschool family of 4",
                    },
                  ]}
                />
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Common Questions
                </h2>
                <FAQSection items={productFAQ} />
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
    </>
  );
}
