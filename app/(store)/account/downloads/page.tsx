import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserPurchases, getUserByClerkId, hasActiveMembership } from "@/lib/db/queries";
import DownloadList from "@/components/account/DownloadList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Downloads",
  description: "Access and download your purchased activity packs. Start learning anywhere.",
  robots: { index: false, follow: false },
};

export default async function DownloadsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Get email from Clerk to link pending webhook-created users
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  const purchases = await getUserPurchases(clerkId, email);

  // Check membership for banner
  let isMember = false;
  try {
    const user = await getUserByClerkId(clerkId);
    if (user) {
      isMember = await hasActiveMembership(user.id);
    }
  } catch {
    // Ignore — banner just won't show
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
      {isMember && (
        <Link
          href="/account/library"
          className="flex items-center justify-between bg-forest/5 border border-forest/15 rounded-2xl p-4 mb-8 group hover:bg-forest/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-forest rounded-full animate-pulse" />
            <span className="text-sm font-medium text-forest">
              Active Member — Open your full library
            </span>
          </div>
          <svg className="w-4 h-4 text-forest/50 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      <h1 className="font-display text-3xl text-forest sm:text-4xl">
        Your Activity Packs
      </h1>
      <p className="mt-2 text-gray-500">
        Ready to open, pick one, and start learning.
      </p>
      <div className="mt-8">
        <DownloadList purchases={purchases} />
      </div>
    </div>
  );
}
