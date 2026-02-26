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
- **Payments:** Lemon Squeezy
- **Transactional Email:** Resend + React Email
- **Marketing Email:** ConvertKit (Kit)
- **File Storage:** Vercel Blob (secure PDF delivery)
- **Hosting:** Vercel

## Copy Rules

- **Use:** meaningful, natural curiosity, real-world, no prep, permission, already happening, flexible, print and use, together time
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
/api/webhooks/lemon   → Lemon Squeezy purchase webhook
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
- [x] Product detail pages with Lemon Squeezy checkout
- [x] User account / downloads page
- [x] Clerk authentication
- [x] Database schema (Drizzle/Neon)
- [x] Lemon Squeezy webhook handler
- [x] Secure PDF delivery endpoint
- [x] Purchase confirmation email (Resend)
- [x] ConvertKit buyer tagging
- [x] SEO: robots.ts, sitemap.ts, JSON-LD product schema
- [ ] Set up Lemon Squeezy store account + upload products
- [ ] Set up Neon database + run seed script
- [ ] Set up Clerk project
- [ ] Lighthouse audit (target 95+)
- [ ] Google Search Console + GA4
- [ ] Pinterest Business account setup
