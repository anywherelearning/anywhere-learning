# Anywhere Learning — Project Context

## Brand

- **Name:** Anywhere Learning
- **Owner:** Amelie (info@anywherelearning.co)
- **Tagline:** Meaningful Learning, Wherever You Are
- **Mission:** Help homeschool and worldschool families raise future-ready kids through real-world learning — no curriculum, no worksheets, no prep.
- **Domain:** anywherelearning.co

## Brand Design

- **Colors:** Cream `#faf9f6` · Forest `#588157` · Gold `#d4a373` · Forest-dark `#3d5c3b` · Gold-light `#e8c99a`
- **Typography:** Dancing Script (display/headlines, weight 700) · DM Sans (body, weights 400/500/600)
- **Tone:** Warm, practical, empowering, conversational — never preachy or institutional
- **Visual style:** Nature-inspired, generous white space, never textbook-like

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Auth:** Clerk (conditional — works without env vars)
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Payments:** Stripe
- **Transactional Email:** Resend + React Email
- **Marketing Email:** ConvertKit (Kit)
- **File Storage:** Vercel Blob (secure PDF delivery)
- **Hosting:** Vercel

## Copy Rules

- **Use:** meaningful, natural curiosity, real-world, no prep, permission, already happening, flexible, download and use, open and follow along, use year after year, together time
- **Product framing:** Activities are digital guides for parents — not printables. Parents download, open on any device, and follow step-by-step. Printing is optional, never the primary experience. Every activity is reusable year after year and adjustable to different kids' abilities.
- **Avoid:** curriculum-aligned, worksheets, academic performance, accelerate learning, teacher resources, busywork
- **CTAs:** "Get [Product]" not "Buy" — "Get" implies gaining
- **Lead with bundles** on listings (highest AOV)

## Site Structure

```
/                     → Homepage (product showcase, social proof, FAQ)
/free-guide           → Lead magnet landing page (email capture for free guide)
/shop                 → Product listing with category filtering
/shop/[slug]          → Product detail pages (SSG, daily revalidation)
/account/downloads    → User's purchased PDFs (requires Clerk auth)
/sign-in, /sign-up    → Clerk auth pages
/api/subscribe        → ConvertKit email subscription
/api/checkout          → Stripe Checkout session creation
/api/webhooks/stripe  → Stripe purchase webhook
/api/download/[fileId] → Secure PDF delivery (signed Blob URL)
```

## Key Architecture Decisions

- **Server Components by default** — Client Components only where interactivity is needed
- **Clerk is optional** — app renders without NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Database is optional** — shop/homepage use try/catch fallbacks when DATABASE_URL is missing
- **Homepage uses hardcoded product data** — no DB dependency for the most important page
- **Lead magnet page** uses its own Header/Footer; rest of site uses SiteHeader/SiteFooter
- **Metadata template pattern** — layout provides `%s | Anywhere Learning` suffix

## Strategic Blueprint

Full strategy, pricing, ICP, SEO keywords, and email funnel architecture are in the external file:
`/Users/ameliedrouin/Desktop/Anywhere Learning/WEBSITE-PROJECT.md`

## Current Status (Feb 2026)

Phase 1 (MVP Store) in progress:
- [x] Lead magnet landing page (at /free-guide)
- [x] Homepage with product showcase
- [x] Shop listing page with category filtering
- [x] Product detail pages with Stripe checkout
- [x] User account / downloads page
- [x] Clerk authentication
- [x] Database schema (Drizzle/Neon)
- [x] Stripe webhook handler
- [x] Secure PDF delivery endpoint
- [x] Purchase confirmation email (Resend)
- [x] ConvertKit buyer tagging
- [x] SEO: robots.ts, sitemap.ts, JSON-LD product schema
- [x] Run `npm run stripe:sync` to create Stripe products + get price IDs
- [x] Set up Neon database + run seed script
- [x] Stripe webhook tested end-to-end (local via Stripe CLI)
- [x] Shop pages redesign (category theming, SVG icons, animations, sticky mobile buy bar)
- [x] Lighthouse/SEO audit fixes (font swap, server components, aria-labels, structured data)
- [x] Pinterest Business account setup
- [x] Security hardening (rate limiting, CSP headers, input validation, honeypot, origin fix)
- [x] Post-purchase confirmation page (`/checkout/success`)
- [x] Checkout error feedback (inline error banners)
- [x] Cart bundle upsell (upgrade + savings frames)
- [x] Cart email capture for abandonment recovery (ConvertKit `cart-abandoner` tag)
- [ ] Set up Clerk project
- [ ] Google Search Console + GA4
- [ ] Deploy to Vercel + set up production Stripe webhook
- [ ] Upload PDFs to Vercel Blob

## Pre-Launch Checklist

These must be done before going live:

1. **Set `NEXT_PUBLIC_URL` in Vercel** — without this, checkout success/cancel redirects go to `localhost:3000`
2. **Register the production Stripe webhook** — in Stripe Dashboard > Developers > Webhooks, point `https://anywherelearning.co/api/webhooks/stripe` at these events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
3. **Set `STRIPE_WEBHOOK_SECRET` in Vercel** — use the signing secret from step 2 (starts with `whsec_`)
4. **Switch to live Stripe keys** — replace `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel with live-mode keys (start with `sk_live_` / `pk_live_`)
5. **Upload PDFs to Vercel Blob** — product files for the download endpoint
6. **Set up Clerk project** — configure Clerk for production (custom domain, social logins)
7. **Connect custom domain** in Vercel project settings
8. **Google Search Console + GA4** — verify site, submit sitemap
9. **Clean up test orders** in Neon database before launch
10. **ConvertKit cart-abandonment automation** — in Kit UI:
    - Create automation: trigger = subscriber receives tag `cart-abandoner`
    - Add wait step: 1 hour
    - Add condition: subscriber does NOT have tag `buyer`
    - Send recovery email (warm, on-brand: "Still thinking it over? Your cart is waiting...")
    - Optional: second email at 24 hours with different angle
    - Tags `cart-abandoner` and `buyer` are auto-created by the app — no manual tag setup needed
