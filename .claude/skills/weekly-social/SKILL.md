---
name: weekly-social
description: Weekly IG + Facebook content engine for Anywhere Learning. Audits Meta Business Suite data per platform, checks what footage Amelie has, then creates the week's posts from the CONTENT-PLAN-2026-09 batch order (3 IG reels Tue/Thu/Sat with a spoken keyword, 2 FB posts Wed/Fri), tailored per platform. Run Monday mornings.
---

# Weekly Social Content Engine

Produce this week's social plan for Anywhere Learning: 3 Instagram reels (Tuesday, Thursday, Saturday, 4:30 to 5:00pm PT) and 2 Facebook posts (Wednesday and Friday). Data first, then creation. Amelie approves before anything is filmed or posted.

**Since Sep 21, 2026 the reels follow `CONTENT-PLAN-2026-09.pdf`** (Desktop `Anywhere Learning/` + repo `notes/`): Kallaway's plan, three batches of ten videos, three pillars (Can they do this? 50% / From the classroom 25% / Hand over the wheel 25%), four keywords (CAPABLE default, QUIZ on classroom reels, a topic word on single-activity application reels, TRY only on full-activity reels once the VSL is live). The metric is **email signups per video** (Kit tag per keyword), not views or follows. Take the next reels from the plan's batch order; bend every line to what actually happened.

## Step 0: Setup
- `git pull origin main` first.
- **Footage check, before any reel is written.** Look up the next 3 videos in the plan's batch order and ask Amelie, in one message: does she have the footage each one needs, and if not, what footage does she have from the week? Wait for the answer. Keep the plan's FORMAT (pillar, hook structure, keyword, text-visual-spoken layering) and swap only the topic to match the footage she actually has. Never write a reel around footage that doesn't exist.
- Read memory: reel history, reels strategy, voice rules, core problem positioning. These are standing context, not suggestions.
- Read the latest `WEEKLY-SOCIAL-*.md` and `REELS-AUDIT-*.md` on `~/Desktop/Anywhere Learning/` to know what was planned last week.
- Read `~/Desktop/Anywhere Learning/REEL-QUEUE.md`: reels Amelie already approved with footage confirmed. Slot any whose target date falls in this week (replacing the next plan video in the same pillar), keep their wording, remind her of any ManyChat automation they still need, and remove them from the queue once posted.

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

3 IG reels + 2 FB. Every post must pass, in order:
1. **Two-question filter**: Would it spread (feeling, tension, curiosity)? Does the person who loves it want what we sell?
2. **No duplicates**: cross-check reel history memory AND Meta live data.
3. **Business intention tag** (write it on the plan): growth / email list / membership / nurture / pure joy, plus the plan's pillar and keyword. FB versions favor real-moment photo + text (tested Sep 2026) or native reels with debate closers.
4. **Hook layering** (reels): visual + text + audio hook in the first 2 seconds; the text hook must NOT repeat the spoken line. Lead with the punchline.
5. **Structure**: under 30s (target 12-20s), ending loops to the hook, question closer (IG = answerable, FB = debatable, often "Be honest").
6. **One keyword per reel, spoken once at the very end, then pinned** ("Comment CAPABLE and I'll send it"). ManyChat auto-DMs the link; Kit tags `from-ig-<keyword>`. The keyword is never the point of the video and never appears before the last line. **No links, ever,** in a reel or caption; links live in the DM, stories and bio. Match the keyword to the reel (CAPABLE / QUIZ / topic word / TRY per the plan).
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
1. Write the full plan to `~/Desktop/Anywhere Learning/WEEKLY-SOCIAL-<YYYY-MM-DD>.md` (Monday's date). Per post: platform, day/time, plan video number and pillar, format, text cards or copy, spoken closing keyword line, caption, pinned comment, business intention, filming needs. Lead the file with the audit summary (5 lines max) and the week's one lesson.
2. Send the file to Amelie (SendUserFile).
3. Update the reel-history memory with last week's actual results (including Kit signups per keyword when available) and this week's planned topics. After every 10 videos, run the plan's batch review (rank by signups, one hypothesis, change one brick, remake the top two).
4. In chat: outcome first (the one lesson + the 4 posts in one line each), then wait for her edits. Do not mark anything as final until she approves.
