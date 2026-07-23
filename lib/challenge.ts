// ─── The 5-Day Real-World Skills Challenge ───
//
// Single source of truth for the free challenge that opens the sales funnel
// (see the Zero-to-First-Sales playbook, Move 2). The landing page, the Kit
// emails, and any on-site mention all read their dates from here, so "put the
// dates everywhere" can never drift.
//
// Cohort #1 runs the challenge Mon Aug 17 to Fri Aug 21, 2026; the founder
// offer pitched on Day 5 closes Mon Aug 24 at 11:59pm.

export const CHALLENGE = {
  name: 'The 5-Day Real-World Skills Challenge',
  shortName: '5-Day Challenge',

  // Dates for cohort #1 (2026). Labels are pre-written so copy never has to
  // format a Date at render time.
  startISO: '2026-08-17',
  endISO: '2026-08-21',
  startLabel: 'Monday, August 17',
  endLabel: 'Friday, August 21',
  rangeLabel: 'August 17 to 21',
  year: '2026',
  offerClosesLabel: 'Monday, August 24',

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
  fbGroupUrl: '',
} as const;

// The five days, themed (activities are chosen closer to launch). Kept vague on
// purpose: the promise is the shape of the week, not a locked activity list.
export const CHALLENGE_DAYS = [
  {
    day: 'Day 1',
    title: 'Something they will want to show off',
    blurb:
      'We start with the fun, shareable kind of activity, the one that makes a kid say "look what I made" before you have even finished your coffee.',
  },
  {
    day: 'Day 2',
    title: 'Real money, real math',
    blurb:
      'A hands-on money mission. The kind of everyday math that sticks because it actually buys something or plans something real.',
  },
  {
    day: 'Day 3',
    title: 'Outside and paying attention',
    blurb:
      'We head outdoors. A small, curious look at the real world that costs nothing and works anywhere you happen to be.',
  },
  {
    day: 'Day 4',
    title: 'Their project, their call',
    blurb:
      'A kid-led build. You hand over the wheel and let them plan it, run it, and own the messy middle. This is where the confidence grows.',
  },
  {
    day: 'Day 5',
    title: 'Show what you made',
    blurb:
      'The big finish. Everyone shares what their kid pulled off across the week. It is the proudest day, and the one you will want a photo of.',
  },
] as const;
