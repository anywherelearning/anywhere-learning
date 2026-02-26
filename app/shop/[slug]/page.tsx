import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getActiveProducts, getRelatedProducts } from '@/lib/db/queries';
import AddToCartButton from '@/components/shop/AddToCartButton';
import PriceDisplay from '@/components/shop/PriceDisplay';
import TrustBadges from '@/components/shared/TrustBadges';
import TestimonialBlock from '@/components/shared/TestimonialBlock';
import FAQSection from '@/components/shared/FAQSection';
import ProductGrid from '@/components/shop/ProductGrid';

export const revalidate = 86400; // revalidate daily

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) return [];
  try {
    const allProducts = await getActiveProducts();
    return allProducts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: 'Product Not Found' };
    }
    return {
      title: product.name,
      description: product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: product.imageUrl ? [{ url: product.imageUrl }] : [],
      },
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

const categoryLabels: Record<string, string> = {
  seasonal: 'Seasonal',
  creativity: 'Creativity',
  nature: 'Nature & Outdoor',
  'real-world': 'Real-World Skills',
  'life-skills': 'Life Skills',
  'ai-literacy': 'AI & Digital',
  bundle: 'Bundle',
};

const defaultFAQ = [
  {
    question: 'What age is this for?',
    answer:
      'Every pack includes adaptation notes for ages 4\u201314. Younger kids work with a parent; older kids work independently. The activities are designed so siblings of different ages can do them together at their own level.',
  },
  {
    question: 'How do I use it?',
    answer:
      'Print the cards. Pick one. Go. There\u2019s no lesson plan, no prep, and no special materials. You can do one activity a day or one a week \u2014 whatever fits your family\u2019s rhythm.',
  },
  {
    question: 'Can I use this with multiple kids?',
    answer:
      'Absolutely \u2014 every activity works for one child or five. Multi-age families love these because siblings can do the same activity at their own level. Many worldschool families use them with kids ranging from 4 to 14.',
  },
  {
    question: 'What if my kids don\u2019t like it?',
    answer:
      'We\u2019re confident they will \u2014 these activities are designed around natural curiosity, not forced learning. But if it\u2019s not the right fit, email us within 14 days for a full refund. No questions, no hassle.',
  },
];

const testimonials = [
  {
    quote:
      'My kids asked to do activities every single day. That\u2019s never happened before.',
    name: 'Sarah',
    location: 'Tennessee \u00b7 homeschool of 3',
  },
  {
    quote:
      'We took these on our road trip and the kids were engaged the entire drive.',
    name: 'Mia',
    location: 'Colorado \u00b7 worldschool family of 4',
  },
];

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  let related: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  try {
    related = await getRelatedProducts(slug, product.category);
  } catch {
    // No related products if DB query fails
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.imageUrl,
    offers: {
      '@type': 'Offer',
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://anywherelearning.co/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-cream min-h-screen">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4">
          <nav className="text-sm text-gray-400">
            <a href="/shop" className="hover:text-forest transition-colors">Shop</a>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-gray-600">{product.name}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            {/* LEFT: Product Visual */}
            <div className="md:sticky md:top-24 md:self-start">
              <div className="aspect-[3/4] bg-gradient-to-br from-cream to-gold-light/30 rounded-2xl flex items-center justify-center p-12 relative">
                {/* Large floating document mockup */}
                <div className="w-4/5 aspect-[3/4] bg-white rounded-xl shadow-2xl border border-forest/10 p-8 transform rotate-1 animate-gentle-float">
                  <div className="w-10 h-10 rounded-full bg-forest/20 mx-auto mb-4" />
                  <p className="font-display text-center text-forest text-lg mb-4">
                    {product.name}
                  </p>
                  <div className="space-y-2 px-4">
                    <div className="h-1.5 bg-gray-200 rounded-full w-full" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-4/5" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-3/5" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-4/5 mt-4" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-2/3" />
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

            {/* RIGHT: Copy + Purchase */}
            <div className="py-4">
              {/* Category label */}
              <p className="text-sm font-medium text-gold uppercase tracking-widest mb-3">
                {categoryLabels[product.category] || product.category}
              </p>

              {/* H1 */}
              <h1 className="font-display text-3xl md:text-4xl text-forest leading-tight mb-3">
                {product.name}
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Star rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-gold">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <span className="text-sm text-gray-400">Loved by families everywhere</span>
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Price block */}
              <div className="mb-6">
                <PriceDisplay
                  priceCents={product.priceCents}
                  compareAtPriceCents={product.compareAtPriceCents}
                  size="lg"
                />
              </div>

              {/* BUY BUTTON */}
              <AddToCartButton
                lemonVariantId={product.lemonVariantId}
                productName={product.name}
                priceCents={product.priceCents}
              />

              {/* Trust line */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <span>&#x1F4E5; Instant PDF download</span>
                <span>&#x1F5A8;&#xFE0F; Print at home</span>
                {product.ageRange && <span>&#x1F476; {product.ageRange}</span>}
              </div>

              <hr className="border-gray-200 my-8" />

              {/* WHAT'S INSIDE */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s inside</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.activityCount && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <span className="text-forest text-lg">&#10003;</span>
                      <span className="text-sm text-gray-700">{product.activityCount} age-flexible activity cards</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest text-lg">&#10003;</span>
                    <span className="text-sm text-gray-700">Each takes 15&ndash;45 minutes</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest text-lg">&#10003;</span>
                    <span className="text-sm text-gray-700">No special materials needed</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest text-lg">&#10003;</span>
                    <span className="text-sm text-gray-700">Works for one child or five</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest text-lg">&#10003;</span>
                    <span className="text-sm text-gray-700">Age adaptation notes included</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-forest text-lg">&#10003;</span>
                    <span className="text-sm text-gray-700">Printable PDF &mdash; instant download</span>
                  </div>
                </div>
              </div>

              {/* FULL DESCRIPTION */}
              <div className="prose prose-gray max-w-none mb-8">
                {product.description.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">{paragraph}</p>
                ))}
              </div>

              {/* PHILOSOPHY BADGES */}
              <TrustBadges />

              {/* TESTIMONIALS */}
              <div className="mt-8 mb-8">
                <TestimonialBlock testimonials={testimonials} />
              </div>

              {/* FAQ */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Common questions</h2>
                <FAQSection items={defaultFAQ} />
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-20 pt-16 border-t border-gray-200">
              <h2 className="font-display text-3xl text-forest mb-8 text-center">
                You might also like
              </h2>
              <ProductGrid products={related} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}
