import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { inArray, eq, and } from 'drizzle-orm';
import { getUserByClerkId } from '@/lib/db/queries';
import { formatPrice } from '@/lib/utils';
import Confetti from '@/components/checkout/Confetti';
import PostPurchaseShare from '@/components/checkout/PostPurchaseShare';

export const metadata: Metadata = {
  title: "You're All Set!",
  description:
    'Your activity packs are ready to download. Open on any device and start learning today.',
  robots: { index: false, follow: false },
};

const CATEGORY_LABELS: Record<string, string> = {
  'ai-literacy': 'AI & Digital',
  'creativity-anywhere': 'Creativity Anywhere',
  'communication-writing': 'Communication & Writing',
  'outdoor-learning': 'Outdoor Learning',
  'real-world-math': 'Real-World Math',
  'entrepreneurship': 'Entrepreneurship',
  'planning-problem-solving': 'Planning & Problem-Solving',
  'start-here': 'Start Here',
  bundle: 'Bundle',
};

const coverClasses: Record<string, string> = {
  'ai-literacy': 'cover-ai-literacy',
  'creativity-anywhere': 'cover-creativity-anywhere',
  'communication-writing': 'cover-communication-writing',
  'outdoor-learning': 'cover-outdoor-learning',
  'real-world-math': 'cover-real-world-math',
  'entrepreneurship': 'cover-entrepreneurship',
  'planning-problem-solving': 'cover-planning-problem-solving',
  'start-here': 'cover-start-here',
  bundle: 'cover-bundle',
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function getSessionProducts(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price'],
    });

    if (session.payment_status !== 'paid') return null;

    // ── SECURITY: Only show details for sessions created within the last hour ──
    const ONE_HOUR = 60 * 60;
    if (session.created < Math.floor(Date.now() / 1000) - ONE_HOUR) return null;

    // ── SECURITY: If the user is logged in, verify they own this session ──
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const user = await getUserByClerkId(clerkId);
        if (user?.email && session.customer_details?.email !== user.email) {
          return null;
        }
      }
    } catch {
      // Clerk auth may not be configured — continue with time-window guard only
    }

    const priceIds = session.line_items?.data
      ?.map((item) => item.price?.id)
      .filter(Boolean) as string[];

    if (!priceIds || priceIds.length === 0) return null;

    const purchasedProducts = await db
      .select()
      .from(products)
      .where(and(inArray(products.stripePriceId, priceIds), eq(products.active, true)));

    // Find bundles that could be upgrades (user bought individual packs)
    const isIndividualPurchase = purchasedProducts.some((p) => !p.isBundle);
    let bundleUpgrades: typeof purchasedProducts = [];

    if (isIndividualPurchase) {
      const purchasedIds = purchasedProducts.map((p) => p.id);
      const allBundles = await db
        .select()
        .from(products)
        .where(and(eq(products.active, true), eq(products.isBundle, true)));

      bundleUpgrades = allBundles.filter((bundle) => {
        if (!bundle.bundleProductIds) return false;
        try {
          const childIds = JSON.parse(bundle.bundleProductIds) as string[];
          // Show bundle if it contains any of the purchased products
          const overlap = childIds.filter((id) => purchasedIds.includes(id));
          return overlap.length > 0 && overlap.length < childIds.length;
        } catch {
          return false;
        }
      });
    }

    // Check if a bundle was purchased (triggers free Skills Map bonus)
    const hasBundles = purchasedProducts.some((p) => p.isBundle);

    return {
      products: purchasedProducts,
      bundleUpgrades: bundleUpgrades.slice(0, 2),
      hasBundles,
    };
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  const data = session_id ? await getSessionProducts(session_id) : null;
  const purchasedProducts = data?.products || [];
  const bundleUpgrades = data?.bundleUpgrades || [];
  const hasBundles = data?.hasBundles || false;

  return (
    <>
      <Confetti />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        {/* ── Celebration Header ── */}
        <div className="text-center hero-stagger">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest/10 mb-6">
            <svg
              className="w-8 h-8 text-forest"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-forest">
            You&apos;re all set!
          </h1>

          {purchasedProducts.length > 0 ? (
            <p className="mt-3 text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
              Your{' '}
              {purchasedProducts.length === 1
                ? purchasedProducts[0].name
                : `${purchasedProducts.length} activity packs`}{' '}
              {purchasedProducts.length === 1 ? 'is' : 'are'} ready — open on
              any device and try an activity today.
            </p>
          ) : (
            <p className="mt-3 text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
              Your activity packs are ready to download. Open on any device and
              start whenever you&apos;re ready.
            </p>
          )}

          <Link
            href="/account/downloads"
            className="inline-flex items-center gap-2 mt-6 bg-forest hover:bg-forest-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Go to My Downloads
          </Link>
        </div>

        {/* ── What You Got ── */}
        {purchasedProducts.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl text-forest mb-4 text-center">
              What You Got
            </h2>
            <div
              className={`grid gap-3 ${purchasedProducts.length === 1 ? 'max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}
            >
              {purchasedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 animate-fade-in-up"
                >
                  <div
                    className={`w-14 h-18 rounded-xl flex-shrink-0 overflow-hidden ${coverClasses[product.category] || 'cover-outdoor-learning'}`}
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt=""
                        width={56}
                        height={72}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-cream/80 text-xs font-bold">
                        {product.isBundle ? 'BUNDLE' : 'PACK'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-forest/8 text-forest px-2 py-0.5 rounded-full font-medium">
                        {CATEGORY_LABELS[product.category] || product.category}
                      </span>
                      {product.activityCount && (
                        <span className="text-xs text-gray-400">
                          {product.activityCount} activities
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Skills Map Bonus ── */}
        {hasBundles && (
          <section className="mt-10">
            <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 sm:p-6 flex items-center gap-4 animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Bonus: The Future-Ready Skills Map
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  A $9.99 parent guide — included free with your bundle. Find it in your downloads.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Quick Tips ── */}
        <section className="mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-5 rounded-2xl bg-forest/4">
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-forest"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Open on any device
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Phone, tablet, or laptop — no printing needed.
              </p>
            </div>

            <div className="text-center p-5 rounded-2xl bg-gold/8">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-gold-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Pick any activity
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No order required — start wherever sounds fun.
              </p>
            </div>

            <div className="text-center p-5 rounded-2xl bg-forest/4">
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-forest"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Do it together
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Designed for meaningful parent + kid time.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bundle Upgrade Upsell ── */}
        {bundleUpgrades.length > 0 && (
          <section className="mt-14 pt-8 border-t border-gray-100">
            <div className="text-center mb-5">
              <h2 className="font-display text-xl text-forest mb-1">
                Complete Your Collection
              </h2>
              <p className="text-sm text-gray-500">
                Get every activity in the bundle and save.
              </p>
            </div>
            <div className="space-y-3">
              {bundleUpgrades.map((bundle) => (
                <Link
                  key={bundle.id}
                  href={`/shop/${bundle.slug}`}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 group hover:shadow-md hover:border-forest/15 transition-all"
                >
                  <div
                    className={`w-14 h-18 rounded-xl flex-shrink-0 overflow-hidden ${coverClasses[bundle.category] || 'cover-bundle'}`}
                  >
                    {bundle.imageUrl ? (
                      <Image
                        src={bundle.imageUrl}
                        alt=""
                        width={56}
                        height={72}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-cream/80 text-xs font-bold">
                        BUNDLE
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-forest transition-colors">
                      {bundle.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {bundle.activityCount
                        ? `${bundle.activityCount} activities included`
                        : 'Every pack in one bundle'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {bundle.compareAtPriceCents && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(bundle.compareAtPriceCents)}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-forest">
                        {formatPrice(bundle.priceCents)}
                      </span>
                      {bundle.compareAtPriceCents && (
                        <span className="text-xs bg-gold/15 text-gold-dark px-2 py-0.5 rounded-full font-medium">
                          Save{' '}
                          {formatPrice(
                            bundle.compareAtPriceCents - bundle.priceCents
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-300 group-hover:text-forest group-hover:translate-x-0.5 transition-all flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Share With a Friend ── */}
        <section className="mt-14 pt-8 border-t border-gray-100">
          <div className="text-center">
            <h2 className="font-display text-xl text-forest mb-1">
              Know a family who&apos;d love this?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Share the love — they&apos;ll thank you later.
            </p>
            <PostPurchaseShare />
          </div>
        </section>

        {/* ── Browse more ── */}
        <div className="mt-14 text-center pt-8 border-t border-gray-100 pb-4">
          <p className="text-gray-400 text-sm mb-2">
            Want to explore more?
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-forest font-medium text-sm hover:text-forest-dark transition-colors"
          >
            Browse all activity packs
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
