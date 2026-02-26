import type { Metadata } from "next";
import { Dancing_Script, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const displayFont = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Anywhere Learning — Meaningful Learning, Wherever You Are",
    template: "%s | Anywhere Learning",
  },
  description:
    "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anywherelearning.co",
    siteName: "Anywhere Learning",
    title: "Anywhere Learning — Meaningful Learning, Wherever You Are",
    description:
      "Real-world activity packs for homeschool and worldschool families. No curriculum, no worksheets, no prep.",
  },
  twitter: {
    card: "summary_large_image",
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
  return <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-[family-name:var(--font-body)] bg-cream text-gray-800 antialiased`}
      >
        <ClerkWrapper>{children}</ClerkWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
