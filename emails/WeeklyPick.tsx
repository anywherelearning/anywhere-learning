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
import type { WeeklySource } from '@/lib/weekly-pick';

interface Props {
  firstName?: string;
  guide: MidpointGuide;
  source: WeeklySource;
  /** Activities marked done in the last 7 days, most recent first. */
  doneLastWeek: MidpointGuide[];
  /** "Kirin (6)" / "Elijah and Indie" / "". */
  kids: string;
  /** This month's theme title, e.g. "The month of making it by hand". */
  monthTitle: string;
  /** One-tap sign-in link that lands on the guide in the reader. */
  guideUrl: string;
  /** Turns the weekly email off (no sign-in needed). */
  stopUrl: string;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

export function weeklySubject(guide: MidpointGuide, firstName?: string): string {
  return `One for this week${firstName ? `, ${firstName}` : ''}: ${guide.name}`;
}

/**
 * The weekly member email: one guide for this week, picked by lib/weekly-pick.ts.
 * Paying members and prepaid grants only (trials already get three emails in
 * seven days). Short on purpose: one guide, one button, a two-line how-to.
 * "Trail map" design, matching TrialMidpoint.
 */
export default function WeeklyPick({
  firstName,
  guide,
  source,
  doneLastWeek,
  kids,
  monthTitle,
  guideUrl,
  stopUrl,
}: Props) {
  const nameTail = firstName?.trim() ? `, ${firstName.trim()}.` : '.';
  const forKids = kids ? ` for ${kids}` : '';
  const month = monthTitle.replace(/^The month of /i, '');

  const why: Record<WeeklySource, string> = {
    trail: "It's the stop you put on your trail, so there's nothing to choose. Just open it.",
    opened: `You opened it not long ago. This could be the week you actually do it together${forKids}.`,
    month: `It's part of this month's theme, ${month}, and it's a good fit${forKids || ' for your family'}.`,
    quick: `A quick one${forKids}, with almost nothing to prepare.`,
  };

  const preview = doneLastWeek.length
    ? `You did ${doneLastWeek[0].name} last week. Here's one for this week.`
    : `This week: ${guide.name}. ${guide.timeRange ?? 'One afternoon'}, picked for your family.`;

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
                  <div style={h1}>One for this week{nameTail}</div>
                  <div style={subline}>No planning, no choosing. Just this one.</div>
                </td>
              </tr>

              {/* ── The note ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  {doneLastWeek.length > 0 && (
                    <Text style={{ ...p, margin: '0 0 14px' }}>
                      Your map says you did <strong style={strong}>{doneLastWeek[0].name}</strong>{' '}
                      {doneLastWeek.length > 1 ? `and ${doneLastWeek.length - 1} more ` : ''}last week.
                      That&apos;s exactly how this is meant to work.
                    </Text>
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

              {/* ── Two-line how-to ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <Text style={p}>
                    <strong style={strong}>Pick the time now,</strong> before the week fills up.
                    Read it once the night before, then start at Explore. It doesn&apos;t have to go
                    perfectly, it just has to happen. When you&apos;re done, tap{' '}
                    <strong style={strong}>We did it!</strong> so it lands on your map.
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
  kids: 'Maya (8)',
  monthTitle: 'The month of making it by hand',
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
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
