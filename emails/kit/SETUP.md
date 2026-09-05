# Kit (ConvertKit) Email Sequence Setup

All emails use the same branded HTML template matching the Resend transactional emails.

**Every file includes `{{ message_content }}` and `{{ unsubscribe_url }}` (Kit throws a "Template Error" without `{{ message_content }}`).** In Kit, paste the file's HTML as the custom email template, then in the Email tab type ONLY the greeting, e.g. `Hey {{ subscriber.first_name | default: "there" }},` — everything else is hardcoded in the template.

The free-guide download button is already wired to the live Vercel Blob PDF
(`Free guide - 7 Days of Real-World Learning - compressed.pdf`). No placeholder to replace.

## Sequence 1: Lead Magnet (5 emails, trial-focused)

**Current guide:** `7 Days of Real-World Learning` (one activity a day across outdoor & nature, real-world math, creativity, AI & digital, entrepreneurship, communication, and planning)

**Goal:** convert free-guide leads to the 14-day membership trial (`/start-trial`, founder rate $99/yr).

**Design:** rebuilt June 2026 in the new brand email system (rendered Dancing Script wordmark + signature, color-scheme light, bulletproof buttons, no emoji/em-dash). Paste each file into Kit's HTML editor.

**Trigger:** Subscriber receives tag `lead`
(Tag is auto-applied by the app when someone submits the free guide form)

| # | File | Delay | Subject Line | Job |
|---|------|-------|-------------|-----|
| 1 | `lead-magnet-1-welcome.html` | Immediately | Here's your free guide | Deliver + welcome |
| 2 | `lead-magnet-2-story.html` | 2 days | The kids were getting worse at life | Founder story, trust |
| 3 | `lead-magnet-3-library.html` | 5 days | 7 days was just the start | Reveal the full library |
| 4 | `lead-magnet-4-offer.html` | 9 days | Try the whole library free for 14 days | The trial offer |
| 5 | `lead-magnet-5-close.html` | 14 days | Before I stop emailing you about this | Urgency + objections |

Delays are measured from Day 0 (signup): Day 0, 2, 5, 9, 14. Whole sequence runs ~2 weeks.

Retired: `lead-magnet-2-getting-started.html`, `lead-magnet-3-shop-intro.html` (old shop-focused sequence).

## Sequence 2: Cart Abandonment — RETIRED (Jun 2026)

No cart on the site anymore. Abandoned checkouts are handled by a transactional email (Resend:
`AbandonedCheckoutMembership.tsx`) fired from the Stripe
`checkout.session.expired` webhook. Nothing applies the `cart-abandoner` tag, so the Kit
sequence never fires. Files `cart-abandon-1-reminder.html` / `cart-abandon-2-different-angle.html`
removed. Delete the Kit automation too.

## Sequence 3: Post-Purchase (old shop buyers) — RETIRED (Jun 2026)

Triggered on tag `buyer`, which the code no longer applies after the membership pivot
(purchases now apply `trial-member`, `member`, `founder`). It never fires.
Replaced by the two sequences below. `post-purchase-1-getting-started.html` and
`post-purchase-2-cross-sell.html` are kept for reference only; delete the Kit automation.

## Sequence 2b: Idea-list checklist (1 email)

**Trigger:** Subscriber receives tag `checklist-subscriber`
(Applied by the app when someone unlocks a printable on any `/ideas/[slug]` page.)

| # | File | Delay | Subject Line | Job |
|---|------|-------|-------------|-----|
| 1 | `checklist-1-welcome.html` | Immediately | Here's your checklist | Re-deliver the printable + introduce the membership |

**These people do NOT get the 7-day guide.** They are deliberately kept out of the
`lead` tag and the Lead Magnet sequence: they asked for a checklist, not a 7-day
guide. Do not write copy that assumes they have it.

**One email serves all 15 lists.** It never hardcodes a list name. It reads three
custom fields the app sets on signup:

| Field | Holds |
|-------|-------|
| `last_guide` | the list's title, e.g. "Nature Walk Checklist: 50 Ideas for Kids" |
| `last_guide_cover` | that list's cover image |
| `last_guide_download` | signed link to that list's full-colour printable (via /api/ideas/download, also unlocks the device it is opened on) |

Every one of the 15 lists has both a cover and a printable, so nothing renders
blank. Add a new idea list and the app fills these in automatically; this email
keeps working untouched.

**Also applied, for measurement only:** `checklist:{list-slug}` (one per list, no
automation hangs off it) and `from-{source}` for channel attribution.

## Sequence 3a: Trial Member nurture (2 emails)

**Trigger:** Subscriber receives tag `trial-member`
**Note:** Resend already auto-sends a welcome on day 0 and a trial-ending reminder on day 11. These two only fill the middle, no duplicates.

| # | File | Delay (after last email) | Subject Line |
|---|------|--------------------------|-------------|
| 1 | `trial-member-1-start.html` | 2 days | Where to start in your library |
| 2 | `trial-member-2-together.html` | 5 days | The part parents don't expect |

## Sequence 3b: Starter Pack buyer → membership — RETIRED (Jul 2026)

The Starter Pack was removed. No code applies the `starter-pack-buyer` tag anymore, so this
sequence never fires. Templates `starter-pack-1-start.html` / `starter-pack-2-library.html` /
`starter-pack-3-credit.html` removed. Delete the Kit automation too.

## Sequence 4: Home Educators' Appreciation Week sale (3 emails, manual broadcasts)

**Trigger:** Manual broadcasts (not an automation). Send each at the time noted.
**Audience:** All subscribers for email 1; emails 2 and 3 should EXCLUDE anyone tagged `buyer` or `home-educators-2026-buyer` so converted buyers don't get reminded.

| # | File | Send time | Subject Line |
|---|------|-----------|-------------|
| 1 | `sale-home-educators-1-launch.html` | Mon May 4, 9am PT | A small thank you, from me to you. |
| 2 | `sale-home-educators-2-reminder.html` | Sat May 9, 9am PT | Last 36 hours of the appreciation sale |
| 3 | `sale-home-educators-3-final.html` | Sun May 10, 6pm PT | Ends tonight at midnight |

**To send each one:**
1. Kit > **Broadcasts** > **New Broadcast**
2. Paste the HTML in **HTML mode** (not the visual editor)
3. Set the subject and preview text from the comment block at the top of the file
4. For emails 2 and 3, add an audience filter: exclude `buyer` and `home-educators-2026-buyer` tags
5. Schedule send

## How to add to Kit

1. Go to **Automations** → **New Automation**
2. Set trigger: "Subscriber receives tag" → select the tag
3. Add email steps with the delays shown above
4. For each email: click **Edit** → switch to **HTML** mode → paste the full HTML
5. For cart abandonment: add a **Condition** before each email checking subscriber does NOT have tag `buyer`

## Template variables

All emails use `{{ subscriber.first_name | default: "there" }}` for personalization.
This is Kit's Liquid syntax - no changes needed.

## Product images

Update the product image URLs if your bundle slugs or image filenames differ:
- `https://anywherelearning.co/products/mega-bundle-outdoor-learning.jpg`
- `https://anywherelearning.co/products/mega-bundle-real-world-math.jpg`
- `https://anywherelearning.co/products/mega-bundle-creativity.jpg`
- `https://anywherelearning.co/products/mega-bundle-ai-digital.jpg`
