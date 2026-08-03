import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MemberNav from "@/components/account/MemberNav";
import MemberFooter from "@/components/account/MemberFooter";
import { getAccessTierForClerkId } from "@/lib/access";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole member zone in one place. Signed out -> sign in; signed in
  // but no active trial/membership -> the paywall. Individual pages used to
  // gate inconsistently (the Library bounced guests, but the trail, This
  // Month, and Record didn't gate at all), so a signed-in non-member could
  // roam most of the zone. Content endpoints (/api/view, /api/download) always
  // gate server-side too; this stops the member shell from loading at all.
  //
  // Note: redirect() signals via a thrown control-flow error, so the redirect
  // calls must live OUTSIDE the try/catch — a bare catch would swallow them.
  // The try wraps only auth(), which is what throws when Clerk isn't
  // configured (local preview / staging), where we render so the page stays
  // viewable.
  if (hasClerk) {
    let clerkReady = true;
    let userId: string | null = null;
    try {
      ({ userId } = await auth());
    } catch {
      clerkReady = false;
    }
    if (clerkReady) {
      if (!userId) redirect("/sign-in");
      // getAccessTierForClerkId fails closed (returns 'guest') on a DB error,
      // so a database blip bounces members to /join rather than leaking the
      // zone. Rare, and downloads gate independently, so we favor no-leak here.
      const tier = await getAccessTierForClerkId(userId);
      if (tier === "guest") redirect("/join?from=account&reason=no-access");
    }
  }
  // The member zone has its own header (MemberNav); SiteHeader hides itself on
  // /account so there's a single nav. One render here covers every member page.
  return (
    <>
      <MemberNav />
      {children}
      <MemberFooter />
    </>
  );
}
