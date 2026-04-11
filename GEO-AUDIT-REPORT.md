# GEO Audit Report: Anywhere Learning

**Audit Date:** March 15, 2026
**URL:** https://anywherelearning.co
**Business Type:** E-commerce (Digital Products / Educational Activity Guides)
**Pages Analyzed:** ~70 (9 static + ~29 blog + ~30 product pages)
**Site Status:** Pre-launch (not yet deployed to production)

---

## Executive Summary

**Overall GEO Score: 52/100 (Poor)**

Anywhere Learning has a solid technical foundation with comprehensive JSON-LD schema, proper SSR/ISR rendering, and well-structured content. However, the site's GEO score is held back by **zero online brand authority** (pre-launch, not indexed by any search engine), **no customer testimonials or social proof**, and **no research citations or data** to back educational claims. The content is well-written and structured for AI extraction, but the site is invisible to AI systems because it doesn't exist on the public web yet.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 72/100 | 25% | 18.0 |
| Brand Authority | 5/100 | 20% | 1.0 |
| Content E-E-A-T | 65/100 | 20% | 13.0 |
| Technical GEO | 78/100 | 15% | 11.7 |
| Schema & Structured Data | 85/100 | 10% | 8.5 |
| Platform Optimization | 5/100 | 10% | 0.5 |
| **Overall GEO Score** | | | **52.7/100** |

---

## Critical Issues (Fix Immediately)

### 1. Site is not live / not indexed by any search engine
- **Impact:** The site cannot be discovered, cited, or recommended by any AI system
- **Detail:** `site:anywherelearning.co` returns zero results on Google, Bing, and all AI platforms
- **Fix:** Deploy to Vercel, connect custom domain, submit sitemap to Google Search Console
- **Priority:** Blocking. Nothing else matters until this is resolved

### 2. No llms.txt file
- **Impact:** AI crawlers have no structured way to understand site content and permissions
- **Detail:** No `llms.txt` file exists in `/public` or as a route handler
- **Fix:** Create `public/llms.txt` with site description, key pages, and content structure
- **Expected impact:** Improved AI crawler comprehension of site purpose and content hierarchy

---

## High Priority Issues

### 3. Zero brand presence across all platforms
- **Impact:** AI systems cannot verify the entity "Anywhere Learning" exists
- **Detail:** Not found on YouTube, Reddit, LinkedIn, Wikipedia, homeschool directories, Facebook, Instagram, Twitter/X, TikTok. Pinterest Business account reportedly set up but not discoverable in search.
- **Fix:** Create/claim social profiles, submit to 3-5 homeschool directories post-launch
- **Expected impact:** Entity recognition by AI systems, improved brand authority score

### 4. No customer testimonials or reviews
- **Impact:** Major E-E-A-T gap; AI systems weight social proof heavily for product recommendations
- **Detail:** Zero reviews, quotes from parents, or success stories anywhere on the site. Only generic ticker items ("220+ real-world activities", "Ages 6-14")
- **Fix:** Collect 3-5 parent testimonials with specific outcomes; add to homepage and product pages
- **Expected impact:** +15-20 points on E-E-A-T score; significantly improved product recommendation likelihood

### 5. No research citations or data backing educational claims
- **Impact:** Content makes pedagogical claims without evidence, reducing AI citation confidence
- **Detail:** Searched all 29 blog posts. Zero academic citations, zero statistics, zero expert quotes. Claims like "teenagers who ace tests but can't budget" are presented as fact without sources.
- **Fix:** Add 2-3 research citations to pillar posts; include statistics on homeschool outcomes
- **Expected impact:** +15-20 points on citability score for research-adjacent queries

### 6. ~~Author credentials not displayed~~ ✅ FIXED
- **Impact:** E-E-A-T "Expertise" signal is weak
- **Detail:** ~~Blog bio says "Worldschooling mom, activity pack creator" but no teaching credentials, years of experience, or formal qualifications. About page mentions "years in the classroom" but doesn't specify.~~
- **Status:** Fixed. Author bio now reads "Former teacher (B.Ed, M.Ed) with 15 years in the classroom" across blog, about page, homepage, shop pages, email sequences, and llms.txt.

---

## Medium Priority Issues

### 7. ~~Free guide landing page missing JSON-LD schema~~ ✅ FIXED
- **Detail:** ~~`/free-guide` has no structured data; should have Product or DigitalDocument schema~~
- **Status:** Fixed. Added Product schema with offer price $0, brand, author, and image.

### 8. ~~About page missing JSON-LD schema~~ ✅ FIXED
- **Detail:** ~~`/about` has no structured data; should have Person or ProfilePage schema~~
- **Status:** Fixed. Added Person schema (credentials, knowsAbout, worksFor, sameAs) and ProfilePage schema.

### 9. ✅ FIXED: Content is narrative-first, not claims-first
- **Detail:** Blog posts use conversational tone ("Let me tell you about...") rather than assertive claims ("Deschooling is the process of..."). AI systems prefer extractable definitions.
- **Fix:** Added "In short" summary boxes with assertive, claims-first definitions at the top of 9 pillar blog posts. New `SummaryBox` component with forest-tinted design. Summary text is included in `articleBody` for JSON-LD.
- **Expected impact:** Higher citation rate for definitional queries

### 10. ~~No comparison or ranking content~~ ✅ PLANNED
- **Detail:** No "X vs Y" articles, comparison tables, or ranked lists. These are high-value for AI advisory queries.
- **Status:** Added 4 comparison/ranking posts (#54 to #57) to CONTENT-MEGAPLAN.md: Homeschool vs Worldschool, Unschooling vs Homeschooling, Methods Compared, and Best Approaches Ranked. ~4,000/mo combined keyword volume.

### 11. ~~Name collision with other entities~~ ✅ PARTIALLY FIXED
- **Detail:** "Anywhere Learning" is used by anywherelearning.in (Indian ed-tech) and Anytime Anywhere Learning Foundation. This makes branded search competitive.
- **Status:** Added `alternateName: "anywherelearning.co"`, `slogan`, and `founder` to Organization schema for disambiguation. External profile work (directories, social) still needed post-launch.

### 12. CSP uses unsafe-inline/unsafe-eval
- **Detail:** Content Security Policy relies on `'unsafe-inline'` and `'unsafe-eval'` for scripts
- **Status:** Deferred to post-launch. Nonce-based CSP requires testing with Clerk (injects inline scripts), Stripe, and GA4. Browsers ignore `'unsafe-inline'` when a nonce is present, so adding nonces without verifying all third-party inline scripts would break auth/payments. Needs production validation.

---

## Low Priority Issues

### 13. ~~BreadcrumbList schema missing from shop listing page~~ ✅ FIXED
- **Detail:** ~~Only product detail and blog post pages have breadcrumb schema; shop listing page does not~~
- **Status:** Fixed. Added BreadcrumbList schema (Home → Shop) to shop listing page.

### 14. ~~Homepage has duplicate Organization schema~~ ✅ FIXED
- **Detail:** ~~Organization JSON-LD is defined in both root layout and homepage, creating redundancy~~
- **Status:** Fixed. Removed duplicate Organization and WebSite schemas from homepage. Root layout is the single source of truth.

### 15. Some product descriptions are formulaic
- **Detail:** Heavy reliance on shared template sections (SHARED_ACTIVITY_STRUCTURE, SHARED_WHY_FAMILIES_LOVE_IT) makes some product pages feel similar
- **Fix:** Add unique selling points or specific activity examples to differentiate

### 16. ~~Blog posts lack dateModified on older posts~~ ✅ FIXED
- **Detail:** ~~Most recent posts have dateModified but some older posts only have publishedAt~~
- **Status:** Fixed. All 28 blog posts now have explicit dateModified values.

---

## Category Deep Dives

### AI Citability (72/100)

**Strengths:**
- Excellent FAQ structure: 24 FAQ items with concise 2-3 sentence answers, perfectly formatted for AI extraction
- Strong "How to" and "What is" content patterns matching common AI query formats
- Substantial content volume (~56,000 words across blog + products)
- Well-structured content blocks with headings, lists, tips, and pull quotes
- Product descriptions with specific, extractable specifications

**Weaknesses:**
- No research citations or statistics (scored 32/100 on data density)
- Narrative-first writing style reduces extractability
- No comparison tables or ranked alternatives
- Pull quotes are strong but few standalone definitional statements

**Best citability examples:**
- FAQ answers (e.g., "How do I use the activity packs?" clear, self-contained)
- Product specifications (e.g., "20 spring-themed outdoor activities across 4 subjects")
- Structured how-to guides with numbered steps

---

### Brand Authority (5/100)

**Status: Pre-launch, essentially zero online presence**

| Platform | Status |
|----------|--------|
| Google Index | Not indexed |
| YouTube | No channel |
| Reddit | No mentions |
| Pinterest | Account set up, not discoverable |
| LinkedIn | No company page |
| Homeschool Directories | Not listed |
| Instagram | No account found |
| Twitter/X | No account found |
| Facebook | No account (unrelated entity owns the name) |
| Wikipedia | No mention |

**Note:** This score will improve dramatically once the site is live and actively promoted.

---

### Content E-E-A-T (65/100)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Experience | 8/10 | Vivid personal anecdotes (Panama Canal, El Salvador, kitchen learning) |
| Expertise | 7/10 | 29 blog posts, clear pedagogical philosophy, practical how-tos |
| Authoritativeness | 4/10 | No third-party validation, no external mentions, no credentials displayed |
| Trustworthiness | 7/10 | Clear refund policy, comprehensive legal docs, contact channels |
| Content Freshness | 9/10 | All content from 2026, actively maintained with dateModified |
| Source Attribution | 3/10 | Zero academic citations, zero expert quotes |
| Social Proof | 1/10 | No testimonials, reviews, or user-generated content |

**Strongest E-E-A-T asset:** The About page narrative establishes genuine teaching experience and worldschooling practice with specific, believable details (7-month trip, kids ages 12 and 9, former classroom teacher).

**Biggest E-E-A-T gap:** No customer voices and no research backing for educational claims.

---

### Technical GEO (78/100)

**Strengths:**
- All AI crawlers allowed by default (no blocks in robots.txt)
- Server-side rendering with Next.js App Router (no JS-rendering dependency)
- Smart ISR strategy (hourly shop, daily products, static blog)
- Security headers properly configured (HSTS, CSP, X-Frame-Options)
- Proper canonical URLs on all pages
- Database-optional design with fallback products (resilient)

**Weaknesses:**
- No llms.txt file (-15 points)
- CSP uses unsafe-inline/unsafe-eval (-5 points)
- Site not deployed (cannot be crawled)

---

### Schema & Structured Data (85/100)

**Comprehensive coverage with 8+ schema types:**

| Page Type | Schema Types |
|-----------|-------------|
| Homepage | Organization, WebSite, FAQPage |
| Shop Listing | ItemList |
| Product Detail | Product, Offer, AggregateRating*, BreadcrumbList |
| Blog Listing | CollectionPage, ItemList |
| Blog Post | BlogPosting, BreadcrumbList, FAQPage* |
| FAQ Page | FAQPage |
| Free Guide | (none) |
| About | (none) |

*Conditional schemas marked with asterisk

**Gaps:** Free guide and About page missing schema; no BreadcrumbList on shop listing; duplicate Organization schema on homepage.

---

### Platform Optimization (5/100)

The site has zero presence on platforms that AI models rely on for training and citation:
- No YouTube content
- No Reddit discussions
- No Stack Overflow or educational forum presence
- No podcast appearances
- No press coverage or media mentions
- Pinterest account exists but is not discoverable

---

## Quick Wins (Implement This Week)

1. **Create llms.txt**: Add `public/llms.txt` describing the site, its products, and content structure. Immediate AI crawler comprehension boost.

2. **Add Person schema to About page**: 10 minutes of code; establishes founder entity for AI systems.

3. **Add JSON-LD to Free Guide page**: Add DigitalDocument or Product schema with price $0 to the lead magnet page.

4. **Fix duplicate Organization schema**: Remove from homepage since it's already in root layout.

5. **Add specific credentials to author bio**: Update the 1-sentence bio to include teaching background and years of experience.

---

## 30-Day Action Plan

### Week 1: Deploy & Index
- [ ] Deploy to Vercel with custom domain (anywherelearning.co)
- [ ] Submit sitemap to Google Search Console
- [ ] Set up GA4 for traffic tracking
- [ ] Create llms.txt file
- [ ] Fix duplicate Organization schema
- [ ] Add schema to Free Guide and About pages

### Week 2: Brand Foundation
- [ ] Claim/create Instagram, Facebook, and TikTok accounts
- [ ] Submit to 3 homeschool directories (TheHomeSchoolMom, SEA Homeschoolers, Homeschool Hall)
- [ ] Set up LinkedIn company page
- [ ] Begin Pinterest pinning strategy (2-3 pins/day of activity content)
- [ ] Verify Pinterest Rich Pins

### Week 3: Content Authority
- [ ] Add 2-3 research citations to top 3 pillar blog posts
- [ ] Expand author bio with specific teaching credentials
- [ ] Create 1 comparison article ("Homeschool vs Worldschool: Key Differences")
- [ ] Add definition/summary boxes to top 5 blog posts
- [ ] Collect 3 customer testimonials (from beta users or early purchasers)

### Week 4: Optimization
- [ ] Add testimonials to homepage and product pages
- [ ] Create a "Research & Resources" page with cited education studies
- [ ] Add BreadcrumbList schema to shop listing page
- [ ] Submit to 2 more directories (Homeschool.com, Cathy Duffy Reviews)
- [ ] Begin organic participation on Reddit (r/homeschool, r/worldschooling)

---

## Appendix: Score Methodology

### Composite GEO Score Formula
```
GEO Score = (Citability × 0.25) + (Brand × 0.20) + (EEAT × 0.20) + (Technical × 0.15) + (Schema × 0.10) + (Platform × 0.10)
         = (72 × 0.25) + (5 × 0.20) + (65 × 0.20) + (78 × 0.15) + (85 × 0.10) + (5 × 0.10)
         = 18.0 + 1.0 + 13.0 + 11.7 + 8.5 + 0.5
         = 52.7 → 53/100
```

### Post-Launch Projected Score (After 30-Day Plan)
```
Projected = (75 × 0.25) + (35 × 0.20) + (75 × 0.20) + (85 × 0.15) + (90 × 0.10) + (25 × 0.10)
          = 18.75 + 7.0 + 15.0 + 12.75 + 9.0 + 2.5
          = 65/100 (Fair, approaching Good)
```

### Key Insight
The biggest lever for improvement is **deploying the site and building brand presence**. Technical foundation and content quality are strong; the site just needs to exist on the public web. Going from 5/100 to 35/100 on Brand Authority alone would add 6 points to the overall score. Adding testimonials and citations would push E-E-A-T from 65 to 75+.

---

## Pages Analyzed

| URL | Title | Key GEO Issues |
|---|---|---|
| `/` | Anywhere Learning: Meaningful Learning, Wherever You Are | Duplicate Organization schema; no testimonials |
| `/shop` | Shop Activity Packs | Missing BreadcrumbList schema |
| `/shop/[slug]` (×30) | Product pages | Formulaic descriptions; no reviews |
| `/blog` | Blog | Good CollectionPage schema |
| `/blog/[slug]` (×29) | Blog posts | No research citations; narrative-first |
| `/free-guide` | 10 Life Skills Free Guide | Missing JSON-LD schema |
| `/about` | About | Missing Person schema; credentials light |
| `/faq` | FAQ | Excellent FAQPage schema |
| `/contact` | Contact | Adequate |
| `/privacy` | Privacy | Adequate |
| `/terms` | Terms | Adequate |

---

*Report generated by GEO Audit Skill, March 15, 2026*
