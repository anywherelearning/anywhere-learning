import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDownloadUrl } from "@vercel/blob";
import {
  getUserPurchases,
  getUserByClerkId,
  getBundleUpgrades,
} from "@/lib/db/queries";
import { formatPrice } from "@/lib/utils";
import DownloadList from "@/components/account/DownloadList";
import ExploreMoreDivider from "@/components/account/ExploreMoreDivider";
import PostPurchaseShare from "@/components/checkout/PostPurchaseShare";
import BundleUpgradeButton from "@/components/account/BundleUpgradeButton";
import { getOrCreateReferral } from "@/lib/referral";
import { coverClassFor } from "@/lib/categories";
import { ArrowRightIcon } from "@/components/shop/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Activity Guides",
  description:
    "Access and download your purchased activity guides. Start learning anywhere.",
  robots: { index: false, follow: false },
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// ── Page ──

export default async function DownloadsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Get email from Clerk to link pending webhook-created users
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  const purchases = await getUserPurchases(clerkId, email);

  // Get referral code for the share block
  let referralCode: string | undefined;
  try {
    const user = await getUserByClerkId(clerkId);
    if (user && email && purchases.length > 0) {
      const referral = await getOrCreateReferral(user.id, email).catch(() => null);
      if (referral) referralCode = referral.code;
    }
  } catch {
    // Ignore - share block just won't show the code
  }

  // Build amount-paid map for bundle upgrade credit.
  // Values come from orders.amountCents which is the REAL paid amount
  // (post-BYOB discount, post-promo code). Do not substitute SRP here.
  //
  // Edge case: when a bundle was purchased, each child guide is expanded into
  // its own Purchase row with the same parent order.amountCents (the whole
  // bundle price). Taking `max` per productId gives us the highest real
  // dollar credit a user has paid against any row tied to that product,
  // which is the safest "you've already paid $X toward this" signal for
  // the upgrade credit on bundle upgrades. Free-bonus rows (Skills Map with
  // amountCents=0) naturally lose the max comparison and contribute nothing.
  const purchasedProductIds = purchases.map((p) => p.product.id);
  const purchasedAmountByProduct: Record<string, number> = {};
  for (const p of purchases) {
    if (
      !purchasedAmountByProduct[p.product.id] ||
      p.order.amountCents > purchasedAmountByProduct[p.product.id]
    ) {
      purchasedAmountByProduct[p.product.id] = p.order.amountCents;
    }
  }

  // Bundle upgrade is the ONE retained upsell because it has ownership-based
  // signal (you already paid for part of this). Threshold 2+ owned children
  // filters out noisy 1-child matches.
  const bundleUpgrades = await getBundleUpgrades(
    purchasedProductIds,
    purchasedAmountByProduct,
  ).catch(() => []);
  const qualifyingUpgrades = bundleUpgrades.filter((u) => u.ownedCount >= 2);

  // Count non-bundle guides for the header + share gating.
  const guideCount = purchases.filter((p) => !p.product.isBundle).length;

  // Referral share is high-leverage but easy to feel premature. Show it unless
  // this is a brand-new single-purchase user who hasn't had time to use the
  // guide yet. Research: users share from pride/competence, not gratitude, so
  // we want to catch repeat visits, not first-touch.
  const earliestPurchaseAt = purchases.length > 0
    ? Math.min(...purchases.map((p) => new Date(p.order.purchasedAt).getTime()))
    : null;
  const daysSinceFirstPurchase = earliestPurchaseAt
    ? (Date.now() - earliestPurchaseAt) / (24 * 60 * 60 * 1000)
    : 0;
  const showReferralShare =
    purchases.length > 0 &&
    (purchases.length >= 2 || Date.now() - (earliestPurchaseAt ?? 0) >= THREE_DAYS_MS);
  // daysSinceFirstPurchase is retained for potential future messaging tweaks.
  void daysSinceFirstPurchase;

  // Preconnect to the Vercel Blob origin. This kicks off DNS + TCP + TLS
  // handshakes up front so the first Open Guide click skips ~100-300ms of
  // connection setup. DownloadCard also prefetches the PDF body on hover,
  // and together these make opens feel near-instant.
  const blobOrigin = purchases.find((p) => p.product.blobUrl)?.product.blobUrl
    ? new URL(purchases.find((p) => p.product.blobUrl)!.product.blobUrl).origin
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
      {blobOrigin && (
        <link rel="preconnect" href={blobOrigin} crossOrigin="" />
      )}
      {/* ── Page header ── */}
      <h1 className="font-display text-3xl text-forest sm:text-4xl">
        Your Activity Guides
      </h1>
      {/* Only render the subtitle when there's something to describe.
          For empty states, DownloadList renders its own richer empty state
          ("Your first adventure starts here") with a shop CTA, so we don't
          want two competing empty messages stacked. */}
      {guideCount > 0 && (
        <p className="mt-2 text-gray-600">
          {guideCount} activity guide{guideCount === 1 ? "" : "s"} ready to open. Use them year after year.
        </p>
      )}

      {/* ── Downloads list (the main event) ── */}
      <div className="mt-8">
        <DownloadList purchases={purchases.map(({ order, product }) => ({
          order,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            shortDescription: product.shortDescription,
            imageUrl: product.imageUrl,
            category: product.category,
            ageRange: product.ageRange,
            activityCount: product.activityCount,
            isBundle: product.isBundle,
            // Resolve direct Blob URLs server-side so clicks go straight to the
            // CDN edge, no serverless round-trip. Bundles have empty blobUrl.
            // Ownership is already enforced by this page requiring Clerk auth
            // and getUserPurchases filtering by userId, so only the owner ever
            // sees these URLs. They do go into the client HTML — accepted
            // tradeoff for instant Open Guide.
            viewUrl: product.blobUrl || "",
            downloadUrl: product.blobUrl ? getDownloadUrl(product.blobUrl) : "",
          },
        }))} />
      </div>

      {/* ── Everything below here is optional / explore-more ── */}
      {(qualifyingUpgrades.length > 0 || showReferralShare || purchases.length > 0) && (
        <ExploreMoreDivider />
      )}

      {/* ── Bundle upgrade suggestions (the ONE upsell) ── */}
      {qualifyingUpgrades.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-forest sm:text-3xl mb-1">
            Save on what you already have
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            You own some of these guides already. Upgrade to the full bundle
            and we&apos;ll credit what you&apos;ve paid.
          </p>
          <div className="space-y-3">
            {qualifyingUpgrades.slice(0, 2).map((upgrade) => (
              <div
                key={upgrade.bundle.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5"
              >
                {/* Mobile stacks the Upgrade button below the text; desktop puts
                    it inline on the right so the card stays compact at 1024px+. */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Bundle thumbnail */}
                    <div
                      className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl flex-shrink-0 overflow-hidden ${coverClassFor(upgrade.bundle.category) || "cover-bundle"}`}
                    >
                      {upgrade.bundle.imageUrl ? (
                        <Image
                          src={upgrade.bundle.imageUrl}
                          alt=""
                          width={80}
                          height={96}
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
                    stripePriceId={upgrade.bundle.stripePriceId}
                    slug={upgrade.bundle.slug}
                    upgradePrice={upgrade.upgradePrice}
                    amountAlreadyPaid={upgrade.amountAlreadyPaid}
                    bundleName={upgrade.bundle.name}
                    email={email}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Referral share (promoted to post-pride-moment) ── */}
      {showReferralShare && (
        <section className={qualifyingUpgrades.length > 0 ? "mt-12" : ""}>
          <div className="text-center">
            <h2 className="font-display text-2xl text-forest sm:text-3xl mb-1">
              Know a family who&apos;d love these?
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Share the love. Send them a link to browse.
            </p>
            <PostPurchaseShare referralCode={referralCode} />
          </div>
        </section>
      )}

      {/* ── Explore more footer ── */}
      {purchases.length > 0 && (
        <div className="mt-12 text-center pt-8 pb-4">
          <p className="text-gray-600 text-sm mb-2">
            Looking for something new?
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-forest font-medium text-sm hover:text-forest-dark transition-colors"
          >
            Browse all activity guides
            <ArrowRightIcon />
          </Link>
        </div>
      )}
    </div>
  );
}
