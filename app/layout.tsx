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
  title:
    "10 Life Skills Your Kids Can Learn This Week — Free Guide | Anywhere Learning",
  description:
    "A free, no-prep activity guide for homeschool and worldschool families. Download 10 real-world life skills activities your kids can try this week.",
  openGraph: {
    title:
      "10 Life Skills Your Kids Can Learn This Week — Free Guide | Anywhere Learning",
    description:
      "A free, no-prep activity guide for homeschool and worldschool families. Download 10 real-world life skills activities your kids can try this week.",
    type: "website",
  },
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#588157',
    colorBackground: '#faf9f6',
    colorText: '#1a1a1a',
    colorInputBackground: '#ffffff',
    borderRadius: '0.5rem',
    fontFamily: 'DM Sans, sans-serif',
  },
};

function Providers({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  return (
    <ClerkProvider appearance={clerkAppearance}>
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
    <Providers>
      <html lang="en">
        <body
          className={`${bodyFont.variable} ${displayFont.variable} font-body bg-cream text-gray-900 antialiased`}
        >
          {children}
          <SpeedInsights />
        </body>
      </html>
    </Providers>
  );
}
