import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getUserPurchases,
  getUserByClerkId,
  hasActiveMembership,
  getBundleUpgrades,
  getSeasonalSuggestion,
  getCrossSellProducts,
  getNewProducts,
} from "@/lib/db/queries";
import { formatPrice } from "@/lib/utils";
import DownloadList from "@/components/account/DownloadList";
import PostPurchaseShare from "@/components/checkout/PostPurchaseShare";
import BundleUpgradeButton from "@/components/account/BundleUpgradeButton";
import { getOrCreateReferral } from "@/lib/referral";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Downloads",
  description:
    "Access and download your purchased activity packs. Start learning anywhere.",
  robots: { index: false, follow: false },
};

// ── Category labels (shared) ──
import { CATEGORY_LABELS } from "@/lib/categories";

const coverClasses: Record<string, string> = {
  "ai-literacy": "cover-ai-literacy",
  "creativity-anywhere": "cover-creativity-anywhere",
  "communication-writing": "cover-communication-writing",
  "outdoor-learning": "cover-outdoor-learning",
  "real-world-math": "cover-real-world-math",
  "entrepreneurship": "cover-entrepreneurship",
  "planning-problem-solving": "cover-planning-problem-solving",
  "start-here": "cover-start-here",
  bundle: "cover-bundle",
};

const SEASON_LABELS: Record<string, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

// ── Page ──

export default async function DownloadsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Get email from Clerk to link pending webhook-created users
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  const purchases = await getUserPurchases(clerkId, email);

  // Check membership for banner + get referral code
  let isMember = false;
  let referralCode: string | undefined;
  try {
    const user = await getUserByClerkId(clerkId);
    if (user) {
      isMember = await hasActiveMembership(user.id);
      if (email && purchases.length > 0) {
        const referral = await getOrCreateReferral(user.id, email).catch(() => null);
        if (referral) referralCode = referral.code;
      }
    }
  } catch {
    // Ignore - banner just won't show
  }

  // Derive data for growth sections
  const purchasedProductIds = purchases.map((p) => p.product.id);
  const purchasedCategories = [
    ...new Set(purchases.map((p) => p.product.category)),
  ];

  // Build a map of productId → amount paid (for bundle upgrade pricing)
  const purchasedAmountByProduct: Record<string, number> = {};
  for (const p of purchases) {
    // Use the higher of what they paid or $0 (free bundle expansions)
    if (
      !purchasedAmountByProduct[p.product.id] ||
      p.order.amountCents > purchasedAmountByProduct[p.product.id]
    ) {
      purchasedAmountByProduct[p.product.id] = p.order.amountCents;
    }
  }

  // Fetch growth data in parallel
  const [bundleUpgrades, seasonalSuggestion, crossSellProducts, newProducts] =
    await Promise.all([
      getBundleUpgrades(purchasedProductIds, purchasedAmountByProduct).catch(
        () => [],
      ),
      getSeasonalSuggestion(purchasedProductIds).catch(() => null),
      getCrossSellProducts(purchasedProductIds, purchasedCategories).catch(
        () => [],
      ),
      getNewProducts(purchasedProductIds).catch(() => []),
    ]);

  const packCount = purchases.length;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Member banner ── */}
      {isMember && (
        <Link
          href="/account/library"
          className="flex items-center justify-between bg-forest/5 border border-forest/15 rounded-2xl p-4 mb-8 group hover:bg-forest/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-forest rounded-full animate-pulse" />
            <span className="text-sm font-medium text-forest">
              Active Member - Open your full library
            </span>
          </div>
          <svg
            className="w-4 h-4 text-forest/50 group-hover:translate-x-0.5 transition-transform"
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
      )}

      {/* ── Page header ── */}
      <h1 className="font-display text-3xl text-forest sm:text-4xl">
        Your Activity Packs
      </h1>
      <p className="mt-2 text-gray-500">
        {packCount > 0
          ? `${packCount} activity pack${packCount === 1 ? "" : "s"} ready to open.`
          : "Your activity packs will appear here after purchase."}
      </p>

      {/* ── Seasonal suggestion ── */}
      {seasonalSuggestion && purchases.length > 0 && (
        <Link
          href={`/shop/${seasonalSuggestion.product.slug}`}
          className="flex items-center gap-4 bg-gold/8 border border-gold/20 rounded-2xl p-4 mt-6 group hover:bg-gold/12 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
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
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">
              {SEASON_LABELS[seasonalSuggestion.season]} is here. Ready for
              new outdoor activities?
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {seasonalSuggestion.product.name} &middot;{" "}
              {formatPrice(seasonalSuggestion.product.priceCents)}
            </p>
          </div>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
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
      )}

      {/* ── Downloads list ── */}
      <div className="mt-8">
        <DownloadList purchases={purchases} />
      </div>

      {/* ── Bundle upgrade suggestions ── */}
      {bundleUpgrades.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="font-display text-xl text-forest mb-1">
            Complete Your Collection
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            You already have some of these - upgrade to the full bundle and
            we&apos;ll credit what you&apos;ve already paid.
          </p>
          <div className="space-y-3">
            {bundleUpgrades.slice(0, 2).map((upgrade) => (
              <div
                key={upgrade.bundle.id}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 sm:p-5"
              >
                {/* Bundle thumbnail */}
                <div
                  className={`w-14 h-18 rounded-xl flex-shrink-0 overflow-hidden ${coverClasses[upgrade.bundle.category] || "cover-bundle"}`}
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
                  <p className="text-sm text-gray-500 mt-0.5">
                    You own {upgrade.ownedCount} of {upgrade.totalCount} packs
                  </p>
                  {upgrade.amountAlreadyPaid > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(upgrade.bundle.priceCents)}
                      </span>
                      <span className="text-xs bg-gold/15 text-gold-dark px-2 py-0.5 rounded-full font-medium">
                        You save {formatPrice(upgrade.amountAlreadyPaid)}
                      </span>
                    </div>
                  )}
                </div>

                <BundleUpgradeButton
                  stripePriceId={upgrade.bundle.stripePriceId}
                  slug={upgrade.bundle.slug}
                  upgradePrice={upgrade.upgradePrice}
                  amountAlreadyPaid={upgrade.amountAlreadyPaid}
                  bundleName={upgrade.bundle.name}
                  email={email}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Cross-sell: You might also like ── */}
      {crossSellProducts.length > 0 && purchases.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="font-display text-xl text-forest mb-1">
            You Might Also Like
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Families who got{" "}
            {CATEGORY_LABELS[purchasedCategories[0]] || purchasedCategories[0]}{" "}
            packs also loved these.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {crossSellProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-forest/15 transition-all"
              >
                <div
                  className={`aspect-[4/3] overflow-hidden ${coverClasses[product.category] || "cover-outdoor-learning"}`}
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-cream/60 text-sm font-bold tracking-wider">
                        {CATEGORY_LABELS[product.category] || product.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-forest transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-forest">
                      {formatPrice(product.priceCents)}
                    </span>
                    <span className="text-xs text-forest font-medium group-hover:translate-x-0.5 transition-transform">
                      View &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── New this month ── */}
      {newProducts.length > 0 && purchases.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="font-display text-xl text-forest mb-1">
            New This Month
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Fresh packs just added to the shop.
          </p>
          <div className="space-y-3">
            {newProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 group hover:shadow-md hover:border-forest/15 transition-all"
              >
                <div
                  className={`w-12 h-15 rounded-lg flex-shrink-0 overflow-hidden ${coverClasses[product.category] || "cover-outdoor-learning"}`}
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt=""
                      width={48}
                      height={60}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="flex items-center justify-center h-full text-cream/70 text-[10px] font-bold">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-forest transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {product.shortDescription}
                  </p>
                </div>
                <span className="text-sm font-semibold text-forest flex-shrink-0">
                  {formatPrice(product.priceCents)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Share section ── */}
      {purchases.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-100">
          <div className="text-center">
            <h2 className="font-display text-xl text-forest mb-1">
              Know a family who&apos;d love these?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Share the love - send them a link to browse.
            </p>
            <PostPurchaseShare referralCode={referralCode} />
          </div>
        </section>
      )}

      {/* ── Explore more footer ── */}
      {purchases.length > 0 && (
        <div className="mt-12 text-center border-t border-gray-100 pt-8 pb-4">
          <p className="text-gray-400 text-sm mb-2">
            Looking for something new?
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
      )}
    </div>
  );
}
