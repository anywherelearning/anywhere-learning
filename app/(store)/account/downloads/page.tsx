import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPurchases } from "@/lib/db/queries";
import DownloadList from "@/components/account/DownloadList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Downloads",
};

export default async function DownloadsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName || "there";

  const purchases = await getUserPurchases(clerkId);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-forest sm:text-4xl">
        Welcome back, {firstName}!
      </h1>
      <h2 className="mt-2 text-lg text-gray-600">Your Downloads</h2>
      <div className="mt-8">
        <DownloadList orders={purchases} />
      </div>
    </div>
  );
}
