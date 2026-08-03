# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

The product is delivered as a Next.js (App Router) web app and shipped to iOS and Android via Capacitor (`@capacitor/ios`, `@capacitor/android`, push notifications, splash, status bar, safe-area handling). The user has committed to true adaptive design: the experience should honor native affordances per OS rather than shipping a single wrapped-website look. Marketing/SEO surfaces (homepage, shop/library, blog, guides) remain web-first and responsive; the member account experience is the surface where native adaptation matters most.

## Users

**Primary: the homeschooling / worldschooling parent**, operating the product on behalf of their family. They plan, record, and steer their kids' learning. They are typically running a low-prep, curriculum-free household and want reassurance they are covering what matters without becoming a full-time teacher.

**Secondary (delight layer): the child (roughly ages 6–12).** The kid-facing "Explorer" world (avatar, earned gear, hero scenes, packs) exists to motivate and reward the child, but the parent remains the operator. Family context on hand: Zach (12), Julia (10).

The experience is **parent-led, kid-delighted**: the parent drives; the child is pulled in.

## Product Purpose

Help homeschool and worldschool families raise future-ready kids through real-world, hands-on learning with no curriculum, no worksheets, and low prep. The product removes the parent's biggest anxieties (Am I doing enough? What do we do next?) by choosing the next meaningful activity for them and quietly recording what the family has actually done.

Success = a parent who feels confident and unburdened, a child who is engaged and visibly progressing, and a family that keeps coming back month after month (retention, not one-time purchase).

## Positioning

The differentiating mechanism is **"the engine picks the next step; the parent's only steering wheel is a compass nudge."** There is deliberately no activity-picking menu to agonize over. The engine chooses the next activity sized to the family; the parent can optionally nudge toward a territory (a subject/theme), and that is the only override.

The moat is deliberately **not content** (AI commoditizes content). It is the journey, curation, reassurance, connection, and belonging: a guided path, done *with* the kid, that a neighboring "pile of printables" or a generic AI prompt cannot replicate. Every activity is parent-led and reusable year after year.

## Operating Context

- **The core loop:** parent opens the app → engine surfaces the next activity (or the month/week view) → parent leads it *with* the child → completion is recorded → the child's explorer earns gear → the parent's Learning Record fills in.
- **Two sides of the interface:**
  - *Parent-facing:* Learning Record (skills growth Seed→Blooming), roadmap/trail state, monthly and weekly plan views, the compass nudge, membership/plan and settings.
  - *Kid-facing:* Explorer avatar builder, gear earned per finished activity, hero scenes, pack home.
- **Roadmap / trail model:** a family walks either one shared family path or a path per kid (`WalkMode: family | individual`); per-kid milestone check-offs; auto age-stage per kid; a max-of-3 focus picks that bias the engine's suggestions.
- **Gear reward model:** every finished activity earns one piece of explorer gear sized to effort — Quick → "trail find", Half-Day → "everyday gear", Project → "big gear." Gear is intentionally NOT tied to skill areas (skills live on the parent's Learning Record); it is pure "my explorer is getting ready for anything."
- **State & sync:** member state (profile, plan, completions, roadmap) lives in `localStorage` and syncs across devices via `lib/account-sync.ts`.
- **Distribution beyond the app:** the same activity library is also sold on Teachers Pay Teachers and Etsy; Pinterest and Instagram drive discovery. These are real, active channels, not aspirations.

## Capabilities and Constraints

**Tech stack (fixed):** Next.js 16 App Router + React 19 + TypeScript; Tailwind CSS 4; Clerk auth (conditional — app renders without Clerk env vars); Neon PostgreSQL + Drizzle ORM; Stripe payments; Resend + React Email (transactional); ConvertKit/Kit (marketing email); Vercel Blob (secure PDF delivery); Vercel hosting; Capacitor for native builds.

**Architectural constraints (fixed):**
- Server Components by default; Client Components only where interactivity is needed.
- Clerk and the database are both optional at runtime; shop/homepage use try/catch fallbacks and hardcoded product data so the most important pages never depend on a DB.
- **Shared Neon database** with a separate planner app: `schema.ts` owns 13 tables and a `tablesFilter` scopes Drizzle so `push` cannot drop the 7 planner tables. Keep the filter in sync; prefer additive SQL for new tables.
- Metadata template pattern: layout provides the `%s | Anywhere Learning` suffix. JSON-LD, canonical URLs, and metadata must be preserved on any page rewrite.

**Product model (current):** Membership. $99/yr founder rate (annual-only perk) + $15/mo monthly plan. 14-day free trial plus a 14-day refund window. A members' **library** replaces the old one-time shop. The legacy one-time-purchase shop/checkout/downloads code still exists in the repo and is mid-transition — treat it as legacy being superseded by membership, not as the current product center.

**Terminology (product's own words):** Explorer (the kid's avatar), Gear / Trail find / Everyday gear / Big gear, Trail & Territory, Compass nudge, Learning Record, Pack, Effort tiers (Quick / Half-Day / Project), Seed→Blooming (skill growth), Focus picks (max 3).

**Explicitly undecided / open:** the exact final gear illustration set (currently placeholder tinted tiles in `lib/gear.ts`, real illustrated set to come); the precise cutover plan for retiring legacy shop surfaces in favor of the library.

## Brand Commitments

- **Name:** Anywhere Learning. **Owner:** Amelie (info@anywherelearning.co). **Domain:** anywherelearning.co.
- **Tagline:** "Meaningful Learning, Wherever You Are."
- **Mission:** real-world learning for homeschool/worldschool families; no curriculum, no worksheets, low prep.
- **Voice:** warm, practical, empowering, conversational, mom-to-mom. Never preachy, institutional, or academic. **No em dashes anywhere** (copy, code, UI, content). No emojis in brand copy. No fabricated personal anecdotes in hooks (use observation voice or "you"; never invent "my kid did X" stories).
- **Copy rules (fixed):** use *meaningful, real-world, low prep, together time, download and follow along, use year after year.* Avoid *curriculum-aligned, worksheets, academic performance, busywork.* CTAs say "Get" not "Buy." Activities are framed as digital guides for parents to lead, not printables/worksheets, and are reusable year after year.
- **Founder credibility (lead with this):** Amelie was a teacher for 15 years, watched kids lose life skills, took an unpaid year to travel and homeschool her own kids, then chose homeschooling for good. Lived credibility.
- **Explorer/trail metaphor is committed:** the gamification world (explorer avatars, earned gear, trails, packs, territories, compass) is fixed product identity to preserve and extend, not redesign away.

## Evidence on Hand

- **Real product library:** activity guides sold via the site, Teachers Pay Teachers ("Anywhere Learning Studio"), and Etsy (8+ live listings). Source PDFs on the owner's Desktop.
- **Real distribution & audience:** Instagram @anywherelearning, active Facebook groups, Pinterest business account (Rich Pins shipped), documented reel history and performance data.
- **Real strategy docs (owner's Desktop, not in repo):** keyword/content-gap audit (canonical), content megaplan, membership-moat research. Code lives in the repo; strategy lives on Desktop.
- **Founder story is real and usable** (see Brand Commitments). Do **not** fabricate testimonials, customer names, benchmarks, pricing beyond the confirmed membership tiers, or deployment/scale claims. No invented social proof.

## Product Principles

1. **The engine steers; the parent nudges.** Remove choice paralysis. Never reintroduce an activity-picking menu as the primary path; the compass nudge is the only steering wheel.
2. **Parent-led, done together.** Every activity is led by the parent *with* the child. The product is about bonding and connection, never passive or solo consumption. Design for the two-person scene, not a kid alone with a screen.
3. **Sell the journey, not the content.** Curation, reassurance, progress made visible, belonging. Content is commoditized; the guided path and the record of what the family actually did are the value.
4. **Reassurance is the core job.** The parent's real anxiety is "Am I doing enough?" Progress visibility (Learning Record, earned gear, Seed→Blooming) exists to answer that quietly and continuously.
5. **Warmth over institution.** Nature-inspired, generous, human. Never textbook-like, never busywork, never school-at-home in feel or language.

## Accessibility & Inclusion

Adaptive delivery means honoring native affordances (safe areas, native tab/nav patterns, push, status bar) on iOS and Android, and responsive web everywhere else. No product-specific WCAG level has been formally committed; default to accessible practice (sufficient contrast against the cream/forest/gold palette, keyboard/focus support on web, adequate touch targets on native). Two distinct audiences (adult parent operator, child delight layer) means kid-facing surfaces should stay legible and forgiving for young readers while parent-facing surfaces stay efficient and scannable for a busy adult.
