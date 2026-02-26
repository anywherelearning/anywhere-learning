import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
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

const defaultFAQ = [
  {
    question: 'What age is this for?',
    answer:
      'Every pack includes adaptation notes for ages 4\u201314. Younger kids work with a parent; older kids work independently.',
  },
  {
    question: 'How do I use it?',
    answer:
      'Print the cards. Pick one. Go. There\u2019s no lesson plan, no prep, and no special materials.',
  },
  {
    question: 'Can I use this with multiple kids?',
    answer:
      'Yes \u2014 every activity works for one child or five. Multi-age families love these because siblings can do the same activity at their own level.',
  },
  {
    question: 'What if my kids don\u2019t like it?',
    answer:
      'We\u2019re confident they will \u2014 but if not, email us within 14 days for a full refund.',
  },
];

const testimonials = [
  {
    quote:
      'My kids asked to do activities every single day. That\u2019s never happened before.',
    name: 'Sarah',
    location: 'Tennessee / homeschool of 3',
  },
  {
    quote:
      'We took these on our road trip and the kids were engaged the entire drive.',
    name: 'Mia',
    location: 'Colorado / worldschool family of 4',
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

      {/* Product hero */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            {/* Left: image */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-forest/10 to-gold-light/30 shadow-sm">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-3xl text-forest/20">
                      {product.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: details */}
            <div>
              {/* Category pill */}
              <span className="inline-block rounded-full bg-forest px-3 py-1 text-xs font-medium text-cream">
                {product.category === 'real-world'
                  ? 'Real-World Skills'
                  : product.category === 'life-skills'
                    ? 'Life Skills'
                    : product.category === 'ai-literacy'
                      ? 'AI & Digital'
                      : product.category.charAt(0).toUpperCase() + product.category.slice(1)}{' '}
                Pack
              </span>

              <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              {product.activityCount && product.ageRange && (
                <p className="mt-2 text-lg text-gray-600">
                  {product.activityCount} real-world activities your kids will actually choose
                </p>
              )}

              {/* Price */}
              <div className="mt-4">
                <PriceDisplay
                  priceCents={product.priceCents}
                  compareAtPriceCents={product.compareAtPriceCents}
                />
              </div>

              {/* Buy button */}
              <div className="mt-6">
                <AddToCartButton
                  lemonVariantId={product.lemonVariantId}
                  productName={product.name}
                  priceCents={product.priceCents}
                />
              </div>

              {/* Trust line */}
              <p className="mt-3 text-center text-sm text-gray-500">
                Instant PDF download &middot; Print at home
                {product.ageRange && <> &middot; {product.ageRange}</>}
              </p>

              {/* What's inside */}
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  What&apos;s Inside
                </h2>
                <ul className="mt-4 space-y-2">
                  {product.activityCount && (
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="mt-1 text-forest">&#10003;</span>
                      {product.activityCount} age-flexible activity cards
                    </li>
                  )}
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="mt-1 text-forest">&#10003;</span>
                    Each takes 15&ndash;45 minutes
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="mt-1 text-forest">&#10003;</span>
                    No special materials needed
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="mt-1 text-forest">&#10003;</span>
                    Printable PDF &mdash; instant download
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="mt-1 text-forest">&#10003;</span>
                    Works for one child or five
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="mt-1 text-forest">&#10003;</span>
                    Includes age adaptation notes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
            {product.description.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <TrustBadges />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl text-forest">
            What families are saying
          </h2>
          <TestimonialBlock testimonials={testimonials} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-4 font-display text-2xl text-forest">
            Frequently Asked Questions
          </h2>
          <FAQSection items={defaultFAQ} />
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-gold-light/10 py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-8 text-center font-display text-2xl text-forest">
              You might also like
            </h2>
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
