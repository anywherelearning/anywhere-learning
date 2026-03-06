import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
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

  const purchases = await getUserPurchases(clerkId);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="font-display text-3xl text-forest sm:text-4xl">
        Your Activity Packs
      </h1>
      <p className="mt-2 text-gray-500">
        Ready to print, pick one, and start learning.
      </p>
      <div className="mt-8">
        <DownloadList purchases={purchases} />
      </div>
    </div>
  );
}
