/**
 * Basecamp: the monthly live session for members, with Amelie on Zoom.
 *
 * First Thursday of the month at 8pm Eastern, 40 minutes (the free Zoom
 * limit). January 2027 moves to the second Thursday (Jan 14): the first one,
 * Jan 7, is the launch workshop night. The 10-minute "this
 * month's trail" segment follows the This Month skill of the month.
 *
 * The Zoom link lives in the BASECAMP_ZOOM_URL env var, never in the repo
 * (it's public and the link carries the meeting passcode). Only render it for
 * members: the member zone also renders for guests behind the paywall teaser.
 */

const DURATION_MIN = 40;

/** Sessions by date (Eastern). Add the next year's dates in December. */
export const BASECAMP_DATES = [
  '2026-12-03',
  '2027-01-14',
  '2027-02-04',
  '2027-03-04',
  '2027-04-01',
  '2027-05-06',
  '2027-06-03',
  '2027-07-01',
  '2027-08-05',
  '2027-09-02',
  '2027-10-07',
  '2027-11-04',
  '2027-12-02',
];

/**
 * One-time "Introducing Basecamp" email: session date -> the Eastern date it
 * goes to every member. Only the first session needs one; later members hear
 * about Basecamp in their welcome email.
 */
export const BASECAMP_ANNOUNCEMENTS: Record<string, string> = {
  '2026-12-03': '2026-11-24', // approved by Amelie Nov 1 2026
};

/** Replays, newest first. Add one after each session (unlisted video link). */
export const BASECAMP_REPLAYS: { date: string; title: string; url: string }[] = [];

export interface BasecampSession {
  /** 'YYYY-MM-DD' in Eastern time. */
  date: string;
  start: Date;
  end: Date;
  /** e.g. 'Thursday, December 3' */
  dayLabel: string;
  /** e.g. '8:00 PM ET' */
  timeLabel: string;
}

/** 8pm in New York on `date`, as a real instant (handles daylight saving). */
function eightPmEastern(date: string): Date {
  // New York's UTC offset that day, e.g. "GMT-5" (EST) or "GMT-4" (EDT).
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortOffset' })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === 'timeZoneName')?.value;
  const offsetHours = Number(name?.match(/GMT([+-]\d+)/)?.[1] ?? -5);
  return new Date(Date.parse(`${date}T20:00:00Z`) - offsetHours * 3600000);
}

export function sessionFor(date: string): BasecampSession {
  const start = eightPmEastern(date);
  return {
    date,
    start,
    end: new Date(start.getTime() + DURATION_MIN * 60000),
    dayLabel: start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York',
    }),
    timeLabel: '8:00 PM ET',
  };
}

/** The next session that hasn't ended yet, or null when the list runs out. */
export function nextBasecamp(now: Date = new Date()): BasecampSession | null {
  for (const d of BASECAMP_DATES) {
    const s = sessionFor(d);
    if (s.end > now) return s;
  }
  return null;
}

export function basecampZoomUrl(): string | null {
  return process.env.BASECAMP_ZOOM_URL || null;
}

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** One calendar event for the session, with the Zoom link inside. */
export function basecampIcs(s: BasecampSession, zoomUrl: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Anywhere Learning//Basecamp//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:basecamp-${s.date}@anywherelearning.co`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(s.start)}`,
    `DTEND:${icsStamp(s.end)}`,
    'SUMMARY:Basecamp with Amelie',
    `DESCRIPTION:Monthly live session for Anywhere Learning members.\\n\\nJoin on Zoom: ${zoomUrl}`,
    `LOCATION:${zoomUrl}`,
    `URL:${zoomUrl}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Basecamp with Amelie starts in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

/** Google Calendar "add event" link (opens prefilled in the member's calendar). */
export function basecampGoogleUrl(s: BasecampSession, zoomUrl: string): string {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Basecamp with Amelie',
    dates: `${icsStamp(s.start)}/${icsStamp(s.end)}`,
    details: `Monthly live session for Anywhere Learning members.\n\nJoin on Zoom: ${zoomUrl}`,
    location: zoomUrl,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
