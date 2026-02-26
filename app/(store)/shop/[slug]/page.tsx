import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug, getActiveProducts } from "@/lib/db/queries";
import { formatPrice } from "@/lib/utils";
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
    // DB not available at build time — pages will be generated on-demand
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
      "Every pack includes adaptation notes for ages 4–14. Younger kids work with a parent; older kids work independently.",
  },
  {
    question: "How do I use it?",
    answer:
      "Print the cards. Pick one. Go. There's no lesson plan, no prep, and no special materials.",
  },
  {
    question: "Can I use this with multiple kids?",
    answer:
      "Yes — every activity works for one child or five. Multi-age families love these because siblings can do the same activity at their own level.",
  },
  {
    question: "What if my kids don't like it?",
    answer:
      "We're confident they will — but if not, email us within 14 days for a full refund.",
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
    // DB unavailable for related products — show none
  }

  // JSON-LD structured data
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
          <nav className="flex gap-2 text-sm text-gray-400">
            <Link href="/shop" className="hover:text-forest transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-gray-600">{product.name}</span>
          </nav>
        </div>

        {/* Product Detail */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Product Image */}
            <div>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-forest/10 to-gold/10 flex items-center justify-center">
                <span className="text-6xl text-forest/30">
                  {product.isBundle ? "📦" : "📄"}
                </span>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              {/* Category */}
              <span className="inline-block w-fit rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
                {categoryLabels[product.category] || product.category}
              </span>

              {/* Title */}
              <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl font-[family-name:var(--font-display)] text-forest">
                {product.name}
              </h1>

              {/* Subtitle */}
              <p className="mt-2 text-lg text-gray-600">
                {product.shortDescription}
              </p>

              {/* Price */}
              <div className="mt-6">
                <PriceDisplay
                  priceCents={product.priceCents}
                  compareAtPriceCents={product.compareAtPriceCents}
                />
              </div>

              {/* Buy Button */}
              <div className="mt-6">
                <AddToCartButton
                  lemonVariantId={product.lemonVariantId}
                  productName={product.name}
                  priceCents={product.priceCents}
                />
              </div>

              {/* Trust line */}
              <p className="mt-3 text-center text-xs text-gray-400">
                Instant PDF download · Print at home
                {product.ageRange ? ` · Works for ${product.ageRange}` : ""}
              </p>

              {/* What's Inside */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  What&apos;s Inside
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {product.activityCount && (
                    <li className="flex gap-2">
                      <span className="text-forest">✓</span>
                      {product.activityCount} age-flexible activity cards
                    </li>
                  )}
                  <li className="flex gap-2">
                    <span className="text-forest">✓</span>
                    Each takes 15–45 minutes
                  </li>
                  <li className="flex gap-2">
                    <span className="text-forest">✓</span>
                    No special materials needed
                  </li>
                  <li className="flex gap-2">
                    <span className="text-forest">✓</span>
                    Printable PDF — instant download
                  </li>
                  <li className="flex gap-2">
                    <span className="text-forest">✓</span>
                    Works for one child or five
                  </li>
                  <li className="flex gap-2">
                    <span className="text-forest">✓</span>
                    Includes age adaptation notes
                  </li>
                </ul>
              </div>

              {/* Full Description */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="prose prose-sm text-gray-600">
                  <p>{product.description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Badges */}
        <section className="bg-gold-light/20 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {[
                "Charlotte Mason",
                "Montessori",
                "Unschool",
                "Worldschool",
                "Eclectic",
              ].map((style) => (
                <span
                  key={style}
                  className="rounded-full bg-white/80 px-4 py-1.5 text-gray-600 border border-gold/20"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
              What families are saying
            </h2>
            <TestimonialBlock
              testimonials={[
                {
                  quote: "My kids asked to do activities every single day. That's never happened before.",
                  name: "Sarah",
                  location: "Tennessee / homeschool of 3",
                },
                {
                  quote: "We took these on our road trip and the kids were engaged the entire drive.",
                  name: "Mia",
                  location: "Colorado / worldschool family of 4",
                },
              ]}
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-gold-light/10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
              Common Questions
            </h2>
            <FAQSection items={productFAQ} />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
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
