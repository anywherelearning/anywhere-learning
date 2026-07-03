import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDownloadUrl } from "@vercel/blob";
import {
  getUserPurchases,
  getUserByClerkId,
} from "@/lib/db/queries";
import DownloadList from "@/components/account/DownloadList";
import ExploreMoreDivider from "@/components/account/ExploreMoreDivider";
import PostPurchaseShare from "@/components/checkout/PostPurchaseShare";
import { getOrCreateReferral } from "@/lib/referral";
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
      {(showReferralShare || purchases.length > 0) && (
        <ExploreMoreDivider />
      )}

      {/* ── Referral share (promoted to post-pride-moment) ── */}
      {showReferralShare && (
        <section>
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
