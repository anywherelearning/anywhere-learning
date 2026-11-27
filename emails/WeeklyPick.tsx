import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import type { MidpointGuide } from '@/lib/trial-midpoint';
import type { MonthRecap, WeeklySource } from '@/lib/weekly-pick';

interface Props {
  firstName?: string;
  guide: MidpointGuide;
  source: WeeklySource;
  /** Activities marked done in the last 7 days, most recent first. */
  doneLastWeek: MidpointGuide[];
  /** Nothing marked done in 2+ weeks: add one gentle "no pressure" line. */
  quiet: boolean;
  /** Last month at a glance, in the first weekly email of a new month. */
  recap: MonthRecap | null;
  /** Kid first names only, no ages: "Maya" / "Elijah and Indie" / "". */
  kids: string;
  /** This month's theme title, e.g. "The month of making it by hand". */
  monthTitle: string;
  /** How many weekly emails this family already got. Rotates the wording. */
  weekIndex: number;
  /** One-tap sign-in link that lands on the guide in the reader. */
  guideUrl: string;
  /** Turns the weekly email off (no sign-in needed). */
  stopUrl: string;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const countWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function weeklySubject(guide: MidpointGuide, firstName?: string): string {
  return `One for this week${firstName ? `, ${firstName}` : ''}: ${guide.name}`;
}

/* ── Wording that rotates week to week (index = weekly emails already sent) ──
 * The lists have different lengths (7, 5, 8, 6) on purpose: each piece comes
 * back every 5 to 8 weeks, but the same combination doesn't repeat for years. */

const HEADLINES: [string, string][] = [
  ['One for this week.', 'I picked one for you this week.'],
  ["This week's pick is in.", 'One guide, picked for your family.'],
  ['Your one thing this week.', "It's already picked, so there's nothing to plan."],
  ["Here's your week.", 'Something good to do together.'],
  ['A good one for this week.', 'Picked with your kids in mind.'],
  ['This week, try this.', 'A real task to do together.'],
  ['Ready for this week?', "Here's a good one for this week."],
];

const CELEBRATE: ((done: React.ReactNode) => React.ReactNode)[] = [
  (done) => <>Your map says you did {done} last week. That&apos;s exactly how this is meant to work.</>,
  (done) => <>You did {done} last week. I love that.</>,
  (done) => <>{done} made it onto your map last week. Nicely done.</>,
  (done) => <>Last week you did {done}. Keep that rhythm going.</>,
  (done) => <>I saw {done} on your map from last week. That made my day.</>,
];

const TIPS: React.ReactNode[] = [
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Pick the time now,</strong> before the week
    fills up. Read it once the night before, then start at Explore. It doesn&apos;t need to go
    perfectly. Getting started is the main thing.
  </>,
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Keep it small.</strong> Start with the first
    step and see where the kids take it. If it turns into a whole afternoon, great. If it&apos;s
    twenty minutes, that counts too.
  </>,
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Let them lead.</strong> Read the guide
    yourself, then hand over the decisions. Try asking questions instead of giving them the answers.
  </>,
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Busy week?</strong> That&apos;s okay, it will
    still be there next week. But if you can find one slot, put it on the calendar today. If it&apos;s on
    the calendar, it&apos;s much more likely to happen.
  </>,
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Talk about it at dinner.</strong> Ask the
    kids what they&apos;d do differently next time. Talking about it afterwards really helps the
    learning stick.
  </>,
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Take a photo of the finished thing.</strong>{' '}
    Kids love seeing their own work later, and it&apos;s a lovely record of the year.
  </>,
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Bring everyone in.</strong> Every guide
    adjusts to different ages. Older kids explain, younger ones copy, and both learn something.
  </>,
  <>
    <strong style={{ color: '#2F3A2E', fontWeight: 700 }}>Use what you have.</strong> Every guide is
    low prep on purpose. If something is missing, swap it for whatever is in the drawer.
  </>,
];

/** Only for families who haven't marked anything done in 2+ weeks. Never
 *  assumes they did nothing: they may just not have tapped "We did it!". */
const QUIET: string[] = [
  "If last week got away from you, that's completely normal. This one is easy to pick back up with.",
  "Weeks fill up fast. Here's one that fits into whatever this one looks like.",
  'No pressure, just one idea for this week.',
  "Some weeks are like that. Whenever you're ready, this one is a gentle place to start again.",
  'Even twenty minutes counts. Start with the first step and see how it goes.',
  'Life gets busy, I know. When you have a moment, this one is waiting for you.',
];

const rotate = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length];

/** "A", "A and B", "A, B and C", "A, B, C and 2 more", each name in bold. */
function namesList(guides: MidpointGuide[]): React.ReactNode {
  const shown = guides.slice(0, 3);
  const extra = guides.length - shown.length;
  const parts: React.ReactNode[] = shown.map((g) => <strong key={g.slug} style={strong}>{g.name}</strong>);
  if (extra > 0) parts.push(<span key="more">{extra} more</span>);
  return parts.map((part, i) => (
    <span key={i}>
      {i > 0 && (i === parts.length - 1 ? ' and ' : ', ')}
      {part}
    </span>
  ));
}

/**
 * The weekly member email: one guide for this week, picked by lib/weekly-pick.ts.
 * Paying members and prepaid grants only (trials already get three emails in
 * seven days). Short on purpose: one guide, one button, one tip. Headline,
 * "you did it" line, tip and the quiet-weeks line rotate (see lists above). The
 * first email of each month adds a recap of last month's activities and skills.
 * "Trail map" design, matching TrialMidpoint.
 */
export default function WeeklyPick({
  firstName,
  guide,
  source,
  doneLastWeek,
  quiet,
  recap,
  kids,
  monthTitle,
  weekIndex,
  guideUrl,
  stopUrl,
}: Props) {
  const name = firstName?.trim();
  const forKids = kids ? ` for ${kids}` : '';
  const month = monthTitle.replace(/^The month of /i, '');
  const [headline, subline] = rotate(HEADLINES, weekIndex);

  const why: Record<WeeklySource, string> = {
    trail: "It's the stop you put on your trail, so there's nothing to choose. Just open it.",
    opened: `You opened it not long ago. This could be the week you actually do it together${forKids}.`,
    month: `It's part of this month's theme, ${month}, and it's a good fit${forKids || ' for your family'}.`,
    quick: `A quick one${forKids}, with almost nothing to prepare.`,
  };

  const preview = recap
    ? `Your ${recap.month} at a glance, and one for this week: ${guide.name}.`
    : doneLastWeek.length
      ? `You did ${doneLastWeek[0].name} last week. Here's one for this week.`
      : `This week: ${guide.name}, picked for your family.`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={card}>
            <tbody>

              {/* ── Header band ── */}
              <tr>
                <td style={band}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'middle' }}>
                          <Img src={LOGO_CREAM} alt="Anywhere Learning" width="38" style={{ display: 'block', width: '38px', height: 'auto' }} />
                        </td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'right' as const }}>
                          <span style={badge}>THIS WEEK</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>{headline}</div>
                  <div style={sublineStyle}>{subline}</div>
                </td>
              </tr>

              {/* ── The note ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 14px' }}>Hi {name || 'there'},</Text>
                  {recap && <RecapCard recap={recap} />}
                  {doneLastWeek.length > 0 && (
                    <Text style={{ ...p, margin: '0 0 14px' }}>
                      {rotate(CELEBRATE, weekIndex)(namesList(doneLastWeek))}
                      {doneLastWeek.length > 1 &&
                        ` ${capitalize(countWord(doneLastWeek.length))} in one week, that's a real rhythm.`}
                    </Text>
                  )}
                  {quiet && doneLastWeek.length === 0 && (
                    <Text style={{ ...p, margin: '0 0 14px' }}>{rotate(QUIET, weekIndex)}</Text>
                  )}
                  <Text style={p}>{why[source]}</Text>
                </td>
              </tr>

              {/* ── Guide card ── */}
              <tr>
                <td style={{ padding: '22px 36px 0' }}>
                  <GuideCard guide={guide} url={guideUrl} />
                </td>
              </tr>

              {/* ── One tip + sign-off ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <Text style={p}>
                    {rotate(TIPS, weekIndex)} When you&apos;re done, tap{' '}
                    <strong style={strong}>We did it!</strong> so it lands on your map.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Questions, or need a hand with this one or anything else? I&apos;m always here.
                    You can reach me anytime at{' '}
                    <Link href="mailto:info@anywherelearning.co" style={{ color: C_FOREST, fontWeight: 600 }}>
                      info@anywherelearning.co
                    </Link>
                    , and I&apos;m happy to help.
                  </Text>
                  <Text style={{ ...p, margin: '18px 0 6px' }}>xo,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              {/* ── Footer ── */}
              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                  <Text style={legal}>
                    You&apos;re getting this because you&apos;re an Anywhere Learning member. One
                    email a week.{' '}
                    <Link href={stopUrl} style={{ color: '#A09A8C' }}>
                      Stop the weekly pick
                    </Link>
                    {' · '}
                    <Link href={`${SITE}/account`} style={{ color: '#A09A8C' }}>
                      Your account
                    </Link>
                  </Text>
                </td>
              </tr>

            </tbody>
          </table>
        </Container>
      </Body>
    </Html>
  );
}

function RecapCard({ recap }: { recap: MonthRecap }) {
  const n = recap.activities.length;
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ ...sageCard, backgroundColor: '#F6EFE3', margin: '0 0 18px' }}>
      <tbody>
        <tr>
          <td style={{ padding: '20px 22px 20px' }}>
            <div style={{ ...label, color: '#8B7355' }}>YOUR {recap.month.toUpperCase()}</div>
            <div style={{ ...cardTitle, marginTop: '6px' }}>
              {capitalize(countWord(n))} {n === 1 ? 'activity' : 'activities'} done together
            </div>
            <Text style={{ ...cardBlurb, margin: '8px 0 0' }}>{namesList(recap.activities)}.</Text>
            {recap.skills.length > 0 && (
              <>
                <div style={{ ...label, color: '#8B7355', marginTop: '16px' }}>SKILLS YOU PRACTISED</div>
                <div style={{ marginTop: '8px', lineHeight: '30px' }}>
                  {recap.skills.map((k) => (
                    <span key={k} style={skillPill}>{k}</span>
                  ))}
                </div>
              </>
            )}
            <Text style={{ ...cardBlurb, margin: '14px 0 0', fontSize: '14px' }}>
              All of it is saved on your map.
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function GuideCard({ guide, url }: { guide: MidpointGuide; url: string }) {
  const meta = [guide.timeRange, guide.ageRange].filter(Boolean).join(' · ');
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
      <tbody>
        <tr>
          <td style={{ padding: '22px 0 22px 22px', width: '104px', verticalAlign: 'top' as const }}>
            <Img
              src={`${SITE}/products/${guide.slug}.jpg`}
              alt={guide.name}
              width="104"
              style={{ display: 'block', width: '104px', height: 'auto', borderRadius: '8px', border: `1px solid ${C_RULE}` }}
            />
          </td>
          <td style={{ padding: '20px 22px 22px 20px', verticalAlign: 'top' as const }}>
            <div style={{ ...label, color: C_FOREST }}>THIS WEEK&apos;S PICK</div>
            <div style={cardTitle}>{guide.name}</div>
            {meta && <div style={cardMeta}>{meta}</div>}
            <Text style={cardBlurb}>{guide.blurb}</Text>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={btnCell}>
                    <Link href={url} style={btn}>Open the guide &rarr;</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// Preview props for `npm run email:preview`.
WeeklyPick.PreviewProps = {
  firstName: 'Sarah',
  guide: {
    slug: 'board-game-studio',
    name: 'Board Game Studio',
    blurb: 'Kids invent, build and playtest their own board game.',
    timeRange: 'Multiple days',
    ageRange: 'Ages 7–14',
  },
  source: 'month',
  doneLastWeek: [],
  quiet: false,
  recap: null,
  kids: 'Maya',
  monthTitle: 'The month of making it by hand',
  weekIndex: 0,
  guideUrl: `${SITE}/account/view/board-game-studio`,
  stopUrl: `${SITE}/api/email/weekly-off?t=preview`,
} satisfies Props;

/* ── "Trail map" tokens (same as TrialMidpoint) ── */
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";
const FONT_MONO = "'Courier New', Courier, monospace";

const C_CARD = '#FAF9F6';
const C_INK = '#2F3A2E';
const C_BODY = '#4B5563';
const C_MUTED = '#8A8578';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_SAGE = '#EEF2EC';

const body = { backgroundColor: '#EBE9E2', fontFamily: FONT_BODY, margin: 0, padding: '32px 12px' };
const card = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_CARD,
  border: `1px solid ${C_RULE}`,
  borderRadius: '18px',
  overflow: 'hidden' as const,
};
const band = { backgroundColor: C_FOREST, padding: '26px 36px 28px', borderTopLeftRadius: '17px', borderTopRightRadius: '17px' };
const badge = {
  display: 'inline-block',
  backgroundColor: '#E8C99A',
  color: C_INK,
  fontFamily: FONT_MONO,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  padding: '7px 13px',
  borderRadius: '999px',
};
const h1 = { fontFamily: FONT_DISPLAY, fontSize: '30px', lineHeight: 1.18, color: C_CARD, margin: '20px 0 8px' };
const sublineStyle = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const strong = { color: C_INK, fontWeight: 700 };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const skillPill = {
  display: 'inline-block',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E6DCC8',
  borderRadius: '999px',
  padding: '3px 12px',
  margin: '0 6px 6px 0',
  fontSize: '13.5px',
  lineHeight: '20px',
  color: C_INK,
  fontFamily: FONT_BODY,
};
const sageCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const cardTitle = { fontFamily: FONT_DISPLAY, fontSize: '22px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const cardMeta = { fontSize: '13px', color: C_MUTED, marginTop: '4px', fontFamily: FONT_BODY };
const cardBlurb = { fontSize: '15px', lineHeight: 1.6, color: C_BODY, margin: '10px 0 16px', fontFamily: FONT_BODY };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '14px 24px', fontSize: '15px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
