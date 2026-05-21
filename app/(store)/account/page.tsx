import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getFallbackProducts } from '@/lib/fallback-products';
import { CATEGORY_LABELS } from '@/lib/categories';
import { STARTER_PACK_SLUGS } from '@/lib/membership';
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
// param so both views are testable. Visit /account?tier=starter to preview
// the Starter Pack experience.
async function detectTier(
  searchParams: { tier?: string },
): Promise<'member' | 'starter'> {
  // Dev/preview override
  if (searchParams.tier === 'starter') return 'starter';
  if (searchParams.tier === 'member') return 'member';

  // Real lookup: Clerk → DB
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { getAccessTierForClerkId } = await import('@/lib/access');
    const { userId } = await auth();
    if (userId) {
      const tier = await getAccessTierForClerkId(userId);
      // The account dashboard only serves member or starter — guests shouldn't
      // be here (the page is robots: noindex). Treat 'guest' as 'starter' so
      // they see the upgrade-to-membership UI rather than nothing.
      return tier === 'member' ? 'member' : 'starter';
    }
  } catch {
    /* Clerk or DB not configured */
  }

  // Old `al_tier_preview` cookie fallback removed — it persisted access for
  // 7 days client-side and let refunded users keep seeing their library.
  // Default to 'starter' as the safest "you reached /account without a sub"
  // landing — the dashboard upsells to membership; access is still gated
  // server-side per request.
  return 'starter';
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; name?: string }>;
}) {
  const sp = await searchParams;
  const tier = await detectTier(sp);

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

  // Filter activity catalog by tier. Starter Pack buyers see ONLY their 10
  // activities. Members see everything.
  const tierActivities =
    tier === 'starter'
      ? allProducts.filter((p) => STARTER_PACK_SLUGS.has(p.slug))
      : allProducts;

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

  return <AccountDashboard userName={userName} tier={tier} activities={activities} />;
}
