import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import dynamic from "next/dynamic";

const ExitIntentPopup = dynamic(() => import("@/components/shop/ExitIntentPopup"));

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <ExitIntentPopup />
    </>
  );
}
