# Anywhere Learning — Project Context

## Brand

- **Name:** Anywhere Learning
- **Owner:** Amelie (info@anywherelearning.co)
- **Tagline:** Meaningful Learning, Wherever You Are
- **Mission:** Help homeschool and worldschool families raise future-ready kids through real-world learning — no curriculum, no worksheets, no prep.
- **Domain:** anywherelearning.co

## Brand Design

- **Colors:** Cream `#faf9f6` · Forest `#588157` · Gold `#d4a373` · Forest-dark `#3d5c3b` · Gold-light `#e8c99a`
- **Category accents:** Nature `#6b8e6b` · Earthy brown `#8b7355` · Terracotta `#c4836a` · Dusty rose `#c47a8f` · Warm gray `#f7f5f0`
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

## Adding a New Product (Checklist)

When adding new products, follow this order:

### 1. Code changes (Claude does these)
- [ ] **`scripts/seed.ts`** — Add product entry (name, slug, description, price, category, ageRange, sortOrder)
- [ ] **`scripts/create-stripe-products.ts`** — Add to `catalog[]` array (slug, name, priceCents, description). If bundle: add image override to `imageOverrides`
- [ ] **`lib/fallback-products.ts`** — Add full product object with descriptions, previewFile reference
- [ ] **`lib/product-descriptions.ts`** — Add opening, whatsIncluded, skillTags, format
- [ ] **`lib/cart.ts`** — If bundle: add to `BUNDLE_CONTENTS` (child slugs) and `BUNDLE_DATA` (pricing/image)
- [ ] **`app/(store)/shop/page.tsx`** — If bundle: update `categoryBundleMap`. If new category: update `categoryMeta`, `categorySections`, `crossSellMap`
- [ ] **Product cover image** — Extract first page of PDF → `public/products/[slug].jpg` (use `pdftoppm -jpeg -f 1 -l 1 -r 300` then `sips --resampleWidth 800`)
- [ ] **Bundle cover image** — Copy from Previews folder → `public/products/mega-bundle-[name].jpg`

### 2. Service updates (Claude runs these after code changes)
- [ ] **Run `npm run stripe:sync`** — Creates Stripe products and populates price IDs
- [ ] **Seed Neon database** — Run `npx tsx scripts/seed.ts` to insert new products
- [ ] **Update `stripePriceId`** in `lib/fallback-products.ts` with the new IDs from stripe:sync output

### 3. Manual steps (Amelie does these)
- [ ] **Upload activity PDFs to Vercel Blob** — The actual downloadable files
- [ ] **Upload preview PDFs to Vercel Blob** — Free preview samples (if applicable)
- [ ] **Verify on live site** — Check shop page, product detail page, cart upsell, and bundle contents

### File location reference
- Activity PDFs: `/Users/ameliedrouin/Desktop/Anywhere Learning/Activities/`
- Preview PDFs: `/Users/ameliedrouin/Desktop/Anywhere Learning/Previews/`
- Bundle cover images: `/Users/ameliedrouin/Desktop/Anywhere Learning/Previews/Mega Bundle - [name].jpg`
- Product cover images (generated): `public/products/[slug].jpg`

## Pre-Launch Checklist

These must be done before going live:

1. **Set `NEXT_PUBLIC_URL` in Vercel** — without this, checkout success/cancel redirects go to `localhost:3000`
2. **Register the production Stripe webhook** — in Stripe Dashboard > Developers > Webhooks, point `https://anywherelearning.co/api/webhooks/stripe` at these events: `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
3. **Set `STRIPE_WEBHOOK_SECRET` in Vercel** — use the signing secret from step 2 (starts with `whsec_`)
4. **Switch to live Stripe keys** — replace `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel with live-mode keys (start with `sk_live_` / `pk_live_`)
5. **Upgrade Vercel Blob storage** — current free-tier Blob storage is full; upgrade plan or increase Blob quota before uploading remaining PDFs
6. **Upload PDFs to Vercel Blob** — product files for the download endpoint (requires step 5)
7. **Set up Clerk project** — configure Clerk for production (custom domain, social logins)
8. **Connect custom domain** in Vercel project settings
9. **Google Search Console + GA4** — verify site, submit sitemap
10. **Clean up test orders** in Neon database before launch
11. **Re-run `npm run stripe:sync`** — after switching to live Stripe keys and setting `NEXT_PUBLIC_URL` to `https://anywherelearning.co`, re-run the sync so all Stripe product images point to the production domain
12. **ConvertKit lead magnet automation** — in Kit UI:
    - Create automation: trigger = subscriber receives tag `lead`
    - Send email with free guide PDF attached or linked (subject: "Here's your free guide!")
    - Optional: add 2-3 follow-up emails (Day 2: getting started tips, Day 5: shop intro)
    - The `lead` tag is auto-applied by the app when someone submits the free guide form
13. **ConvertKit cart-abandonment automation** — in Kit UI:
    - Create automation: trigger = subscriber receives tag `cart-abandoner`
    - Add wait step: 1 hour
    - Add condition: subscriber does NOT have tag `buyer`
    - Send recovery email (warm, on-brand: "Still thinking it over? Your cart is waiting...")
    - Optional: second email at 24 hours with different angle
    - Tags `cart-abandoner` and `buyer` are auto-created by the app — no manual tag setup needed
14. **Pinterest Rich Pins** — validate domain in Pinterest Business settings to enable Rich Pins (pulls from existing OG/structured data)
15. **Directory submissions** — submit site to 3-5 homeschool directories (Homeschool.com, TheHomeSchoolMom, Secular Homeschool, etc.)

## Post-Launch Growth Ideas

Feature ideas surfaced during the pre-launch audit (March 2026). Prioritize based on data.

### Conversion
- **Referral incentive on success page** — discount code or "share with a friend" after purchase
- **"Frequently Bought Together" section** on product pages
- **Cross-sell non-category items** on product detail pages (e.g. show math packs on a nature page)
- **Bundle value callout on product cards** — show "Part of the Nature Bundle — save 40%" on individual cards
- **Cart badge re-animation** on item add for visual feedback
- **Sticky mobile buy bar** — show bundle savings info, not just price
- **Free guide post-submit CTA** — after email capture, show a "Browse the shop" button

### SEO / GEO
- **Product title tags with category keywords** — e.g. "Spring Outdoor Pack | Homeschool Nature Activities"
- **Category descriptions targeting SEO keywords** — write keyword-rich intros for each category section
- **Stronger internal linking** to FAQ, About, Contact from header/footer
- **Resource pillar pages** (`/resources/[slug]`) — research-backed, citation-heavy reference content for AI citability. Keep blog personal/story-driven; pillars handle stats, definitions, and claims. Start with 2-3: homeschool outcomes research, experiential learning science, deschooling explained. Add "Resources" to nav.

### Infrastructure
- **Upgrade to Redis-based rate limiting** (Upstash) when traffic grows
- **Stripe Tax collection** — configure in Stripe Dashboard when hitting state tax thresholds
- **Nonce-based CSP** — replace `unsafe-inline`/`unsafe-eval` for stricter Content Security Policy
