import type { Metadata } from "next";
import { Dancing_Script, DM_Sans } from "next/font/google";
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
        {children}
      </body>
    </html>
  );
}
