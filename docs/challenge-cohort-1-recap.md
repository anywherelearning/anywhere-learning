# 5-Day Challenge, Cohort 1: Recap

September 14 to 18, 2026. Written September 21, from Kit, Meta Ads Manager, Stripe and the Facebook group.

## The funnel in one table

| Step | Count | Notes |
|---|---|---|
| Meta ad spend | $113.69 | One ad, August 22 to September 14 |
| People reached by the ad | 2,244 | 3,964 impressions, frequency 1.77 |
| Link clicks from the ad | 257 | 6.48% click rate, $0.44 per click |
| Landing page views | 197 | $0.58 each |
| Leads reported by Meta | 85 | $1.34 per lead, 43% of landing page views |
| Invite email sent (existing list) | 271 | Sept 6. 72 opened, 8 clicked to the challenge page |
| Challenge signups in Kit | 93 | 86 still active, 3 unsubscribed, 1 typo duplicate, 3 more later |
| New to the list because of the challenge | 87 | The other 6 were already subscribers. Meta's 85 leads account for nearly all of these |
| Signups from the invite email | 4 | 8 clicks became 4 signups |
| Cost per new subscriber | $1.31 | Ad spend divided by 87 |
| Opened at least one daily email | about 30 | Open rates ran 34% on Day 1 down to 27% on Day 5 |
| Clicked from a daily email to the group | 5 | Across the whole week |
| Families who posted in the group | 4 | 5 comments total |
| Families who posted more than once | 1 | Kelsey, Days 1 and 2 |
| Opened the Friday pitch | 25 | 28%. One click to start a trial |
| Opened the Sunday winners email | 19 | 22%. No clicks |
| Trials started by challenge signups | 0 | Kelsey's membership came from the prize, not the pitch |
| Free years given | 2 | Karen Mark by draw, Kelsey Bouchard for showing up most |

List growth for the month around the challenge, August 22 to September 21: 111 new subscribers, 4 cancellations, 366 total. The challenge accounts for roughly 80 of those 111.

## What the numbers say

**The challenge is a list-growth machine, and a cheap one.** 87 new subscribers in thirteen days for $113.69, about $1.31 each. That is the best two weeks of growth the list has had, and the cost per subscriber is low enough to scale several times over. For that alone it was worth running.

**The ad itself was unusually good.** A 6.48% click rate is roughly three times what a typical Facebook ad gets, and 43% of the people who landed on the site signed up. Both numbers say the creative and the landing page are right. Do not rewrite them for cohort 2, just spend more behind them.

**It was not a conversion machine, and it was never going to be at this size.** 93 signups, 30 readers, 4 posters, 0 trials. Each step lost two thirds or more. That is roughly what a free challenge does with a cold list. The way to get sales out of it is a bigger top of funnel and a shorter path to the offer, not better emails.

**The emails were the ceiling, not the group.** A third of signups opened each daily email. The group could only ever be a subset of those 30 people, and 4 posting is in the normal range for 30 readers. The group did not underperform. The list did what cold lists do.

**Nobody used the emails to reach the group.** Five clicks all week. People who commented already had the group open from the welcome email. The daily emails pulled no one new into the thread.

**Friday 6pm was the wrong time for the pitch.** 28% opened it, which is fine, but it landed in the middle of the feast and got one click. Sunday's email, with the offer restated and a warmer opening, was opened less and clicked zero times. By Sunday the offer had been seen twice by the same 25 people and ignored by the same 60.

**Kit's source tags undercounted the ad.** Kit shows 77 signups "from the site banner" and only 4 "from Facebook," but the banner link carries an explicit `?source=site-banner` that overwrites the visitor's first touch. Most of those 77 arrived from the ad and then clicked the banner. Meta's 85 leads is the number to trust. This is a code fix before cohort 2, see below.

## What worked

- The ad. $1.31 per subscriber with a 6.48% click rate. Keep the creative, keep the targeting, raise the budget.
- The site banner as the on-page conversion point. 43% of landing page views became signups.
- The activities. The four families who did them loved them. Karen's kid asked to go again, Kelsey's daughter wants the drawing game weekly, Michelle's shapes matched on the first try, Vickie ran it without correcting the first draft. The content is right.
- The daily videos. Posting a short video instead of a text post gave the group a face. No view counts to prove it, but nobody complained about instructions and the four posters followed them exactly.
- Replying to every comment within the hour. Small group, but everyone who posted got a personal reply and two of them replied back.
- Giving two prizes. It cost one extra seat and turned the most engaged family into a founding member.
- The email design. Every email rendered cleanly, opens held above 25% all week, and only 3 people unsubscribed across nine sends.

## What did not work

- **Two channels.** Email had the activity, Facebook had the thread. Anyone who did not join the group in the first hour never went back. The group added friction without adding reach.
- **The ask was a public photo.** Posting your kid's drawing to strangers is a bigger step than doing the activity. Most families who read the email probably did Day 1 and never posted.
- **No pull-back after Day 1.** Three families posted on Monday and nothing brought them back Tuesday. The Day 2 email went to everyone identically.
- **The pitch timing.** Friday evening, once, then a restatement on Sunday morning. Two touches on a weekend to people who had mostly stopped opening.
- **Promo codes were not created before the winner emails went out.** Karen hit an invalid code. Kelsey signed up and paid $99 instead, which took a refund, a new subscription, a Kit tag fix and a Clerk fix to unwind. About an hour of Sunday, plus $3.09 in Stripe fees.
- **Placeholders in Kit templates.** Emails 2 and 9 needed hand edits inside Kit's template editor on the day, because the API cannot touch templates. Every one of those edits was a chance to send a placeholder.
- **Kit's API quirks.** Updating a broadcast's subject silently wiped its preview text. Two email 9 drafts existed because a failed API call had actually succeeded.

## Changes for cohort 2

In order of how much they matter.

1. **One channel.** Run it entirely by email. Each daily email carries the activity and ends with "reply to this email with a photo or one line." Replies are the entries. No group to join, no second place to remember, and every reply lands in your inbox where you already are. Keep the Facebook group only as a place to announce and to reuse the videos.
2. **Same ad, three times the budget.** At $1.34 a lead, $350 over 14 days buys roughly 250 signups. At this cohort's rates that is 80 readers, 12 posters, and a real chance of 2 to 4 trials, which pays for the ad twice over at the founder rate. Watch frequency: it reached 1.77 on $114, so a bigger budget needs a broader audience or it will start showing the same people the same ad.
3. **Fix attribution before the ad goes live.** Internal links like the banner and the hero sticker must not overwrite first-touch source. Otherwise cohort 2's ad signups will again show up as "site banner" in Kit and you cannot compare channels.
4. **A personal reply on Day 1 is the retention lever.** Whoever replies on Day 1 gets a two-line personal email from you that night: "Saw your drawing. Tomorrow needs sticks, see you then." That is what brings Karen and Vickie back on Day 2.
5. **Pitch earlier and on a weekday.** Mention the membership plainly on Day 3 (Wednesday), pitch on Day 5 morning inside the activity email, and send the last-call on Monday morning. Never on a Friday night.
6. **Codes and prizes ready before the challenge opens.** Run the winner-codes script on Sunday before Day 1, with placeholder codes if the winners are unknown. Hyphen-free codes only.
7. **No placeholders in templates.** Write emails 2 and 9 so the only variable is the winner name, and set that in the broadcast body (the greeting slot) rather than in the template. Or send email 9 from a fresh broadcast on the Sunday instead of a pre-built template.
8. **Fix the Stripe webhook first.** Add `charge.refunded` to the production endpoint's events. It did not fire on Kelsey's refund, which is why her old subscription and tags had to be cleaned up by hand.
9. **Decide the prize rule up front and say it once.** "One free year, drawn from everyone who replies at least three days" is clearer than daily entries, and it rewards the behaviour you want.

## Assets ready to reuse

- The ten Kit HTML templates and their broadcasts, all in `emails/kit-ready/challenge-*.html`.
- The five daily video scripts and captions, plus welcome, wrap, draw-day and winner posts, on the scripts page and in `docs/challenge-fb-group-posts.md`.
- The Meta ad, the site banner, the landing page and the five-day collage image.
- The winner-codes script at `scripts/create-winner-codes.ts`.
- The challenge config in `lib/challenge.ts`. Change the dates and the kill switch and everything else follows.
