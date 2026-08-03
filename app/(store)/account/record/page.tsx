import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import LearningRecord from '@/components/account/LearningRecord';
import { getPlanActivities } from '@/lib/plan-activities';
import { getAccessTierForClerkId } from '@/lib/access';

export const metadata: Metadata = {
  title: 'Learning Record',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function RecordPage() {
  // Guests (signed in, no membership) get the generic demo family behind the
  // teaser instead of their own (possibly empty or stale) record.
  let preview = false;
  try {
    const { userId } = await auth();
    if (userId) preview = (await getAccessTierForClerkId(userId)) === 'guest';
  } catch {
    /* Clerk not configured — render the normal member view */
  }
  return <LearningRecord activities={getPlanActivities()} preview={preview} />;
}
