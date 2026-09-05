---
name: daily-promo
description: Daily promotion reminder for Anywhere Learning. Reads promo-map.md, checks what day it is, and tells Amelie exactly where to promote today (which Facebook group, which channel), what kind of post each place allows, and drafts the post copy when useful. Run every weekday morning.
---

# Daily Promo Reminder

Tell Amelie where to promote Anywhere Learning today. Short, actionable, zero decisions left for her to make. This is a reminder plus a ready-to-use draft, not a strategy session.

## Step 0: Setup
- `git pull origin main` first.
- Run `date` to get the real day of week (never trust stale context).
- Read `promo-map.md` in this skill folder. It is the source of truth for every group and channel: rules, allowed days, what to promote there.
- Read memory: core problem positioning, voice rules, audience-is-all-families.

## Step 1: Build today's list
From promo-map.md, select:
1. Every Facebook group whose promo day is today (e.g. "Share Your Stuff Saturday" threads).
2. Any group where today is a good value-post day per its rotation notes (value posts build standing for later promo days).
3. Any non-FB channel scheduled for today.
4. Anything time-sensitive from the "Current campaigns" section (sale, challenge, launch) that overrides the default rotation.

Skip anything done in the last entry of the log (Step 4). Never suggest promoting the same thing in the same group twice in one week.

## Step 2: Deliver the reminder
One short message, formatted like:

**Today (Tuesday): 2 places**
1. **[Group name]** (link) — promo allowed today under [rule]. Post: [what to share + 2-3 sentence draft in her voice].
2. **[Channel]** — [action].

Draft rules (absolute): casual mom-to-mom, no em dashes, no emojis, never kids' names, promote without trashing alternatives, audience is ALL families. Follow each group's rules exactly. If a group only allows link-in-comments, say so in the reminder.

If today has zero promo slots, say so in one line and suggest the single best value-post opportunity instead (a helpful non-promotional answer or resource in one target group). Value posts are the long game.

## Step 3: Rotation fairness
Over a week, every group in promo-map.md with a weekly promo day should appear once. If Amelie skipped a day, do not pile the missed items onto today; just resume the rotation.

## Step 4: Log it
Append one line to `promo-log.md` in this skill folder: date, places suggested. On the next run, read the last 7 days of the log to avoid repeats. Keep the log trimmed to the last 30 days.

## Maintenance
When Amelie says a group changed its rules, went quiet, or she left it, update promo-map.md immediately in the same conversation. promo-map.md is data; edit it freely without ceremony.
