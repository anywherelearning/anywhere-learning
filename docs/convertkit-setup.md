# ConvertKit (Kit) Setup Guide — Email Sequences

Step-by-step guide for setting up the Welcome and Post-Purchase email sequences in Kit for Anywhere Learning.

---

## 1. Tags to Create

Go to **Grow > Subscribers > Tags** and create the following tags.

| Tag | How it's applied | Purpose |
|-----|-----------------|---------|
| `lead` | Automatically by the website when someone submits the /free-guide form (via `POST /api/subscribe`) | Triggers the Welcome Sequence |
| `buyer` | Automatically by the website after any purchase (via Stripe webhook) | General buyer segmentation — used to exclude buyers from lead-only campaigns |
| `first-buyer` | Automatically by the website on a customer's first-ever purchase (via Stripe webhook) | Triggers the Post-Purchase Sequence |
| `bundle-buyer` | Automatically by the website when a customer buys any bundle product | Identifies high-AOV customers for upsell exclusion or VIP treatment |
| `product:master-bundle` | Automatically by the website per product purchased | Per-product segmentation |
| `product:seasonal-bundle` | Same as above | Per-product segmentation |
| `product:real-world-skills-bundle` | Same as above | Per-product segmentation |
| `product:creativity-bundle` | Same as above | Per-product segmentation |
| `product:nature-bundle` | Same as above | Per-product segmentation |
| `product:[individual-pack-slug]` | Same as above — one tag per individual pack | Per-product segmentation |

> **Note:** All tags are applied programmatically by the website's API routes. You only need to create them in Kit so they exist when the API calls reference them.

---

## 2. Sequences to Create

### Welcome Sequence (6 emails)

Go to **Send > Sequences** and create a new sequence called **"Welcome Sequence"**.

| Email # | Subject Line | Delay | Source File |
|---------|-------------|-------|-------------|
| 1 | Here's your free guide (+ how to use it) | Day 0 (immediate) | `welcome-01-guide-delivery.md` |
| 2 | I used to be a teacher. Then I stopped. | Day 2 | `welcome-02-amelies-story.md` |
| 3 | One thing you can try this week | Day 4 | `welcome-03-real-world-tip.md` |
| 4 | You don't need permission to do this differently | Day 7 | `welcome-04-permission-slip.md` |
| 5 | What families are saying | Day 10 | `welcome-05-social-proof.md` |
| 6 | Everything in one place | Day 14 | `welcome-06-soft-sell.md` |

**To set up:**

1. Click **+ New Sequence**, name it "Welcome Sequence"
2. Paste the copy from each source file into the corresponding email step
3. Set the delay between emails using the values above (Kit uses "Wait X days" between steps)
4. For Email 1, the delay is 0 — it sends immediately when the sequence starts
5. Format links as buttons where noted (Kit's email editor supports button blocks)

### Post-Purchase Sequence (3 emails)

Create another sequence called **"Post-Purchase Sequence"**.

| Email # | Subject Line | Delay | Source File |
|---------|-------------|-------|-------------|
| 1 | 3 ways to get the most from your new pack | Day 2 | `purchase-01-getting-started.md` |
| 2 | Families who got [pack name] also loved this | Day 7 | `purchase-02-cross-sell.md` |
| 3 | Quick question about your pack | Day 14 | `purchase-03-feedback.md` |

**To set up:**

1. Click **+ New Sequence**, name it "Post-Purchase Sequence"
2. Paste the copy from each source file
3. Set delays: Email 1 waits 2 days, Email 2 waits 5 more days (day 7 total), Email 3 waits 7 more days (day 14 total)
4. For Email 2 (cross-sell): if you want category-specific versions, duplicate the sequence and swap the product recommendation per tag. Otherwise, use the generic version.

---

## 3. Visual Automations

Go to **Automate > Visual Automations** and create two automations.

### Automation 1: Welcome Sequence

1. Click **+ New Automation**
2. Name it "Welcome Sequence"
3. Set the **trigger**: "Tag is added" > select `lead`
4. Add an **action**: "Add to email sequence" > select "Welcome Sequence"
5. Add an **action**: "End this automation"
6. Save and set to **Live**

**Flow:**

```
[Trigger: Tagged "lead"]
        |
        v
[Action: Add to Welcome Sequence]
        |
        v
[End]
```

### Automation 2: Post-Purchase

1. Click **+ New Automation**
2. Name it "Post-Purchase"
3. Set the **trigger**: "Tag is added" > select `first-buyer`
4. Add an **action**: "Remove from email sequence" > select "Welcome Sequence"
5. Add an **action**: "Add to email sequence" > select "Post-Purchase Sequence"
6. Add an **action**: "End this automation"
7. Save and set to **Live**

**Flow:**

```
[Trigger: Tagged "first-buyer"]
        |
        v
[Action: Remove from Welcome Sequence]
        |
        v
[Action: Add to Post-Purchase Sequence]
        |
        v
[End]
```

> **Why remove from Welcome Sequence?** If someone downloads the free guide and then buys a product within the 14-day welcome window, they'd be receiving both sequences simultaneously. Removing them from the welcome sequence avoids sending product pitches (Emails 5 and 6) to someone who already bought.

---

## 4. Important Notes

### Before going live

- [ ] **Set automations to new subscribers only.** When activating each automation, Kit will ask if you want to run it for existing subscribers. Choose **"Only future subscribers"** — do not run retroactively.
- [ ] **Test with a personal email.** Add yourself as a subscriber, apply the `lead` tag manually, and confirm Email 1 arrives immediately. Then apply `first-buyer` and confirm you're removed from the Welcome Sequence and added to Post-Purchase.
- [ ] **Check the sender identity.** Go to **Settings > Email** and verify:
  - **From name:** Amelie from Anywhere Learning
  - **Reply-to email:** info@anywherelearning.co

### Ongoing maintenance

- **When you add new products:** Create a new `product:[slug]` tag in Kit and update the Stripe webhook code to apply it.
- **When you write new emails:** The welcome sequence has placeholders for Emails 5 and 6 (`welcome-05-social-proof.md` and `welcome-06-soft-sell.md`). Write and add these before launching the full sequence. The post-purchase sequence is complete as written.
- **Cross-sell personalization:** Start with the generic version of Email 2. Once you have enough buyers, consider duplicating the post-purchase sequence per product category and using Kit's tag-based automation triggers to route buyers to the right version.

### Tag logic summary

```
Free guide downloaded → tagged "lead" → Welcome Sequence starts
        |
        v (if they buy)
First purchase → tagged "buyer" + "first-buyer" + "product:[slug]"
        |
        v
Removed from Welcome Sequence → Post-Purchase Sequence starts
        |
        v (if they buy again later)
Repeat purchase → tagged "buyer" + "product:[slug]" (no new sequence)
```
