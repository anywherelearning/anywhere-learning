# Kit (ConvertKit) Email Sequence Setup

All emails use the same branded HTML template matching the Resend transactional emails.
Copy the HTML from each file into Kit's HTML editor (not the visual editor).

Replace `YOUR_FREE_GUIDE_LINK_HERE` with the actual link to the free guide PDF (Vercel Blob URL for `Free guide - 7 Days of Real-World Learning.pdf`).

## Sequence 1: Lead Magnet (3 emails)

**Current guide:** `7 Days of Real-World Learning` (one activity a day across outdoor & nature, real-world math, creativity, AI & digital, entrepreneurship, communication, and planning)

**Trigger:** Subscriber receives tag `lead`
(Tag is auto-applied by the app when someone submits the free guide form)

| # | File | Delay | Subject Line |
|---|------|-------|-------------|
| 1 | `lead-magnet-1-welcome.html` | Immediately | Here's your free guide! |
| 2 | `lead-magnet-2-getting-started.html` | 2 days | One activity. That's all it takes. |
| 3 | `lead-magnet-3-shop-intro.html` | 5 days | What if learning didn't need a lesson plan? |

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
