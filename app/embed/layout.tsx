import type { Metadata } from 'next';

/**
 * Minimal layout for the embeddable tool widgets. Lives outside the (store)
 * group on purpose: no SiteHeader, no SiteFooter, no account sync. These
 * pages render inside iframes on other people's sites.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
