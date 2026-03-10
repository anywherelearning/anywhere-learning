import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, hasActiveMembership } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  try {
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const user = await getUserByClerkId(clerkId);
      if (user) {
        const isMember = await hasActiveMembership(user.id);
        if (isMember) redirect('/account/library');
      }
    }
  } catch {
    // Fallback to downloads if auth/db unavailable
  }
  redirect('/account/downloads');
}
