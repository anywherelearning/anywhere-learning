---
name: weekly-social
description: Weekly IG + Facebook content engine for Anywhere Learning. Audits Meta Business Suite data per platform, analyzes what works on IG vs FB, then creates the week's posts (2 IG reels Tue/Thu, 2 FB posts Wed/Fri), tailored per platform. Run Monday mornings.
---

# Weekly Social Content Engine

Produce this week's social plan for Anywhere Learning: 2 Instagram posts (Tuesday and Thursday, 4:30 to 5:00pm PT) and 2 Facebook posts (Wednesday and Friday). Data first, then creation. Amelie approves before anything is filmed or posted.

## Step 0: Setup
- `git pull origin main` first.
- Read memory: reel history, reels strategy, voice rules, core problem positioning. These are standing context, not suggestions.
- Read the latest `WEEKLY-SOCIAL-*.md` and `REELS-AUDIT-*.md` on `~/Desktop/Anywhere Learning/` to know what was planned last week.

## Step 1: Audit (both platforms, separately)
Open Meta Business Suite content insights (business.facebook.com/latest/insights/content) in Amelie's Chrome (claude-in-chrome tools). If Chrome/extension is unavailable, say so plainly, draft from memory instead, and mark the plan "audit skipped".
- Range: last 30 days.
- Pull the table twice: sorted by **views** and sorted by **follows** (follows = the metric that matters most; views = reach).
- Split every reading by platform: rows tagged `anywherelearning` = IG, `Anywhere Learning` = FB, or Crossposted.
- Record for last week's posts: views, reach, watch time, comments, shares, saves, follows.
- Note divergences: a post that worked on one platform and died on the other is the most valuable data point of the week.

## Step 2: Analyze
Answer in writing, per platform:
1. What won on IG this month, and why (format, hook, topic)? What won on FB?
2. Did last week's posts beat, match, or miss the 30-day median? What's the single lesson?
3. Watch-time check: anything under 8s average hold has a hook problem, name it.
4. Follows check: which post converted viewers to followers; which got reach but zero follows.

Known platform physics (update these if the data contradicts them):
- IG rewards: handover story reels, save-worthy lists, provocative-but-warm hooks, 9-14s holds.
- FB rewards: first-person narrative text, vicarious risk, debate questions ("Be honest..."), shares.

## Step 3: Monthly deep ritual (first run of each calendar month only)
1. IG search: check nameplate rankings for "life skills", "real world learning", "life skills for kids", "raising capable kids".
2. Keyword result grids for 2 niche terms: what formats rank (extract alt text if thumbnails don't render).
3. Competitor check (2 accounts, rotate through @home_ed_discovery, @raisingkidsathome, @dinnertablefamily, plus one new): popular posts, last 3 months, viral conversion ratio = views at least 2x the account's followers. Only those are format lessons.
4. Remind Amelie of the 2-minute phone step: type the niche terms in the IG app, screenshot the suggested searches.
5. Save findings to `~/Desktop/Anywhere Learning/CONTENT-RESEARCH-<MON><YYYY>.md`.

## Step 4: Create the week's posts
2 IG + 2 FB. FB posts may be (a) FB-tailored versions of the IG reels (native upload, rewritten caption) or (b) entirely different content when the IG piece won't translate; decide per post from the Step 2 analysis.

Every post must pass, in order:
1. **Two-question filter**: Would it spread (feeling, tension, curiosity)? Does the person who loves it want what we sell?
2. **No duplicates**: cross-check reel history memory AND Meta live data.
3. **Business intention tag** (write it on the plan): growth / email list / membership / nurture / pure joy. Weekly shape: 1 pure growth story, 1 growth + pinned CAPABLE, FB versions favor debate/nurture.
4. **Hook layering** (reels): visual + text + audio hook in the first 2 seconds; the text hook must NOT repeat the spoken line. Lead with the punchline.
5. **Structure**: under 30s (target 12-20s), ending loops to the hook, question closer (IG = answerable, FB = debatable, often "Be honest").
6. **No asks inside reels.** Conversion lives in the pinned comment (CAPABLE, or QUIZ only when it truly fits), stories, and bio. Never "link in bio" in a reel or caption.
7. **Format rotation**: every 4th reel uses a format not used in the past month (face-to-camera and funny/relatable are the standing gaps).
8. **Real footage/answers only**: no fabricated anecdotes. If an idea needs footage or a real kid moment that doesn't exist yet, flag it as "needs filming" with a shot list.

Voice rules (absolute): no em dashes anywhere, no emojis, never the kids' names ("my son", "my daughter", or ages), casual mom-to-mom, promote without trashing alternatives, audience is ALL families (homeschool is a keyword, never the sole audience).

## Step 4b: Stories plan (IG)
Stories are the follower-only layer: human connection, one-tap engagement, and ALL conversion links (links are allowed and unpenalized here, never in reels). Include 4-5 story frames in every weekly plan, following this shape:
- Day after each reel: re-share it to stories, usually with a link sticker (guide, quiz, or membership, matched to the reel's topic) or a poll sticker priming the topic.
- Mid-week: one behind-the-scenes or question-box frame (question answers feed future content; tell Amelie to reply to a few personally).
- Weekend: one pure conversion frame (text on photo + link sticker, quiz or free guide).
- Optional: one human-layer frame (real moment, no strategy).
Keep frames casual and unpolished; stories are where imperfect is correct.

## Step 5: Deliver
1. Write the full plan to `~/Desktop/Anywhere Learning/WEEKLY-SOCIAL-<YYYY-MM-DD>.md` (Monday's date). Per post: platform, day/time, format, text cards or copy, caption, pinned comment if any, business intention, filming needs. Lead the file with the audit summary (5 lines max) and the week's one lesson.
2. Send the file to Amelie (SendUserFile).
3. Update the reel-history memory with last week's actual results and this week's planned topics.
4. In chat: outcome first (the one lesson + the 4 posts in one line each), then wait for her edits. Do not mark anything as final until she approves.
