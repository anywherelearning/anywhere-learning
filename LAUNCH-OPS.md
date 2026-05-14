# Anywhere Learning — Launch Operations Guide

## Weekly Rhythm (4-6 hrs/week with AI)

| Day | Task | Time |
|-----|------|------|
| **Mon** | Write blog post with Claude (topic + SEO keyword → draft → edit → publish). Auto-newsletter fires via RSS-to-email. | 45 min |
| **Tue** | Check Stripe/GA4 dashboard. Reply to customer emails. | 15 min |
| **Wed** | Work on next activity pack (the irreplaceable creative work). | 2-3 hrs |
| **Thu** | Community engagement — answer 2-3 questions in homeschool Facebook/Reddit groups. | 20 min |
| **Fri** | Review what's working. Jot ideas for next week. | 15 min |

Pinterest runs on autopilot (RSS → Tailwind). Emails run on autopilot (sequences + RSS newsletter). Cross-sells run on autopilot. Reviews collect themselves.

---

## Monthly Cadence

| Task | Frequency | Time |
|------|-----------|------|
| New blog post | 1/week | 45 min (with AI) |
| Newsletter to list | Auto (RSS-to-email) | 0 min |
| New Pinterest pins | Auto (RSS → Tailwind) or batch | 15 min |
| New product launch | 1-2/month | 1-2 hrs |
| Review Stripe/GA4/Kit metrics | 1/week | 15 min |
| Community engagement | 2-3x/week | 20 min total |
| Reply to customer emails | As needed | 15 min |

---

## AI Time Savings

| Task | Without AI | With AI | How |
|------|-----------|---------|-----|
| Blog post | 2-3 hrs | 30-45 min | Claude writes draft from a topic + SEO keyword. Amelie edits voice/adds personal stories. |
| Pinterest pin copy | 30 min | 5 min | Claude generates 5-8 pin titles + descriptions from a blog post. |
| Product descriptions | 1 hr | 15 min | Claude writes from the PDF content. |
| Email copy | 30 min | 10 min | Claude drafts, Amelie tweaks tone. |
| New product code setup | 30 min | 5 min | Claude updates all code files, runs stripe:sync, seeds DB. |

---

## Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **Tailwind** | Pinterest scheduling + Communities | ~$15/mo |
| **Canva Pro** | Pin templates, product covers | ~$13/mo |
| **ConvertKit (Kit)** | Email list, automations | Free up to 10k subscribers |
| **GA4** | Traffic & conversion tracking | Free |
| **Stripe Dashboard** | Revenue, refunds, tax | Free |
| **Google Search Console** | SEO performance, indexing | Free |

---

## ConvertKit Automations

All tags below are auto-applied by the app's code (Stripe webhook + ConvertKit API). You only need to build the email sequences in Kit's visual automation builder.

### 1. Lead Magnet Welcome Sequence

**Trigger:** Subscriber receives tag `lead`
**Goal:** Deliver the free guide, build trust, introduce the shop.

| Step | Timing | Email |
|------|--------|-------|
| 1 | Immediate | **"Here's your free guide!"** — Attach or link the free guide PDF. Warm welcome, introduce yourself. |
| 2 | Day 2 | **"Getting started tips"** — Pick one activity from the guide, walk them through it. Show it's easy and fun. |
| 3 | Day 5 | **"Families are loving these..."** — Soft intro to the shop. Highlight 1-2 popular packs. Link to `/shop`. |
| 4 | Day 10 | **"The bundle that has everything"** — Introduce a mega bundle with savings framing. Link to bundle product page. |

**Exit condition:** Remove from sequence if subscriber receives tag `buyer`.

---

### 2. Post-Purchase Nurture (First-Time Buyers)

**Trigger:** Subscriber receives tag `first-buyer`
**Goal:** Onboard, build habit, earn a review.

| Step | Timing | Email |
|------|--------|-------|
| 1 | Immediate | **"Welcome to the family!"** — Warm welcome, remind them to download at `/account/downloads`. |
| 2 | Day 3 | **"Try one this weekend"** — Pick a simple activity, suggest trying it. Low-pressure encouragement. |
| 3 | Day 7 | **"How's it going?"** — Ask for feedback. Link to leave a review on the product page. "Hit reply — I'm a real person." |

---

### 3. Cross-Sell Sequences (Automated Product Recommendations)

The Stripe webhook automatically tags each buyer with a `cross-sell:[bundle-slug]` tag based on what they purchased. The mapping:

| They bought from category... | Tag applied | Recommended bundle |
|------------------------------|-------------|--------------------|
| AI & Digital | `cross-sell:creativity-mega-bundle` | Creativity Mega Bundle |
| Creativity Anywhere | `cross-sell:real-world-mega-bundle` | Real-World Mega Bundle |
| Outdoor Learning | `cross-sell:creativity-mega-bundle` | Creativity Mega Bundle |
| Real-World Math | `cross-sell:creativity-mega-bundle` | Creativity Mega Bundle |
| Communication & Writing | `cross-sell:creativity-mega-bundle` | Creativity Mega Bundle |
| Entrepreneurship | `cross-sell:real-world-mega-bundle` | Real-World Mega Bundle |
| Planning & Problem-Solving | `cross-sell:real-world-mega-bundle` | Real-World Mega Bundle |
| Start Here | `cross-sell:outdoor-toolkit-bundle` | Outdoor Toolkit Bundle |

**For each bundle, create one automation:**

**Automation A: Cross-sell Creativity Mega Bundle**
- **Trigger:** Subscriber receives tag `cross-sell:creativity-mega-bundle`
- **Condition:** Does NOT have tag `bundle-buyer`
- **Wait:** 5 days
- **Email:** "You might love this too..." — Recommend the Creativity Mega Bundle. Mention it pairs well with what they already bought. Show savings vs. buying individual packs. Link to `/shop/creativity-mega-bundle`.

**Automation B: Cross-sell Real-World Mega Bundle**
- **Trigger:** Subscriber receives tag `cross-sell:real-world-mega-bundle`
- **Condition:** Does NOT have tag `bundle-buyer`
- **Wait:** 5 days
- **Email:** Same structure, recommend Real-World Mega Bundle. Link to `/shop/real-world-mega-bundle`.

**Automation C: Cross-sell Outdoor Toolkit Bundle**
- **Trigger:** Subscriber receives tag `cross-sell:outdoor-toolkit-bundle`
- **Condition:** Does NOT have tag `bundle-buyer`
- **Wait:** 5 days
- **Email:** Same structure, recommend Outdoor Toolkit Bundle. Link to `/shop/outdoor-toolkit-bundle`.

**Automation D: Cross-sell Seasonal Bundle (fallback)**
- **Trigger:** Subscriber receives tag `cross-sell:seasonal-bundle`
- **Condition:** Does NOT have tag `bundle-buyer`
- **Wait:** 5 days
- **Email:** Recommend the current seasonal bundle.

---

### 4. Cart Abandonment Recovery

**Trigger:** Subscriber receives tag `cart-abandoner`
**Goal:** Recover the sale with a warm, on-brand reminder.

| Step | Timing | Email |
|------|--------|-------|
| 1 | 1 hour | **Condition:** Does NOT have tag `buyer`. **"Still thinking it over?"** — Warm, no pressure. Remind them what was in their cart. Link back to `/shop`. |
| 2 | 24 hours | **Condition:** Still does NOT have tag `buyer`. **"Your cart is waiting..."** — Different angle. Maybe highlight a testimonial or the money-back guarantee. |

---

### 5. Review Collection

**Trigger:** Subscriber receives tag `buyer`
**Goal:** Collect testimonials/reviews for social proof.

| Step | Timing | Email |
|------|--------|-------|
| 1 | Wait 10 days | **"Quick question..."** — "Have you tried [activity] yet? I'd love to hear how it went. Hit reply or leave a quick review." Keep it personal and short. |

---

### 6. Membership Sequences (if/when membership launches)

Tags auto-applied by the app:
- `member` + `member-monthly` or `member-annual` — on subscription start
- `member-canceling` — when they set cancel-at-period-end
- `member-canceled` — when subscription actually ends

**Win-back automation:**
- **Trigger:** Subscriber receives tag `member-canceling`
- **Wait:** 2 days
- **Email:** "We'll miss you" — Ask why, offer help, mention what's coming next month.

**Re-engagement:**
- **Trigger:** Subscriber receives tag `member-canceled`
- **Wait:** 14 days
- **Email:** "The door's always open" — Highlight new content added since they left. Offer a comeback discount.

---

## All ConvertKit Tags (Auto-Created by App)

These tags are applied automatically by the app's code. ConvertKit creates them on first use — no manual tag setup needed.

| Tag | Applied when | Purpose |
|-----|-------------|---------|
| `lead` | Free guide form submitted | Triggers welcome sequence |
| `buyer` | Any purchase completed | Marks as customer, exits cart-abandonment |
| `first-buyer` | First-ever purchase | Triggers post-purchase nurture |
| `bundle-buyer` | Purchased any bundle | Excludes from cross-sell |
| `product:[slug]` | Each product purchased | Segmentation (e.g. `product:spring-nature-walk`) |
| `cross-sell:[bundle]` | Each purchase | Triggers cross-sell email for recommended bundle |
| `cart-abandoner` | Checkout session expired | Triggers cart recovery emails |
| `member` | Subscription started | Membership segment |
| `member-monthly` | Monthly sub started | Plan-specific segment |
| `member-annual` | Annual sub started | Plan-specific segment |
| `member-canceling` | Set to cancel at period end | Triggers win-back |
| `member-canceled` | Subscription ended | Triggers re-engagement |

---

## First Month Priorities (in order)

1. **Set up ConvertKit automations** — Lead magnet sequence (#1) and cart abandonment (#4) are highest priority. Cross-sell (#3) and review collection (#5) come next.
2. **Get 3-5 blog posts live** — Long-term SEO investment. Target low-competition homeschool keywords.
3. **Pin every product + blog post** — 30-50 pins in the first month. Pinterest compounds over 3-6 months.
4. **Grow email list** — Drive traffic to the free guide. Aim for 100 subscribers in month 1.
5. **Submit to 3-5 homeschool directories** — One-time task, long-tail backlinks (Homeschool.com, TheHomeSchoolMom, Secular Homeschool).
6. **Launch 1-2 new products** — Fresh catalog signals to returning visitors.
7. **Set up Pinterest Rich Pins** — Validate domain in Pinterest Business so product pins show price automatically.

---

## Seasonal Promotions Calendar

Pre-schedule these in ConvertKit. Write the emails once, set send dates.

| When | Promo | Angle |
|------|-------|-------|
| **August** | Back to Homeschool | "Start the year with everything you need" — push mega bundles |
| **November** | Black Friday / Cyber Monday | 30-40% off bundles (Stripe coupon with expiry) |
| **January** | New Year, New Start | "Fresh start" — push Start Here packs + free guide |
| **March/April** | Spring / Outdoor Season | Outdoor learning packs, nature activities |
| **June** | Summer Learning | "Keep curiosity alive all summer" — bundles for road trips, travel |

---

## Build-Once Automations (Code Side)

Features to build into the site so they run without Amelie:

| Feature | Status | What it does |
|---------|--------|-------------|
| RSS feed for blog | To build | Powers auto-newsletter + auto-Pinterest |
| Auto-generated OG images | To build | Blog/product images without Canva |
| Referral program on success page | To build | "Share with a friend, you both get 15% off" |
| Post-purchase review request | Kit automation | 10-day delay email asking for review |
| Cross-sell emails | Kit automation | Personalized bundle recommendation per buyer |
| Cart abandonment emails | Kit automation | 1hr + 24hr recovery emails |
| Seasonal promo emails | Kit scheduled | Pre-written, pre-scheduled in Kit |
