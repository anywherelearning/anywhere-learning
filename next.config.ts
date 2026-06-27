import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  // Prevent clickjacking - only allow our own site to frame pages (skip in dev for preview)
  ...(isDev ? [] : [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]),
  // Block MIME-type sniffing (e.g. serving JS disguised as an image)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control Referer header leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year (includeSubDomains once custom domain is live)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Restrict browser features the site doesn't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content Security Policy - allow our own content + trusted third parties
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev https://clerk.anywherelearning.co https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://s.pinimg.com https://ct.pinterest.com https://www.gstatic.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://img.clerk.com https://*.anywherelearning.co https://*.public.blob.vercel-storage.com https://*.stripe.com https://www.google-analytics.com https://www.googletagmanager.com https://ct.pinterest.com https://*.pinimg.com https://www.gstatic.com https://*.googleusercontent.com",
      "frame-src https://js.stripe.com https://*.clerk.accounts.dev https://accounts.anywherelearning.co https://challenges.cloudflare.com https://www.google.com",
      "connect-src 'self' https://*.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://*.anywherelearning.co https://*.upstash.io https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://ct.pinterest.com https://s.pinimg.com https://www.google.com https://apis.google.com",
      "worker-src 'self' blob:",
      ...(isDev ? ["frame-ancestors *"] : []),
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 enforces this allowlist: any <Image quality={…}> NOT listed here
    // returns HTTP 400 and the image fails to load. Must include every quality
    // value used across the codebase (currently 60/75/80/85/90/95).
    qualities: [60, 75, 80, 85, 90, 95],
    // Local images become an allow-list once localPatterns is set. The first
    // entry keeps every existing query-less local image working; the second
    // permits the cover cache-bust (?v=N). Keep `search` in sync with
    // COVER_VERSION in lib/cover.ts whenever a cover redesign needs a bump.
    localPatterns: [
      { pathname: "/**" },
      { pathname: "/products/**", search: "?v=2" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        // Consolidated into the /guides pillar page (was a duplicate of the same content)
        source: "/blog/real-world-learning-guide",
        destination: "/guides/real-world-learning",
        permanent: true,
      },

      // ── Membership pivot: routes that no longer exist ──
      // Old pins, posts, and emails still point at the a-la-carte store.
      { source: "/membership", destination: "/join", permanent: true },
      { source: "/cart", destination: "/join", permanent: true },
      { source: "/bundles", destination: "/join", permanent: true },
      { source: "/shop/bundles", destination: "/join", permanent: true },
      { source: "/shop/master-bundle", destination: "/join", permanent: true },
      // Old signed-in library URL moved when account pages were restructured
      { source: "/account/library/:path*", destination: "/library", permanent: true },

      // ── Retired products with no direct successor ──
      { source: "/shop/time-capsule", destination: "/library", permanent: true },
      { source: "/shop/creative-thinking-pack", destination: "/library", permanent: true },

      // ── Renamed product slugs ──
      { source: "/shop/kitchen-maths-cooking", destination: "/shop/kitchen-math-challenge", permanent: true },
      { source: "/shop/my-small-business-project", destination: "/shop/micro-business", permanent: true },

      // ── Truncated external links (GSC 404s, Jun 2026) ──
      // A cut-off /free-guide link and a mangled "$99/yr" link circulating off-site
      { source: "/free-", destination: "/free-guide", permanent: true },
      { source: "/yr", destination: "/join", permanent: true },

      // ── Renamed or retired blog posts ──
      { source: "/blog/homeschool-road-trip", destination: "/blog/homeschool-while-traveling", permanent: true },
      { source: "/blog/worldschool-three-kids", destination: "/blog/worldschool-two-kids", permanent: true },
      { source: "/blog/teach-kids-second-language", destination: "/guides/worldschooling-guide", permanent: true },
    ];
  },
};

export default analyze(nextConfig);
