import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import AdventureMapHome from '@/components/account/AdventureMapHome';
import { getPlanActivities } from '@/lib/plan-activities';
import { getAccessTierForClerkId } from '@/lib/access';

export const metadata: Metadata = {
  title: 'Home',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function MemberHomePage() {
  // Guests (signed in, no membership) get a generic demo trail behind the
  // teaser instead of their own (possibly empty or stale) family data.
  let preview = false;
  try {
    const { userId } = await auth();
    if (userId) preview = (await getAccessTierForClerkId(userId)) === 'guest';
  } catch {
    /* Clerk not configured — render the normal member view */
  }
  return <AdventureMapHome activities={getPlanActivities()} preview={preview} />;
}
