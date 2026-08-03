import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MemberNav from "@/components/account/MemberNav";
import MemberFooter from "@/components/account/MemberFooter";
import MemberPaywallOverlay from "@/components/account/MemberPaywallOverlay";
import WelcomeTour from "@/components/account/WelcomeTour";
import { getAccessTierForClerkId } from "@/lib/access";
import { TRIAL_DAYS, MEMBERSHIP_PRICE_USD, MONTHLY_PRICE_USD } from "@/lib/membership";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole member zone in one place. Signed out -> sign in. Signed in
  // but no active trial/membership (a "guest") -> the page still renders, but a
  // soft-paywall teaser covers it (MemberPaywallOverlay) with a one-click path
  // to start a trial. Individual pages used to gate inconsistently (the Library
  // hard-bounced guests; the trail, This Month, and Record didn't gate at all),
  // so this is the single source of truth. Content endpoints (/api/view,
  // /api/download) gate server-side too, so nothing paid leaks behind the
  // teaser.
  //
  // Note: redirect() signals via a thrown control-flow error, so the sign-in
  // redirect must live OUTSIDE the try/catch — a bare catch would swallow it.
  // The try wraps only auth(), which is what throws when Clerk isn't configured
  // (local preview / staging), where we render so the page stays viewable.
  let showPaywall = false;
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
      // so a database blip shows the teaser rather than leaking the zone. Rare,
      // and downloads gate independently, so we favor no-leak here.
      const tier = await getAccessTierForClerkId(userId);
      showPaywall = tier === "guest";
    }
  }
  // The member zone has its own header (MemberNav); SiteHeader hides itself on
  // /account so there's a single nav. One render here covers every member page.
  return (
    <>
      <MemberNav />
      {children}
      {/* Auto-opens once for members; guests can still reopen it from the menu,
          but it never auto-fires over the paywall. */}
      <WelcomeTour autoOpen={!showPaywall} />
      {showPaywall ? (
        <MemberPaywallOverlay
          trialDays={TRIAL_DAYS}
          annualPriceUsd={MEMBERSHIP_PRICE_USD}
          monthlyPriceUsd={MONTHLY_PRICE_USD}
        />
      ) : (
        <MemberFooter />
      )}
    </>
  );
}
