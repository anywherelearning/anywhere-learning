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

## Sequence 2: Cart Abandonment (2 emails)

**Trigger:** Subscriber receives tag `cart-abandoner`
**Condition on each email:** Subscriber does NOT have tag `buyer`
(Both tags are auto-created by the app - no manual setup needed)

| # | File | Delay | Subject Line |
|---|------|-------|-------------|
| 1 | `cart-abandon-1-reminder.html` | 1 hour | Still thinking it over? |
| 2 | `cart-abandon-2-different-angle.html` | 24 hours after email 1 | What homeschool actually looks like at our house |

## Sequence 3: Post-Purchase (2 emails)

**Trigger:** Subscriber receives tag `buyer`
**Note:** The immediate purchase confirmation (with download link + referral code) is sent via Resend. This Kit sequence is the nurture follow-up.

| # | File | Delay | Subject Line |
|---|------|-------|-------------|
| 1 | `post-purchase-1-getting-started.html` | 2 days | Your first activity (pick one, just one) |
| 2 | `post-purchase-2-cross-sell.html` | 7 days | More where that came from |

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
