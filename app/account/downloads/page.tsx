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
    <section className="bg-cream min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-gray-500 mb-1">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-forest mb-2">
          Your Activity Packs
        </h1>
        <p className="text-gray-500 mb-10">
          Ready to print, pick one, and start learning.
        </p>

        <DownloadList purchases={purchases} />
      </div>
    </section>
  );
}
