import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MemberNav from "@/components/account/MemberNav";
import MemberFooter from "@/components/account/MemberFooter";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // When Clerk isn't configured (local preview / staging), allow the
  // dashboard to render without auth so the page is viewable.
  if (hasClerk) {
    try {
      const { userId } = await auth();
      if (!userId) redirect("/sign-in");
    } catch {
      // Clerk misconfigured — fall through to render so the page is still viewable.
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
