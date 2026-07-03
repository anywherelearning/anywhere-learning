import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getFallbackProducts } from '@/lib/fallback-products';
import { CATEGORY_LABELS } from '@/lib/categories';
import { IS_FOUNDER_PHASE } from '@/lib/membership';
import AccountDashboard, { type DashboardActivity } from './AccountDashboard';

export const metadata: Metadata = {
  title: 'Your Library',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Per-category accent colors (mirrors shop page TRACKS map).
const TRACK_COLORS: Record<string, { color: string; deep: string }> = {
  'real-world-math': { color: '#588157', deep: '#3A5A40' },
  entrepreneurship: { color: '#C97B5C', deep: '#7A3D24' },
  'ai-literacy': { color: '#B6913F', deep: '#7A5E1F' },
  'communication-writing': { color: '#3A5A40', deep: '#26331F' },
  'planning-problem-solving': { color: '#588157', deep: '#3A5A40' },
  'creativity-maker': { color: '#C97B5C', deep: '#7A3D24' },
  'outdoor-learning': { color: '#3A5A40', deep: '#26331F' },
  worldschooling: { color: '#8A8470', deep: '#5A5240' },
  'emotional-social-skills': { color: '#B6748A', deep: '#7A4858' },
};

// Two "virtual" Skills Map entries — pinned to the top of the dashboard for
// both tiers. They are not real Product rows in the DB, so we synthesize them
// here and concat onto the activity list before passing into the dashboard.
const SKILLS_MAP_ENTRIES: DashboardActivity[] = [
  {
    slug: 'skills-map-color',
    title: 'The Future-Ready Skills Map (Color)',
    excerpt:
      'A parent guide mapping the essential skills your kids actually need, by age, with milestones and how each activity fits.',
    category: 'parent-guide',
    categoryLabel: 'Parent Guide',
    trackColor: '#B6913F',
    trackDeep: '#7A5E1F',
    ageRange: 'Parents',
    imageUrl: '/skills-map-color-cover.jpg',
  },
  {
    slug: 'skills-map-bw',
    title: 'The Future-Ready Skills Map (Black & White)',
    excerpt: 'Print-friendly black-and-white version of the Skills Map for offline reading.',
    category: 'parent-guide',
    categoryLabel: 'Parent Guide',
    trackColor: '#7B8378',
    trackDeep: '#4F5A50',
    ageRange: 'Parents',
    imageUrl: '/skills-map-bw-cover.jpg',
  },
];

// ─── TIER DETECTION ──────────────────────────────────────────
// Until Stripe + Clerk are fully wired, we read tier from a cookie / query
// param so both views are testable. Visit /account?tier=trial to preview the
// free-trial view, or ?tier=member for the full library.
interface TierState {
  tier: 'member' | 'trial' | 'guest';
  /** Trial-only: when the trial converts to a paid membership. */
  trialEndsAt: Date | null;
}

async function detectTier(searchParams: { tier?: string }): Promise<TierState> {
  // Dev/preview override (NEVER in production — otherwise anyone could append
  // ?tier=member and load the library shell without a subscription). The
  // content endpoints (/api/view, /api/download) always gate on real access,
  // so this only ever affected the dashboard UI, but it has no business
  // running in prod regardless.
  if (process.env.NODE_ENV !== 'production') {
    if (searchParams.tier === 'member') return { tier: 'member', trialEndsAt: null };
    if (searchParams.tier === 'guest') return { tier: 'guest', trialEndsAt: null };
    if (searchParams.tier === 'trial') {
      return { tier: 'trial', trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) };
    }
  }

  // Real lookup: Clerk → DB
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { getAccessContextForClerkId } = await import('@/lib/access');
    const { userId } = await auth();
    if (userId) {
      const access = await getAccessContextForClerkId(userId);
      return { tier: access.tier, trialEndsAt: access.trialEndsAt };
    }
  } catch {
    /* Clerk or DB not configured */
  }

  return { tier: 'guest', trialEndsAt: null };
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; name?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const { tier, trialEndsAt } = await detectTier(sp);

  // Guest = no active membership. The library dashboard has nothing useful to
  // show them. Bounce to /join with a contextual banner so they know why they
  // landed there.
  if (tier === 'guest') {
    redirect('/join?from=account&reason=no-access');
  }

  // Pull the signed-in user's first name from Clerk. Fall back to the ?name
  // query param (used by the sandbox tier preview) or 'Member' if neither.
  let userName = sp.name?.trim() || '';
  if (!userName) {
    try {
      const { currentUser } = await import('@clerk/nextjs/server');
      const u = await currentUser();
      userName =
        u?.firstName?.trim() ||
        u?.fullName?.trim().split(/\s+/)[0] ||
        u?.username?.trim() ||
        '';
    } catch {
      /* Clerk not configured */
    }
  }
  if (!userName) userName = 'Member';

  const allProducts = getFallbackProducts().filter(
    (p) => p.category !== 'bundle' && p.category !== 'start-here',
  );

  // Members and trial members see the whole library. The trial is gated at
  // download time (view-only), not at browsing time.
  const tierActivities = allProducts;

  const activities: DashboardActivity[] = [
    // Skills Map versions pinned at the top
    ...SKILLS_MAP_ENTRIES,
    // Then the tier-appropriate activity list
    ...tierActivities.map((p) => {
      const theme = TRACK_COLORS[p.category] || TRACK_COLORS['real-world-math'];
      return {
        slug: p.slug,
        title: p.name,
        excerpt: p.shortDescription,
        category: p.category,
        categoryLabel: CATEGORY_LABELS[p.category] || p.category,
        trackColor: theme.color,
        trackDeep: theme.deep,
        ageRange: p.ageRange || 'Ages 6–14',
        imageUrl: p.imageUrl ?? null,
      };
    }),
  ];

  return (
    <AccountDashboard
      userName={userName}
      tier={tier}
      activities={activities}
      trial={
        tier === 'trial'
          ? { endsAt: (trialEndsAt ?? new Date()).toISOString(), isFounder: IS_FOUNDER_PHASE }
          : null
      }
      // A direct download URL bounces a trial member here with this reason;
      // open the upgrade-to-download modal instead of leaving them wondering.
      initialCapModal={tier === 'trial' && sp.reason === 'trial-upgrade-to-download'}
    />
  );
}
