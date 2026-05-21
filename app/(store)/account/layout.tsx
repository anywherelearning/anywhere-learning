import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
  return <>{children}</>;
}
