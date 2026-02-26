import type { Metadata } from 'next';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserPurchases } from '@/lib/db/queries';
import DownloadList from '@/components/account/DownloadList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Downloads',
};

export default async function DownloadsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  let purchases: Awaited<ReturnType<typeof getUserPurchases>> = [];
  try {
    purchases = await getUserPurchases(userId);
  } catch {
    // Database not configured yet
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-gray-600">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </p>
        <h1 className="mt-1 font-display text-3xl text-forest sm:text-4xl">
          Your Downloads
        </h1>

        <DownloadList purchases={purchases} />
      </div>
    </section>
  );
}
