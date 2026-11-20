/**
 * Two December/January sign-up lists, both feeding the January plan
 * (~/Desktop/Anywhere Learning/BUSINESS-REVIEW-2026-11.md):
 *
 *   1. The free launch workshop (/workshop): one 40-minute Zoom, Thursday
 *      Jan 7 2027 at 8pm ET, walking through the Budget Challenge. Signups get
 *      the `workshop-2027-01` Kit tag (reminders + replay go out as Kit
 *      broadcasts to that tag) and a confirmation email from the site.
 *
 *   2. "Tell me when it opens" for the 6-week group program A Reason to Learn
 *      (/a-reason-to-learn): the `rtl-interested` Kit tag. Sign-ups open
 *      Wed Jan 13; this list hears first. The same URL becomes the sales page.
 *
 * The workshop Zoom link lives in the WORKSHOP_ZOOM_URL env var, never in the
 * repo (it's public). It's only ever put in emails, never on a page or in the
 * public calendar file.
 */

export const WORKSHOP = {
  /** Eastern date of the session. */
  date: '2027-01-07',
  durationMin: 40,
  title: 'One Real Task: a free live workshop with Amelie',
  shortTitle: 'One Real Task, live',
  guideName: 'The Budget Challenge',
  /** Starts no sequence; reminders and the replay are Kit broadcasts to it. */
  signupTag: 'workshop-2027-01',
  /** sent_emails kind for the confirmation (one per address). */
  confirmKind: 'workshop_confirm:2027-01-07',
} as const;

export const REASON_TO_LEARN = {
  name: 'A Reason to Learn',
  subtitle: '6 Weeks of Real-World Learning with Amelie',
  interestTag: 'rtl-interested',
  /** Sign-ups open (Eastern). */
  opensLabel: 'Wednesday, January 13',
  runsLabel: 'Monday, February 1 to Sunday, March 14',
  capFamilies: 15,
} as const;

/** 8pm in New York on `date` as a real instant (handles daylight saving). */
function eightPmEastern(date: string): Date {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortOffset' })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === 'timeZoneName')?.value;
  const offsetHours = Number(name?.match(/GMT([+-]\d+)/)?.[1] ?? -5);
  return new Date(Date.parse(`${date}T20:00:00Z`) - offsetHours * 3600000);
}

export const WORKSHOP_START = eightPmEastern(WORKSHOP.date);
export const WORKSHOP_END = new Date(WORKSHOP_START.getTime() + WORKSHOP.durationMin * 60000);

/** 'Thursday, January 7' */
export const WORKSHOP_DAY_LABEL = WORKSHOP_START.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'America/New_York',
});
export const WORKSHOP_TIME_LABEL = '8:00 PM ET';

/** True once the live session is over: the page switches to "get the replay". */
export function isWorkshopOver(now: Date = new Date()): boolean {
  return now >= WORKSHOP_END;
}

export function workshopZoomUrl(): string | null {
  return process.env.WORKSHOP_ZOOM_URL || null;
}

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const CAL_DETAILS =
  'Free live workshop with Amelie from Anywhere Learning. 40 minutes on Zoom. The Zoom link comes by email the day before. Details: https://anywherelearning.co/workshop';

/** Calendar event without the Zoom link (the file is public). */
export function workshopIcs(): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Anywhere Learning//Workshop//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:workshop-${WORKSHOP.date}@anywherelearning.co`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(WORKSHOP_START)}`,
    `DTEND:${icsStamp(WORKSHOP_END)}`,
    `SUMMARY:${WORKSHOP.shortTitle} (Anywhere Learning)`,
    `DESCRIPTION:${CAL_DETAILS}`,
    'URL:https://anywherelearning.co/workshop',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${WORKSHOP.shortTitle} starts in 30 minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function workshopGoogleUrl(): string {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${WORKSHOP.shortTitle} (Anywhere Learning)`,
    dates: `${icsStamp(WORKSHOP_START)}/${icsStamp(WORKSHOP_END)}`,
    details: CAL_DETAILS,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/** Lowercase, alphanumeric + dash, max 30 chars, like every other signup route. */
export function cleanSource(source: unknown): string | undefined {
  if (typeof source !== 'string') return undefined;
  return source.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) || undefined;
}
