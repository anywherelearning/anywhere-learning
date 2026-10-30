import { Body, Container, Head, Html, Img, Link, Preview, Text } from '@react-email/components';

type Source = 'gift' | 'odyssey' | 'charter' | 'coop' | 'school' | 'comp';

interface Props {
  firstName?: string;
  /** One-tap Clerk sign-in link (lands on /account/welcome). */
  signInUrl: string;
  source: Source;
  /** Gift giver's name ("Grandma Jo"). Gift grants only. */
  giftFrom?: string;
  months: number;
  /** ISO date the access ends. */
  endsAt: string;
  /** True when these months were stacked onto an existing grant. */
  extended?: boolean;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;
const LIBRARY_COLLAGE = `${SITE}/email-library-hero-v2.jpg`;
const ADVENTURE_MAP = `${SITE}/email-adventure-map-v2.jpg`;

function spanLabel(months: number) {
  return months === 12 ? 'a year' : `${months} months`;
}

/** Subject line, exported so lib/resend.ts and the preview agree. */
export function grantWelcomeSubject({ source, giftFrom, firstName, extended, months }: Pick<Props, 'source' | 'giftFrom' | 'firstName' | 'extended' | 'months'>) {
  if (extended) return `${months} more months added to your Anywhere Learning membership`;
  if (source === 'gift') return giftFrom ? `${giftFrom} gave your family ${spanLabel(months)} of real-world learning` : `You've been gifted ${spanLabel(months)} of Anywhere Learning`;
  return `You're in${firstName ? `, ${firstName}` : ''}. Your Anywhere Learning membership is ready`;
}

/**
 * Welcome for a prepaid grant (gift, ESA order, co-op, school, comp). Sent by
 * lib/access-grants.ts. Built on the MembershipWelcome "Trail map" layout:
 * header band, (gift tag), library collage + one-tap CTA, how it works, a peek
 * at the adventure map, then the plain facts: access date, no card, no renewal.
 */
export default function GrantWelcome({ firstName, signInUrl, source, giftFrom, months, endsAt, extended }: Props) {
  const name = firstName?.trim() || 'there';
  const isGift = source === 'gift' && !extended;
  const endDate = new Date(endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const badgeText = extended ? 'MORE TIME ADDED' : isGift ? 'A GIFT FOR YOU' : "YOU'RE IN";

  const headline = extended
    ? `Hi ${name}, ${months} more months are on your account.`
    : isGift
      ? `Hi ${name}, someone gave your family ${spanLabel(months)} of adventures.`
      : `Hi ${name}, your membership is ready.`;

  const subline = extended
    ? `Your access now runs through ${endDate}.`
    : isGift
      ? 'Nothing to pay, nothing to set up. Just open it and go.'
      : source === 'odyssey' || source === 'charter'
        ? 'Paid with your education funds. Nothing else to pay.'
        : source === 'coop'
          ? 'Part of your co-op membership. Nothing to pay on your end.'
          : source === 'school'
            ? 'Your school has this covered. Nothing to pay on your end.'
            : 'Nothing to pay, nothing to set up. Just open it and go.';

  return (
    <Html>
      <Head />
      <Preview>{subline}</Preview>
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
                  <div style={sublineStyle}>{subline}</div>
                </td>
              </tr>

              {/* ── Gift tag (gifts only) ── */}
              {isGift && (
                <tr>
                  <td style={{ padding: '28px 36px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={giftTag}>
                      <tbody>
                        <tr>
                          <td style={giftRibbon}>&nbsp;</td>
                          <td style={{ padding: '18px 22px' }}>
                            <div style={{ ...label, color: C_TERRA }}>A GIFT FROM</div>
                            <div style={giftFromName}>{giftFrom || 'someone who loves your family'}</div>
                            <div style={giftNote}>
                              {spanLabel(months).replace(/^a /, 'A ')} of real-world learning for the whole family,
                              through {endDate}.
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              {/* ── What it is ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={p}>
                    Anywhere Learning is a library of real-world activities you open on any device and
                    do together. Cook a meal and the fractions come along. Plan a real budget, build a
                    shelter, run a tiny business. Low prep, no worksheets, and every guide adjusts to
                    each kid.
                  </Text>
                </td>
              </tr>

              {/* ── Collage + CTA ── */}
              <tr>
                <td style={{ padding: '24px 36px 0', textAlign: 'center' as const }}>
                  <Img
                    src={LIBRARY_COLLAGE}
                    alt="A fan of Anywhere Learning activities and the Future-Ready Skills Map"
                    width="280"
                    style={{ display: 'inline-block', width: '280px', maxWidth: '100%', height: 'auto' }}
                  />
                  <div style={{ ...label, color: C_FOREST, marginTop: '16px' }}>ONE-CLICK SIGN-IN</div>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '14px auto 0' }}>
                    <tbody>
                      <tr>
                        <td style={btnCell}>
                          <Link href={signInUrl} style={btn}>Start our adventure &rarr;</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={micro}>
                    Signs you straight in, no password needed. The button works for 7 days. After that,
                    sign in at <Link href={`${SITE}/sign-in`} style={microLink}>anywherelearning.co/sign-in</Link> with this email.
                  </div>
                </td>
              </tr>

              {/* ── How it works ── */}
              <tr>
                <td style={{ padding: '34px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>GETTING STARTED</div>
                  <div style={h2}>How it works</div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '18px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <Step n="1" color={C_TERRA} title="ADD YOUR KIDS">
                        Takes a minute. Their ages, what you&apos;d like to focus on, and how much time
                        you usually have.
                      </Step>
                      <Step n="2" color={C_FOREST} title="YOUR FIRST STOP IS ALREADY PICKED">
                        Your family&apos;s trail opens with an activity waiting, sized to your kids.
                        Want a different one? Swap it in a tap.
                      </Step>
                      <Step n="3" color={C_GOLD} labelColor={C_EARTH} title="DO IT TOGETHER" last>
                        Cook the meal, build the stand, plant the bed. The learning takes care of
                        itself.
                      </Step>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Adventure map peek ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Img
                    src={ADVENTURE_MAP}
                    alt="A family's adventure map trail with the next activity picked"
                    width="528"
                    style={mapImg}
                  />
                  <div style={{ ...micro, marginTop: '10px', textAlign: 'center' as const }}>
                    Your family&apos;s trail. One stop at a time, all year long.
                  </div>
                </td>
              </tr>

              {/* ── The plain facts ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={summaryCard}>
                    <tbody>
                      <tr>
                        <td style={summaryCell}>
                          <div style={{ ...label, color: C_MUTED }}>FULL ACCESS THROUGH</div>
                          <div style={summaryValue}>{endDate}</div>
                        </td>
                        <td style={{ ...summaryCell, textAlign: 'right' as const }}>
                          <span style={pricePill}>$0 TO YOU</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={summaryCellTop}>
                          <div style={{ ...label, color: C_MUTED }}>BILLING</div>
                          <div style={summaryLine}>No card on file. Nothing renews or charges automatically.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Sign-off ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>Enjoy that first hour together,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              {/* ── Footer ── */}
              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                </td>
              </tr>

            </tbody>
          </table>
        </Container>
      </Body>
    </Html>
  );
}

// ── One numbered step with the dashed trail connector ──
function Step({
  n,
  color,
  labelColor,
  title,
  last,
  children,
}: {
  n: string;
  color: string;
  labelColor?: string;
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td style={{ width: '46px', verticalAlign: 'top' }}>
        <div style={{ ...stepDot, backgroundColor: color }}>{n}</div>
      </td>
      <td
        style={{
          verticalAlign: 'top',
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

GrantWelcome.PreviewProps = {
  firstName: 'Sarah',
  signInUrl: 'https://anywherelearning.co/sign-in',
  source: 'gift',
  giftFrom: 'Grandma Jo',
  months: 12,
  endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
} satisfies Props;

/* ── "Trail map" tokens (match MembershipWelcome, Oct 2026) ── */
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
const card = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CARD, border: `1px solid ${C_RULE}`, borderRadius: '18px', overflow: 'hidden' as const };
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
const h2 = { fontFamily: FONT_DISPLAY, fontSize: '24px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const sublineStyle = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', lineHeight: 1.6, color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const microLink = { color: C_MUTED, textDecoration: 'underline' };
const stepDot = { width: '34px', height: '34px', borderRadius: '50%', color: '#FFFFFF', fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: '34px', textAlign: 'center' as const };
const stepBody = { fontSize: '15.5px', lineHeight: 1.6, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED };

// ── Gift tag ──
const giftTag = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: '#FBF3E8', border: `1.5px dashed ${C_GOLD}`, borderRadius: '14px' };
const giftRibbon = { width: '10px', backgroundColor: C_TERRA, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', fontSize: 0, lineHeight: 0 };
const giftFromName = { fontFamily: FONT_DISPLAY, fontSize: '26px', lineHeight: 1.2, color: C_INK, marginTop: '6px' };
const giftNote = { fontSize: '14.5px', lineHeight: 1.55, color: C_BODY, marginTop: '6px', fontFamily: FONT_BODY };

// ── Map peek ──
const mapImg = { display: 'block', width: '100%', maxWidth: '528px', height: 'auto', borderRadius: '14px', border: `1px solid ${C_RULE}` };

// ── Summary card ──
const summaryCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const summaryCell = { padding: '18px 20px', verticalAlign: 'middle' as const };
const summaryCellTop = { ...summaryCell, borderTop: `1px dashed ${C_RULE}` };
const summaryValue = { fontFamily: FONT_DISPLAY, fontSize: '20px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const summaryLine = { fontSize: '15px', lineHeight: 1.5, color: C_INK, marginTop: '6px', fontFamily: FONT_BODY };
const pricePill = {
  display: 'inline-block',
  backgroundColor: C_FOREST,
  color: C_CARD,
  fontFamily: FONT_MONO,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  padding: '7px 12px',
  borderRadius: '999px',
  whiteSpace: 'nowrap' as const,
};
