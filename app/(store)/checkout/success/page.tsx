import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { inArray, eq, and, ne, sql } from 'drizzle-orm';
import { getUserByClerkId, getBundleUpgrades } from '@/lib/db/queries';
import { getReferralByEmail } from '@/lib/referral';
import { formatPrice } from '@/lib/utils';
import { BUNDLE_CONTENTS, FREE_BONUS_SLUG } from '@/lib/cart';
import { CATEGORY_LABELS, coverClassFor } from '@/lib/categories';
import { CheckIcon, DownloadIcon, ArrowRightIcon } from '@/components/shop/icons';
import Confetti from '@/components/checkout/Confetti';
import PostPurchaseShare from '@/components/checkout/PostPurchaseShare';
import PinterestCheckoutEvent from '@/components/checkout/PinterestCheckoutEvent';
import BundleUpgradeButton from '@/components/account/BundleUpgradeButton';

// Force dynamic rendering. The Skills Map bonus check reads the buyer's
// order history, which must never be cached across users or visits.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "You're All Set!",
  description:
    'Your activity guides are ready to download. Open on any device and start learning today.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string; token?: string }>;
}

async function getSessionProducts(sessionId: string, token?: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price'],
    });

    if (session.payment_status !== 'paid') return null;

    // ── SECURITY: Verify the success token matches (prevents session ID guessing) ──
    const storedToken = session.metadata?.success_token;
    if (!storedToken || storedToken !== token) return null;

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
      // Clerk auth may not be configured - continue with token + time-window guard
    }

    // Try price-ID lookup first (standard purchases)
    const priceIds = session.line_items?.data
      ?.map((item) => item.price?.id)
      .filter(Boolean) as string[];

    let purchasedProducts = priceIds?.length
      ? await db
          .select()
          .from(products)
          .where(and(inArray(products.stripePriceId, priceIds), eq(products.active, true)))
      : [];

    // Fallback: BYOB purchases use ad-hoc price_data, so price IDs won't match.
    // Use the product_slugs metadata written at checkout time instead.
    if (purchasedProducts.length === 0 && session.metadata?.product_slugs) {
      const slugs = session.metadata.product_slugs.split(',').filter(Boolean);
      if (slugs.length > 0) {
        purchasedProducts = await db
          .select()
          .from(products)
          .where(and(inArray(products.slug, slugs), eq(products.active, true)));
      }
    }

    if (purchasedProducts.length === 0) return null;

    const amountTotalCents = session.amount_total ?? 0;
    const currency = (session.currency ?? 'usd').toUpperCase();
    const buyerEmail = session.customer_details?.email ?? null;

    // Check if a bundle was purchased (triggers free Skills Map bonus)
    const hasBundles = purchasedProducts.some((p) => p.isBundle);

    // ── Bundle upgrade credits ───────────────────────────────────────
    // Build the same purchasedAmountByProduct map the downloads page uses,
    // seeded from (a) this session's proportional per-product amounts and
    // (b) any prior orders the buyer already has. The downloads page reads
    // orders.amountCents directly. Here we must mirror the webhook's
    // proportional distribution because the webhook may not have run yet.
    // See the pricing invariant in app/api/webhooks/stripe/route.ts; all
    // three sites (webhook, checkout, and this page) must stay in sync.
    const purchasedAmountByProduct: Record<string, number> = {};
    const purchasedProductIdSet = new Set<string>();

    const totalSRPCents = purchasedProducts.reduce((sum, p) => sum + p.priceCents, 0);
    purchasedProducts.forEach((p, i) => {
      purchasedProductIdSet.add(p.id);
      if (totalSRPCents === 0 || amountTotalCents === 0) return;
      const isLast = i === purchasedProducts.length - 1;
      const priorSum = purchasedProducts.slice(0, i).reduce(
        (sum, prod) => sum + Math.round((prod.priceCents / totalSRPCents) * amountTotalCents),
        0,
      );
      const proportionalAmount = isLast
        ? amountTotalCents - priorSum
        : Math.round((p.priceCents / totalSRPCents) * amountTotalCents);
      const existing = purchasedAmountByProduct[p.id] || 0;
      if (proportionalAmount > existing) {
        purchasedAmountByProduct[p.id] = proportionalAmount;
      }
    });

    // Expand any bundles in this session to their child product IDs so the
    // upgrade suggestion counts sub-bundle children as owned even before the
    // webhook writes $0 child orders. The bundle itself also stays in the
    // set so getBundleUpgrades credits its paid amount via sub-bundle overlap.
    for (const bundle of purchasedProducts.filter((p) => p.isBundle)) {
      const childSlugs = BUNDLE_CONTENTS[bundle.slug] || [];
      if (childSlugs.length === 0) continue;
      const childProducts = await db
        .select({ id: products.id })
        .from(products)
        .where(inArray(products.slug, childSlugs));
      for (const cp of childProducts) {
        purchasedProductIdSet.add(cp.id);
      }
    }

    // Merge in prior orders by email (past individual purchases, already-
    // expanded prior bundles, prior BYOB discounts). Case-insensitive match
    // since Stripe lowercases customer emails but Clerk can write mixed case.
    if (buyerEmail) {
      try {
        const priorOrders = await db
          .select({
            productId: orders.productId,
            amountCents: orders.amountCents,
          })
          .from(orders)
          .innerJoin(users, eq(orders.userId, users.id))
          .where(
            and(
              sql`lower(${users.email}) = lower(${buyerEmail})`,
              inArray(orders.status, ['completed', 'partially_refunded']),
            ),
          );
        for (const o of priorOrders) {
          purchasedProductIdSet.add(o.productId);
          const existing = purchasedAmountByProduct[o.productId] || 0;
          if (o.amountCents > existing) {
            purchasedAmountByProduct[o.productId] = o.amountCents;
          }
        }
      } catch (err) {
        console.error('Prior orders lookup for bundle upgrades failed:', err);
      }
    }

    const bundleUpgradeCandidates = await getBundleUpgrades(
      Array.from(purchasedProductIdSet),
      purchasedAmountByProduct,
    ).catch(() => []);
    // Match the downloads page: 2+ owned children filters out noisy 1-child
    // matches and keeps the pitch ("Save on what you already have") honest.
    const bundleUpgrades = bundleUpgradeCandidates
      .filter((u) => u.ownedCount >= 2)
      .slice(0, 2);

    // Look up buyer's referral code (may not exist yet if webhook hasn't fired)
    let referralCode: string | undefined;
    if (buyerEmail) {
      try {
        const referral = await getReferralByEmail(buyerEmail);
        if (referral) referralCode = referral.code;
      } catch {
        // Referral lookup is non-critical
      }
    }

    // If the buyer already owned the Skills Map BEFORE this session
    // (from a prior bundle or an individual purchase), suppress the
    // "bonus" banner so we don't re-announce something they already have.
    //
    // We JOIN orders → users and match the email case-insensitively to
    // catch two real edge cases:
    //   1. Duplicate user rows: a guest checkout creates a `pending_…`
    //      users row, then a later Clerk signup may create a second row
    //      with the same email. A prior Skills Map order might be on
    //      either row, so we can't pre-select a single user id.
    //   2. Email case drift: Stripe lowercases `customer_details.email`
    //      but the users table can contain mixed case from Clerk.
    //
    // We exclude the current stripeSessionId so a fresh webhook-granted
    // bonus from THIS purchase still counts as "new".
    let alreadyOwnsBonus = false;
    if (hasBundles && buyerEmail) {
      try {
        const bonusProduct = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.slug, FREE_BONUS_SLUG))
          .limit(1);

        if (bonusProduct.length > 0) {
          const priorOrders = await db
            .select({ id: orders.id })
            .from(orders)
            .innerJoin(users, eq(orders.userId, users.id))
            .where(
              and(
                sql`lower(${users.email}) = lower(${buyerEmail})`,
                eq(orders.productId, bonusProduct[0].id),
                ne(orders.stripeSessionId, sessionId),
                inArray(orders.status, ['completed', 'partially_refunded']),
              ),
            )
            .limit(1);
          alreadyOwnsBonus = priorOrders.length > 0;
        }
      } catch (err) {
        // Non-critical. Log and fall back to showing the banner on error.
        console.error('Skills Map prior-ownership check failed:', err);
      }
    }

    // Only mention the bonus on the confirmation if it's actually new to them.
    const showBonusBanner = hasBundles && !alreadyOwnsBonus;

    return {
      products: purchasedProducts,
      bundleUpgrades,
      showBonusBanner,
      referralCode,
      orderId: sessionId,
      amountTotalCents,
      currency,
      buyerEmail,
    };
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id, token } = await searchParams;

  // Redirect to shop if no valid session (prevents celebration UI without a purchase)
  if (!session_id) redirect('/shop');

  const data = await getSessionProducts(session_id, token);
  if (!data) redirect('/shop');

  const purchasedProducts = data.products;
  const bundleUpgrades = data.bundleUpgrades;
  const showBonusBanner = data.showBonusBanner;
  const referralCode = data.referralCode;

  // Pinterest Tag conversion event payload
  const pinterestLineItems = purchasedProducts.map((p) => ({
    product_id: p.slug,
    product_name: p.name,
    product_category: p.category,
    product_price: p.priceCents / 100,
    product_quantity: 1,
  }));

  // Check if user is signed in (for account creation nudge)
  let isSignedIn = false;
  try {
    const { userId } = await auth();
    isSignedIn = !!userId;
  } catch {
    // Clerk may not be configured
  }

  return (
    <>
      <Confetti />
      <PinterestCheckoutEvent
        orderId={data.orderId}
        value={data.amountTotalCents / 100}
        currency={data.currency}
        lineItems={pinterestLineItems}
        buyerEmail={data.buyerEmail}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        {/* ── Celebration Header ── */}
        <div className="text-center hero-stagger">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest/10 mb-6">
            <CheckIcon className="w-8 h-8 text-forest" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-forest">
            You&apos;re all set!
          </h1>

          {purchasedProducts.length > 0 ? (
            <p className="mt-3 text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
              Your{' '}
              {purchasedProducts.length === 1
                ? purchasedProducts[0].name
                : `${purchasedProducts.length} activity guides`}{' '}
              {purchasedProducts.length === 1 ? 'is' : 'are'} ready. Open on
              any device and try an activity today.
            </p>
          ) : (
            <p className="mt-3 text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
              Your activity guides are ready to download. Open on any device and
              start whenever you&apos;re ready.
            </p>
          )}

          {isSignedIn ? (
            <Link
              href="/account/downloads"
              className="inline-flex items-center gap-2 mt-6 bg-forest hover:bg-forest-dark text-cream font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              <DownloadIcon className="w-5 h-5" />
              Go to My Downloads
            </Link>
          ) : (
            <div className="mt-6 space-y-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-cream font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
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
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                Create your account to access downloads
              </Link>
              <p className="text-sm text-gray-400">
                Use the same email you checked out with and your purchases will be linked automatically.
              </p>
            </div>
          )}
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
                    className={`w-14 h-20 rounded-xl flex-shrink-0 overflow-hidden ${coverClassFor(product.category)}`}
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
                        {product.isBundle ? 'BUNDLE' : 'GUIDE'}
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
        {showBonusBanner && (
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
                  A $9.99 parent guide - included free with your bundle. Find it in your downloads.
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
                Phone, tablet, or laptop - no printing needed.
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
                No order required - start wherever sounds fun.
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
                Save on what you already have
              </h2>
              <p className="text-sm text-gray-500">
                Upgrade to the full bundle and we&apos;ll credit what you&apos;ve
                paid.
              </p>
            </div>
            <div className="space-y-3">
              {bundleUpgrades.map((upgrade) => (
                <div
                  key={upgrade.bundle.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5"
                >
                  {/* Mobile stacks the Upgrade button below the text; desktop
                      keeps it inline on the right. */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className={`w-14 h-20 rounded-xl flex-shrink-0 overflow-hidden ${coverClassFor(upgrade.bundle.category) || 'cover-bundle'}`}
                      >
                        {upgrade.bundle.imageUrl ? (
                          <Image
                            src={upgrade.bundle.imageUrl}
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
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {upgrade.bundle.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          You already have {upgrade.ownedCount} of {upgrade.totalCount}. Grab the rest with the bundle.
                        </p>
                        {upgrade.amountAlreadyPaid > 0 && (
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(upgrade.bundle.priceCents)}
                            </span>
                            <span className="text-xs bg-gold/15 text-gold-dark px-2 py-0.5 rounded-full font-medium">
                              You save {formatPrice(upgrade.amountAlreadyPaid)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <BundleUpgradeButton
                      stripePriceId={upgrade.bundle.stripePriceId!}
                      slug={upgrade.bundle.slug}
                      upgradePrice={upgrade.upgradePrice}
                      amountAlreadyPaid={upgrade.amountAlreadyPaid}
                      bundleName={upgrade.bundle.name}
                      email={data.buyerEmail ?? undefined}
                      className="w-full sm:w-auto"
                    />
                  </div>
                </div>
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
              Share the love. They&apos;ll thank you later.
            </p>
            <PostPurchaseShare referralCode={referralCode} />
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
            Browse all activity guides
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </>
  );
}
