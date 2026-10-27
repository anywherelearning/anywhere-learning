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
import type { MidpointGuide, MidpointVariant } from '@/lib/trial-midpoint';

interface Props {
  /** The recipient's first name (or undefined if we don't know it). */
  firstName?: string;
  variant: MidpointVariant;
  /** The guide this email is about: the one they did, browsed, or their first stop. */
  guide: MidpointGuide;
  /** 'doing' only: the suggested next guide. */
  next?: MidpointGuide;
  /** 'doing' only: every activity they marked done, most recent first. */
  done?: MidpointGuide[];
  /** The suggested guide is one they added to their trail (not our pick). */
  fromTrail?: boolean;
  /** "Kirin (6)" / "Elijah and Indie" / "". */
  kids: string;
  /** ISO date the trial converts. */
  trialEndDate: string;
  /** One-tap sign-in link that lands on the main guide in the reader. */
  guideUrl: string;
  /** 'doing' only: one-tap sign-in link to the next guide. */
  nextUrl?: string;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const countWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** "A", "A and B", "A, B and C", "A, B, C and 2 more". */
function listNames(guides: MidpointGuide[]): React.ReactNode {
  const shown = guides.slice(0, 3);
  const extra = guides.length - shown.length;
  const parts = shown.map((g) => <strong key={g.slug} style={strong}>{g.name}</strong>);
  if (extra > 0) parts.push(<span key="more">{extra} more</span>);
  return parts.map((part, i) => (
    <span key={i}>
      {i > 0 && (i === parts.length - 1 ? ' and ' : ', ')}
      {part}
    </span>
  ));
}

export function midpointSubject(
  variant: MidpointVariant,
  firstName?: string,
  doneCount = 0,
): string {
  const name = firstName ? `, ${firstName}` : '';
  if (variant === 'doing' && doneCount >= 2) {
    return `${capitalize(countWord(doneCount))} activities in your first few days${name}. Keep it going`;
  }
  if (variant === 'doing') return `One down${name}. Here's a good next one`;
  if (variant === 'browsing') return `A few days into your trial${name}. Let's get one done this week`;
  return `Your first activity is already picked${name}`;
}

/**
 * Early trial check-in, sent by the daily trial-midpoint cron around day 2 or 3
 * of the 7-day trial. Fills the gap between the welcome email (day 0) and the
 * trial-ending heads-up (day 4, three days before the trial ends). Three versions, one guide each, decided by
 * lib/trial-midpoint.ts from what they've actually done in the member zone.
 * Not a sales email: the goal is one activity done together this week.
 * "Trail map" design (Oct 2026, matches QuizPlanEmail + the Kit sequence emails).
 */
export default function TrialMidpoint({
  firstName,
  variant,
  guide,
  next,
  done = [],
  fromTrail = false,
  kids,
  trialEndDate,
  guideUrl,
  nextUrl,
}: Props) {
  // Two or more "We did it!"s is a different email: they've found a rhythm,
  // so it's "keep going", not "you got over the first hump".
  const onARoll = variant === 'doing' && done.length >= 2;
  // Headlines end ", Sarah." when we know the name, and just "." when we don't.
  const nameTail = firstName?.trim() ? `, ${firstName.trim()}.` : '.';
  const forKids = kids ? ` for ${kids}` : '';
  const ends = new Date(trialEndDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const preview =
    onARoll
      ? `You've already done ${countWord(done.length)} activities together. Keep doing what you're doing.`
      : variant === 'doing'
      ? `You already did ${guide.name}. Here's a good next one.`
      : variant === 'browsing'
        ? `${guide.name} caught your eye. Here's how to actually make it happen.`
        : `I picked one for you: ${guide.name}.`;

  const badgeText = onARoll ? 'ON A ROLL' : variant === 'doing' ? 'ONE DOWN' : 'A FEW DAYS IN';

  const headline = onARoll
    ? `You're on a roll${nameTail}`
    : variant === 'doing'
      ? `You already did one${nameTail}`
      : variant === 'browsing'
        ? `Let's get one done this week${nameTail}`
        : fromTrail
          ? `Your first one is waiting${nameTail}`
          : `I picked one for you${nameTail}`;

  const sublineText = onARoll
    ? `${capitalize(countWord(done.length))} activities done together in your first few days.`
    : variant === 'doing'
      ? 'Your first activity is on the map.'
      : 'A few days into your free trial.';

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
                          <span style={badge}>{badgeText}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>{headline}</div>
                  <div style={subline}>{sublineText}</div>
                </td>
              </tr>

              {/* ── The note ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  {onARoll && (
                    <>
                      <Text style={p}>
                        Your map says you&apos;ve already done {countWord(done.length)} activities
                        together: {listNames(done)}. In your first few days.
                      </Text>
                      <Text style={{ ...p, margin: '14px 0 0' }}>
                        That&apos;s a real rhythm, and it&apos;s exactly how this is meant to work.
                        Keep doing what you&apos;re doing. I really hope the kids are enjoying them.
                      </Text>
                      {next && (
                        <Text style={{ ...p, margin: '14px 0 0' }}>
                          Whenever you&apos;re ready for the next one,{' '}
                          {fromTrail
                            ? `you already have this one on your trail${forKids}.`
                            : `here's one that builds on what you've done${forKids}.`}
                        </Text>
                      )}
                    </>
                  )}

                  {variant === 'doing' && !onARoll && (
                    <>
                      <Text style={p}>
                        Your map says you finished <strong style={strong}>{guide.name}</strong>{' '}
                        together. That first one is the hardest to get to, honestly. Not because
                        it&apos;s difficult, but because life fills the week. You made the time. I
                        hope the kids enjoyed it.
                      </Text>
                      {next && (
                        <Text style={{ ...p, margin: '14px 0 0' }}>
                          If you&apos;ve got a little time this week, here&apos;s a good next
                          one{forKids}.{fromTrail ? " It's the one you already added to your trail." : ' It builds on what you just did.'}
                        </Text>
                      )}
                    </>
                  )}

                  {variant === 'browsing' && (
                    <>
                      <Text style={p}>
                        Looks like <strong style={strong}>{guide.name}</strong> caught your eye. Good
                        pick.
                      </Text>
                      <Text style={{ ...p, margin: '14px 0 0' }}>
                        Already did it? Amazing. Tap <strong style={strong}>We did it!</strong> in
                        the guide so it lands on your map. If you haven&apos;t had the chance yet,
                        here&apos;s how to actually get it done together this week.
                      </Text>
                    </>
                  )}

                  {variant === 'not-started' && (
                    <Text style={p}>
                      A trial week goes fast. If you haven&apos;t opened anything yet, that&apos;s
                      completely normal, and you haven&apos;t missed anything.{' '}
                      {fromTrail
                        ? `You already added ${guide.name} to your trail${forKids}, so there's nothing to choose. Just open it.`
                        : `Here's a good first one${forKids}, so there's nothing to choose. Just open it.`}
                    </Text>
                  )}
                </td>
              </tr>

              {/* ── Guide card ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <GuideCard
                    guide={variant === 'doing' && next ? next : guide}
                    url={variant === 'doing' && next && nextUrl ? nextUrl : guideUrl}
                    label={
                      onARoll
                        ? 'One more you might like'
                        : variant === 'doing'
                          ? fromTrail ? 'Next on your trail' : 'A good next one'
                          : variant === 'browsing'
                            ? 'The one that caught your eye'
                            : fromTrail ? 'On your trail' : 'A good first one'
                    }
                  />
                </td>
              </tr>

              {/* ── How to make it happen (browsing + not started) ── */}
              {variant !== 'doing' && (
                <>
                  <tr>
                    <td style={{ padding: '32px 36px 0' }}>
                      <div style={h2}>How to make it happen</div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '18px 36px 0' }}>
                      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                        <tbody>
                          <Step n="1" color={C_TERRA} title="PUT IT ON THE CALENDAR">
                            {guide.timeRange === 'Multiple days'
                              ? 'This one runs over a few sessions. Book the first one now, before the week fills up.'
                              : `This one takes ${guide.timeRange?.toLowerCase() ?? 'an afternoon'}. Pick the slot now, before the week fills up.`}{' '}
                            A Saturday morning works for a lot of families.
                          </Step>
                          <Step n="2" color={C_FOREST} title="READ IT ONCE YOURSELF">
                            Ten minutes the night before, on your phone. You&apos;ll know what to grab and
                            what to say, so you&apos;re not figuring it out with an audience.
                          </Step>
                          <Step n="3" color={C_GOLD} labelColor={C_EARTH} title="START AT EXPLORE" last>
                            Every guide has three levels. Explore is the gentle first try. It
                            doesn&apos;t have to go perfectly, it just has to happen. Then tap{' '}
                            <strong style={strong}>We did it!</strong> so it lands on your map.
                          </Step>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </>
              )}

              {/* ── Trial line + sign-off ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    Your free trial runs until {ends}, and every guide is open to you until then.
                    {variant !== 'doing' && " Stuck, or not sure which one fits your kids? Just reply and I'll help."}
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
                    You&apos;re receiving this because you&apos;re on a free trial of Anywhere
                    Learning. Manage or cancel anytime from{' '}
                    <Link href={`${SITE}/account/settings`} style={{ color: '#A09A8C' }}>
                      your account
                    </Link>
                    .
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

function GuideCard({ guide, url, label: cardLabel }: { guide: MidpointGuide; url: string; label: string }) {
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
            <div style={{ ...label, color: C_FOREST }}>{cardLabel.toUpperCase()}</div>
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

/** Numbered trail step: colored dot, Courier label, dashed connector to the next step. */
function Step({
  n,
  title,
  color,
  labelColor,
  children,
  last,
}: {
  n: string;
  title: string;
  color: string;
  labelColor?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <tr>
      <td style={{ width: '46px', verticalAlign: 'top' as const }}>
        <div style={{ ...stepDot, backgroundColor: color }}>{n}</div>
      </td>
      <td
        style={{
          verticalAlign: 'top' as const,
          padding: last ? '3px 0 4px 16px' : '3px 0 20px 16px',
          borderLeft: last ? '2px solid transparent' : `2px dashed ${C_RULE}`,
        }}
      >
        <div style={{ ...label, color: labelColor ?? color }}>{title}</div>
        <div style={stepBody}>{children}</div>
      </td>
    </tr>
  );
}

// Preview props for `npm run email:preview`.
TrialMidpoint.PreviewProps = {
  firstName: 'Sarah',
  variant: 'browsing',
  guide: {
    slug: 'family-electricity-audit',
    name: 'Family Electricity Audit',
    blurb: 'Turn your home into an energy investigation.',
    timeRange: '3 to 4 hours',
    ageRange: 'Ages 8–14',
  },
  kids: 'Maya (8)',
  trialEndDate: '2026-10-24T19:21:32.000Z',
  guideUrl: `${SITE}/account/view/family-electricity-audit`,
} satisfies Props;

/* ── "Trail map" tokens (match QuizPlanEmail + the Kit sequence emails, Oct 2026) ── */
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";
const FONT_MONO = "'Courier New', Courier, monospace";

const C_CARD = '#FAF9F6';
const C_INK = '#2F3A2E';
const C_BODY = '#4B5563';
const C_MUTED = '#8A8578';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_TERRA = '#C4836A';
const C_GOLD = '#D4A373';
const C_EARTH = '#8B7355';
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
const h2 = { fontFamily: FONT_DISPLAY, fontSize: '24px', lineHeight: 1.25, color: C_INK };
const subline = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const strong = { color: C_INK, fontWeight: 700 };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const sageCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const cardTitle = { fontFamily: FONT_DISPLAY, fontSize: '22px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const cardMeta = { fontSize: '13px', color: C_MUTED, marginTop: '4px', fontFamily: FONT_BODY };
const cardBlurb = { fontSize: '15px', lineHeight: 1.6, color: C_BODY, margin: '10px 0 16px', fontFamily: FONT_BODY };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '14px 24px', fontSize: '15px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const stepDot = { width: '34px', height: '34px', borderRadius: '50%', color: '#FFFFFF', fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: '34px', textAlign: 'center' as const };
const stepBody = { fontSize: '15.5px', lineHeight: 1.6, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
