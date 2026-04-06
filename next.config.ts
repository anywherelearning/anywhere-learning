import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  // Prevent clickjacking — only allow our own site to frame pages (skip in dev for preview)
  ...(isDev ? [] : [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]),
  // Block MIME-type sniffing (e.g. serving JS disguised as an image)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control Referer header leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year (includeSubDomains once custom domain is live)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Restrict browser features the site doesn't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content Security Policy — allow our own content + trusted third parties
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://img.clerk.com https://*.public.blob.vercel-storage.com https://*.stripe.com https://www.google-analytics.com https://www.googletagmanager.com",
      "frame-src https://js.stripe.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "connect-src 'self' https://*.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://*.upstash.io https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
      "worker-src 'self' blob:",
      ...(isDev ? ["frame-ancestors *"] : []),
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
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
};

export default analyze(nextConfig);
