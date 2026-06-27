import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import NativeHide from "@/components/mobile/NativeHide";
import NativePadding from "@/components/mobile/NativePadding";
import { PurchasedProvider } from "@/components/shop/PurchasedContext";
import AccountSync from "@/components/account/AccountSync";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PurchasedProvider>
      <AccountSync />
      <NativeHide>
        <SiteHeader />
      </NativeHide>
      <NativePadding>{children}</NativePadding>
      <NativeHide>
        <SiteFooter />
      </NativeHide>
    </PurchasedProvider>
  );
}
