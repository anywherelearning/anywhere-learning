// ─── Real-World Learning in 5 Days (free email course) ───
//
// Single source of truth for the free 5-day email course: the /course landing
// page, its signup route, and the homepage button all read from here.
//
// The course copy lives in Kit (5-email sequence) and in
// ~/Desktop/Anywhere Learning/Convert Kit/course-real-world-learning-explained.md.
// Separate from the 7-day free guide: this course teaches what real-world
// learning is and ends in the membership offer on Day 4.

export const COURSE = {
  name: 'Real-World Learning in 5 Days',
  shortName: 'Free 5-day course',

  // ─── Kill switch ───
  // While false, /course returns 404, POST /api/course is rejected, the page is
  // left out of the sitemap, and the homepage button is hidden, so nobody can
  // sign up into a Kit sequence that does not exist yet.
  //
  // Flip to true only once the Kit sequence is built and set to start on the
  // `course-rwl` tag (Day 1 must send the moment someone signs up).
  isLive: true,

  // Kit: signups get this tag (NOT the generic `lead` tag, which runs the
  // 7-day free guide sequence). The tag is what starts the course sequence.
  signupTag: 'course-rwl',

  ageRange: '6 to 14',
} as const;

/**
 * Whether the /course page and the homepage button render. True in production
 * only once COURSE.isLive is flipped; always true on Vercel previews and local
 * dev so the page can be reviewed before launch. Signups (POST /api/course)
 * stay gated on COURSE.isLive alone, so a preview can never tag anyone into
 * an unbuilt sequence.
 */
export function isCoursePageVisible(): boolean {
  if (COURSE.isLive) return true;
  return process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development';
}

// The five emails, as shown on the landing page. Titles match the email
// subjects so what people are promised is what lands in their inbox. Blurbs
// are summaries of each email, never lines lifted from it.
export const COURSE_DAYS = [
  {
    day: 'Day 1',
    title: 'What real-world learning actually is',
    blurb:
      'A simple definition of real-world learning, and a one-question test you can run on anything your kid does.',
  },
  {
    day: 'Day 2',
    title: 'Better at school, worse at life',
    blurb:
      'Why so many kids do well at school and still struggle with real life, and why doing beats being told.',
  },
  {
    day: 'Day 3',
    title: 'Math, writing and science in one afternoon',
    blurb:
      'How one real task can cover several subjects and life skills at once, and a five-minute way to spot it at home.',
  },
  {
    day: 'Day 4',
    title: 'The four moves I use every week',
    blurb:
      'Four practical moves to make real-world learning happen on purpose, with what to hand over at different ages.',
  },
  {
    day: 'Day 5',
    title: 'Where to go from here',
    blurb:
      'A quick recap of the week, and how to keep it going.',
  },
] as const;
