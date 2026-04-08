import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getUserPurchases } from '@/lib/db/queries';
import NativeLibraryView from '@/components/mobile/NativeLibraryView';
import NativeAuthGuard from '@/components/mobile/NativeAuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Library',
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  // On web, redirect to the existing downloads page
  // (NativeRedirectGuard handles the reverse - web users won't normally reach this)

  let clerkId: string | null = null;
  try {
    const authResult = await auth();
    clerkId = authResult.userId;
  } catch {
    // Clerk not configured
  }

  if (!clerkId) {
    return <NativeAuthGuard />;
  }

  // Get email to link pending webhook-created users
  let email: string | undefined;
  try {
    const clerkUser = await currentUser();
    email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  } catch {
    // Ignore
  }

  let purchases: Awaited<ReturnType<typeof getUserPurchases>> = [];
  try {
    purchases = await getUserPurchases(clerkId, email);
  } catch {
    // DB unavailable - show empty state
  }

  const products = purchases.map((p) => ({
    id: p.product.id,
    name: p.product.name,
    slug: p.product.slug,
    imageUrl: p.product.imageUrl,
    category: p.product.category,
    isBundle: p.product.isBundle,
  }));

  return <NativeLibraryView products={products} />;
}
