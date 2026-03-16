import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import NativeHide from "@/components/mobile/NativeHide";
import NativePadding from "@/components/mobile/NativePadding";
import dynamic from "next/dynamic";

const ExitIntentPopup = dynamic(() => import("@/components/shop/ExitIntentPopup"));

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NativeHide>
        <SiteHeader />
      </NativeHide>
      <NativePadding>{children}</NativePadding>
      <NativeHide>
        <SiteFooter />
        <ExitIntentPopup />
      </NativeHide>
    </>
  );
}
