// ─── The 5-Day Real-World Skills Challenge ───
//
// Single source of truth for the free challenge that opens the sales funnel
// (see the Zero-to-First-Sales playbook, Move 2). The landing page, the Kit
// emails, and any on-site mention all read their dates from here, so "put the
// dates everywhere" can never drift.
//
// Cohort #1 runs the challenge Mon Sept 14 to Fri Sept 18, 2026; the founder
// offer pitched on Day 5 closes Mon Sept 21 at 11:59pm.

export const CHALLENGE = {
  name: 'The 5-Day Real-World Skills Challenge',
  shortName: '5-Day Challenge',

  // Dates for cohort #1 (2026). Labels are pre-written so copy never has to
  // format a Date at render time. Moved Aug -> Sept 14-18: the founder is
  // traveling until Aug 19 and must be present daily to run it (the challenge's
  // whole mechanic), and mid-September is the back-to-school sweet spot.
  startISO: '2026-09-14',
  endISO: '2026-09-18',
  startLabel: 'Monday, September 14',
  endLabel: 'Friday, September 18',
  rangeLabel: 'September 14 to 18',
  year: '2026',
  offerClosesLabel: 'Monday, September 21',

  // Who it's built for.
  ageRange: '6 to 14',

  // Kit segmentation: signups get this tag (NOT the generic `lead` tag), so
  // they enter the challenge sequence, not the default 7-Activities funnel.
  // This tag's count is the playbook's #1 scoreboard metric (challenge signups).
  signupTag: 'challenge-signup',

  // The pop-up Facebook group is created by Amelie in Week 2. Until the URL is
  // pasted here, the signup success state simply points people to their inbox
  // (the Kit welcome email carries the group link). Leave empty to hide any
  // direct "join the group" button.
  fbGroupUrl: 'https://www.facebook.com/groups/26943632858644725',
} as const;

// The five days, themed for the landing page. Kept vague on purpose (the promise
// is the shape of the week, not a locked activity list); the daily Kit emails
// name the specific activities. Matches the cohort-1 lineup: Directions
// Challenge, one Outdoor STEM card, Family Debate Night, Pack Like a Pro, and
// The $20 Family Feast.
export const CHALLENGE_DAYS = [
  {
    day: 'Day 1',
    title: 'A game that ends in laughter',
    blurb:
      'We start light and silly. A quick game that has the whole family cracking up, and quietly teaches the one skill school never grades.',
  },
  {
    day: 'Day 2',
    title: 'Outside, building and testing',
    blurb:
      'We head out and make something real with whatever nature hands you. Real engineering, the trial-flop-fix kind, no kit required.',
  },
  {
    day: 'Day 3',
    title: 'A friendly family face-off',
    blurb:
      'Everyone picks a side and makes their case, even the little ones. It is loud, it is funny, and it builds the quiet art of saying why.',
  },
  {
    day: 'Day 4',
    title: 'They take the lead',
    blurb:
      'You hand over the wheel and let your kid run a real thing start to finish. Sitting on your hands is the whole point, and where the confidence grows.',
  },
  {
    day: 'Day 5',
    title: 'A real money mission, and a feast',
    blurb:
      'The big finish. Your kid takes real money on a real mission and pulls off a little celebration for the whole family. The proudest day, and the one you will want a photo of.',
  },
] as const;
