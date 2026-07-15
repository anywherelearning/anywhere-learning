import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getFallbackProducts } from '@/lib/fallback-products';
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR, MONTHLY_PLAN_PRICE_MONTH } from '@/lib/membership';
import { planForPriceId } from '@/lib/stripe-prices';
import PdfViewer from '@/components/account/PdfViewer';

export const metadata: Metadata = {
  title: 'Activity Guide',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const SKILLS_MAP_TITLES: Record<string, string> = {
  'skills-map-color': 'The Future-Ready Skills Map (Color)',
  'skills-map-bw': 'The Future-Ready Skills Map (Black & White)',
};

/**
 * In-app PDF viewer. Trial members read guides here (the browser's native
 * PDF viewer has its own download button, i.e. a download, and trials are
 * view-only). Members can land here too via shared links; they get the same
 * reader with a working download button.
 */
export default async function ActivityViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Resolve identity first, OUTSIDE the try. redirect() works by throwing
  // NEXT_REDIRECT; if it were inside the try, the catch would swallow the
  // sign-in redirect and the user would wrongly fall through to /join.
  let userId: string | null = null;
  try {
    const { auth } = await import('@clerk/nextjs/server');
    userId = (await auth()).userId;
  } catch {
    /* Clerk not configured — treated as signed-out below */
  }
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/account/view/${slug}`)}`);

  // Resolve tier from the DB. A failure here means no access (guest), which
  // bounces to /join below — never an open viewer.
  let tier: 'member' | 'trial' | 'guest' = 'guest';
  let trialEndsAt: string | null = null;
  let isMonthlyPlan = false;
  try {
    const { getAccessContextForClerkId } = await import('@/lib/access');
    const access = await getAccessContextForClerkId(userId);
    tier = access.tier;
    trialEndsAt = access.trialEndsAt?.toISOString() ?? null;
    isMonthlyPlan = planForPriceId(access.stripePriceId) === 'monthly';
  } catch {
    /* fall through to the guest redirect below */
  }

  if (tier === 'guest') redirect('/join?from=viewer&reason=membership-required');

  const product = getFallbackProducts().find((p) => p.slug === slug);
  const title = product?.name || SKILLS_MAP_TITLES[slug] || 'Activity Guide';

  return (
    <PdfViewer
      slug={slug}
      title={title}
      tier={tier}
      trialEndsAt={trialEndsAt}
      priceLabel={isMonthlyPlan ? MONTHLY_PLAN_PRICE_MONTH : MEMBERSHIP_PRICE_YEAR}
      isFounder={isMonthlyPlan ? false : IS_FOUNDER_PHASE}
    />
  );
}
