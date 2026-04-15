import type { Metadata } from "next";
import { Dancing_Script, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import PassMemberProvider from "@/components/PassMemberProvider";
import CapacitorProvider from "@/components/mobile/CapacitorProvider";
import MobileTabBar from "@/components/mobile/MobileTabBar";
import NativeHide from "@/components/mobile/NativeHide";
import NativeRedirectGuard from "@/components/mobile/NativeRedirectGuard";
import PinterestTracker from "@/components/analytics/PinterestTracker";
import PinterestEnhancedMatch from "@/components/analytics/PinterestEnhancedMatch";
import ImageProtection from "@/components/shared/ImageProtection";
import "./globals.css";

const displayFont = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Anywhere Learning | Meaningful Learning, Wherever You Are",
    template: "%s | Anywhere Learning",
  },
  description:
    "Low-prep homeschool activity guides for outdoor learning, nature activities, real-world math, and more. Digital guides for worldschool and homeschool families, ages 6 to 14.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anywherelearning.co",
    siteName: "Anywhere Learning",
    title: "Anywhere Learning | Meaningful Learning, Wherever You Are",
    description:
      "Low-prep homeschool activity guides for outdoor learning, nature activities, real-world math, and more. Digital guides for worldschool and homeschool families, ages 6 to 14.",
    images: [
      {
        url: "https://anywherelearning.co/og-default.png",
        width: 1200,
        height: 630,
        alt: "Anywhere Learning | Meaningful Learning, Wherever You Are",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    other: {
      "p:domain_verify": "5a031867515fed8ef0f33a4809525261",
    },
  },
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#588157",
    colorBackground: "#faf9f6",
    colorText: "#1a1a1a",
    colorInputBackground: "#ffffff",
    borderRadius: "0.5rem",
    fontFamily: "DM Sans, sans-serif",
  },
};

function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return <>{children}</>;
  }
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{ ...clerkAppearance, cssLayerName: 'clerk' }}
    >
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://anywherelearning.co/#organization",
                  "name": "Anywhere Learning",
                  "alternateName": "anywherelearning.co",
                  "url": "https://anywherelearning.co",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://anywherelearning.co/logo.png",
                  },
                  "description":
                    "Low-prep activity guides for homeschool and worldschool families. Real-world learning for ages 6-14. Download, open on any device, and follow along with your kids.",
                  "slogan": "Meaningful Learning, Wherever You Are",
                  "email": "info@anywherelearning.co",
                  "founder": {
                    "@type": "Person",
                    "name": "Amelie",
                    "url": "https://anywherelearning.co/about",
                  },
                  "sameAs": [
                    "https://ca.pinterest.com/anywherelearning/",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://anywherelearning.co/#website",
                  "url": "https://anywherelearning.co",
                  "name": "Anywhere Learning",
                  "description":
                    "Meaningful Learning, Wherever You Are",
                  "publisher": {
                    "@id": "https://anywherelearning.co/#organization",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-[family-name:var(--font-body)] bg-cream text-gray-800 antialiased`}
      >
        <ClerkWrapper>
          <CartProvider>
            <PassMemberProvider>
              <CapacitorProvider>
                <NativeRedirectGuard />
                <ImageProtection />
                {children}
                <NativeHide><CartDrawer /></NativeHide>
                <PinterestEnhancedMatch />
                <MobileTabBar />
              </CapacitorProvider>
            </PassMemberProvider>
          </CartProvider>
        </ClerkWrapper>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WF83M4HF46"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WF83M4HF46');
          `}
        </Script>
        <Script id="pinterest-tag" strategy="afterInteractive">
          {`
            !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '2613130206618');
            pintrk('page');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src="https://ct.pinterest.com/v3/?event=init&tid=2613130206618&noscript=1"
          />
        </noscript>
        <PinterestTracker />
        <SpeedInsights />
      </body>
    </html>
  );
}
