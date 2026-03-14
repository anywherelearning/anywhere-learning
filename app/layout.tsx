import type { Metadata } from "next";
import { Dancing_Script, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
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
    default: "Anywhere Learning — Meaningful Learning, Wherever You Are",
    template: "%s | Anywhere Learning",
  },
  description:
    "No-prep homeschool activity packs for outdoor learning, nature activities, real-world math, and more. Digital guides for worldschool and homeschool families — ages 4 to 14.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anywherelearning.co",
    siteName: "Anywhere Learning",
    title: "Anywhere Learning — Meaningful Learning, Wherever You Are",
    description:
      "No-prep homeschool activity packs for outdoor learning, nature activities, real-world math, and more. Digital guides for worldschool and homeschool families — ages 4 to 14.",
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
  // ClerkProvider requires a publishableKey. When building without env vars
  // (e.g. CI or first build), skip the provider so static pages can render.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  return <ClerkProvider appearance={{ ...clerkAppearance, cssLayerName: 'clerk' }}>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
                  "url": "https://anywherelearning.co",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://anywherelearning.co/logo.png",
                  },
                  "description":
                    "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
                  "email": "info@anywherelearning.co",
                  "sameAs": [
                    "https://www.pinterest.com/anywherelearningco/",
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
            {children}
            <CartDrawer />
          </CartProvider>
        </ClerkWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
