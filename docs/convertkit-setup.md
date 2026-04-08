# ConvertKit (Kit) Setup Guide - Email Sequences

Step-by-step guide for setting up the Welcome and Post-Purchase email sequences in Kit for Anywhere Learning.

---

## 1. Tags to Create

Go to **Grow > Subscribers > Tags** and create the following tags.

> **Note:** All tags are applied automatically by the website's API routes. You just need to create them in Kit so they exist when the API calls reference them. Kit will also auto-create tags it hasn't seen before, but creating them manually keeps things tidy.

### Core tags

| Tag | How it's applied | Purpose |
|-----|-----------------|---------|
| `lead` | Website, when someone submits the /free-guide form | Triggers the Welcome Sequence |
| `buyer` | Website, after any purchase (Stripe webhook) | General buyer segmentation |
| `first-buyer` | Website, on a customer's first-ever purchase | Triggers the Post-Purchase Sequence |
| `bundle-buyer` | Website, when a customer buys any bundle product | Identifies high-AOV customers |

### Cross-sell tags (applied automatically based on what they bought)

| Tag | When it's applied | What cross-sell email to send |
|-----|-------------------|-------------------------------|
| `cross-sell:nature-bundle` | Buyer purchased a seasonal pack | Recommend Nature Bundle ($24.99) |
| `cross-sell:seasonal-bundle` | Buyer purchased a nature pack | Recommend Seasonal Bundle ($49.99) |
| `cross-sell:real-world-bundle` | Buyer purchased creativity, life-skills, or AI pack | Recommend Real-World Skills Bundle ($34.99) |
| `cross-sell:creativity-bundle` | Buyer purchased a real-world skills pack | Recommend Creativity Bundle ($32.99) |
| `cross-sell:master-bundle` | Buyer purchased any individual pack (fallback) | Recommend Master Bundle ($89.99) |
| *(no cross-sell tag)* | Buyer purchased the Master Bundle | Skip cross-sell - they have everything |

### Product tags

Tags like `product:master-bundle`, `product:spring-outdoor-pack`, etc. are created automatically per product purchased. You don't need to create these manually - Kit will create them on first use.

---

## 2. Sequences to Create

### Welcome Sequence (6 emails)

Go to **Send > Sequences** and create a new sequence called **"Welcome Sequence"**.

| Email # | Subject Line | Delay | Source File |
|---------|-------------|-------|-------------|
| 1 | Here's your free guide (+ how to use it) | Day 0 (immediate) | `welcome-01-guide-delivery.md` |
| 2 | I used to be a teacher. Then I stopped. | Day 2 | `welcome-02-amelies-story.md` |
| 3 | The volcano question that changed how I teach | Day 4 | `welcome-03-real-world-tip.md` |
| 4 | You don't need a curriculum (here's your permission slip) | Day 7 | `welcome-04-permission-slip.md` |
| 5 | What our families use instead of worksheets | Day 10 | `welcome-05-what-families-use.md` |
| 6 | Everything in one pack (and why families love it) | Day 14 | `welcome-06-bundle-offer.md` |

**To set up:**

1. Click **+ New Sequence**, name it "Welcome Sequence"
2. Use the **Text** template (plain text, not designed - these should feel personal)
3. Paste the copy from each source file (everything below the `---` line)
4. Set the delay between emails using the values above
5. For Email 1, the delay is 0 - it sends immediately when the sequence starts
6. Replace `{{link}}` in Email 1 with the actual download link for the free guide
7. Replace `{{blog_link}}` in Email 3 with `https://anywherelearning.co/blog`

### Post-Purchase Sequence (3 emails)

Create another sequence called **"Post-Purchase Sequence"**.

| Email # | Subject Line | Delay | Source File |
|---------|-------------|-------|-------------|
| 1 | 3 ways to get the most from your new pack | Day 2 | `purchase-01-getting-started.md` |
| 2 | Something your family might love next | Day 7 | `purchase-02-cross-sell.md` |
| 3 | Quick question about your pack | Day 14 | `purchase-03-feedback.md` |

**To set up:**

1. Click **+ New Sequence**, name it "Post-Purchase Sequence"
2. Use the **Text** template
3. Paste the copy from each source file
4. Set delays: Email 1 waits 2 days, Email 2 waits 5 more days (day 7 total), Email 3 waits 7 more days (day 14 total)

**For Email 2 (cross-sell) - setting up tailored versions:**

The website automatically tags buyers with a `cross-sell:product-slug` tag. To send the right recommendation:

**Option A (recommended): Use Kit's Visual Automation with conditional steps**
1. In the Post-Purchase automation (see Section 3), after Email 1 finishes, add a **Condition** step that checks for the cross-sell tag
2. Branch to a different email for each tag (see the table in `purchase-02-cross-sell.md`)
3. Each email version is ready to paste - just use the one matching the tag

**Option B (simpler): Use one generic email**
Just paste the "Master Bundle (fallback)" version from `purchase-02-cross-sell.md`. It works for everyone and pitches the highest-value product.

---

## 3. Visual Automations

Go to **Automate > Visual Automations** and create two automations.

### Automation 1: Welcome Sequence

1. Click **+ New Automation**
2. Name it "Welcome Sequence"
3. Set the **trigger**: "Tag is added" → select `lead`
4. Add an **action**: "Add to email sequence" → select "Welcome Sequence"
5. Add an **action**: "End this automation"
6. Save and set to **Live**

```
[Trigger: Tagged "lead"]
        |
        v
[Action: Add to Welcome Sequence]
        |
        v
[End]
```

### Automation 2: Post-Purchase (with tailored cross-sell)

1. Click **+ New Automation**
2. Name it "Post-Purchase"
3. Set the **trigger**: "Tag is added" → select `first-buyer`
4. Add an **action**: "Remove from email sequence" → select "Welcome Sequence"
5. Add an **action**: "Send email" → paste `purchase-01-getting-started.md` (Day 2 delay)
6. Add a **wait** step: 5 days
7. Add a **condition** step: "Has tag?"
   - Branch: `cross-sell:nature-bundle` → send Nature Bundle email
   - Branch: `cross-sell:seasonal-bundle` → send Seasonal Bundle email
   - Branch: `cross-sell:real-world-bundle` → send Real-World Skills Bundle email
   - Branch: `cross-sell:creativity-bundle` → send Creativity Bundle email
   - Branch: `cross-sell:master-bundle` → send Master Bundle email
   - Default (no tag): skip cross-sell
8. Add a **wait** step: 7 days
9. Add an **action**: "Send email" → paste `purchase-03-feedback.md`
10. Add an **action**: "End this automation"

```
[Trigger: Tagged "first-buyer"]
        |
        v
[Remove from Welcome Sequence]
        |
        v
[Wait 2 days]
        |
        v
[Send: Getting Started email]
        |
        v
[Wait 5 days]
        |
        v
[Condition: which cross-sell tag?]
   |         |         |         |         |
   v         v         v         v         v
 nature   seasonal  real-world creativity master
 bundle   bundle    bundle     bundle     bundle
   |         |         |         |         |
   v─────────v─────────v─────────v─────────v
        |
        v
[Wait 7 days]
        |
        v
[Send: Feedback email]
        |
        v
[End]
```

> **Why remove from Welcome Sequence?** If someone downloads the free guide and then buys within the 14-day welcome window, they'd receive both sequences at once. Removing them avoids sending product pitches (Emails 5 and 6) to someone who already bought.

---

## 4. Important Notes

### Before going live

- [ ] **Set automations to new subscribers only.** When activating, Kit asks if you want to run for existing subscribers. Choose **"Only future subscribers"** - do not run retroactively.
- [ ] **Test with a personal email.** Add yourself as a subscriber, apply the `lead` tag manually, and confirm Email 1 arrives immediately. Then apply `first-buyer` + `cross-sell:nature-bundle` and confirm you're removed from the Welcome Sequence and receive the correct cross-sell email.
- [ ] **Check the sender identity.** Go to **Settings > Email** and verify:
  - **From name:** Amelie from Anywhere Learning
  - **Reply-to email:** info@anywherelearning.co
- [ ] **Replace placeholders.** Email 1 has `{{link}}` for the guide download. Email 3 has `{{blog_link}}` for the blog URL.

### Ongoing maintenance

- **When you add new products:** They automatically slot into existing categories. The cross-sell mapping in `lib/convertkit.ts` handles the tag. No Kit changes needed unless you add a new category.
- **When you add a new category:** Update the `CROSS_SELL_MAP` in `lib/convertkit.ts` and add a new cross-sell email version in `purchase-02-cross-sell.md` + a new branch in the Post-Purchase automation.

### Complete tag flow

```
Free guide downloaded
        |
        v
Tagged: "lead" → Welcome Sequence starts (6 emails over 14 days)
        |
        v (if they buy during welcome sequence)
First purchase
        |
        v
Tagged: "buyer" + "first-buyer" + "product:[slug]" + "cross-sell:[recommendation]"
        |
        v
Removed from Welcome Sequence → Post-Purchase automation starts
  → Day 2: Getting Started email
  → Day 7: Tailored cross-sell (based on cross-sell tag)
  → Day 14: Feedback request
        |
        v (if they buy again later)
Repeat purchase → tagged "buyer" + "product:[slug]" + new cross-sell tag
  (no new sequence - they've already been through Post-Purchase)
```
