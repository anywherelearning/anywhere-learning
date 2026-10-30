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
 * lib/access-grants.ts. Same "Trail map" look as MembershipRenewal. The key
 * message beyond "you're in": nothing to pay, no card, nothing renews.
 */
export default function GrantWelcome({ firstName, signInUrl, source, giftFrom, months, endsAt, extended }: Props) {
  const name = firstName?.trim() || 'there';
  const endDate = new Date(endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const headline = extended
    ? `Hi ${name}, ${months} more months are on your account.`
    : source === 'gift'
      ? `${giftFrom || 'Someone who loves your family'} gave you ${spanLabel(months)} of real-world learning.`
      : `Hi ${name}, your membership is ready.`;

  const subline = extended
    ? `Your access now runs through ${endDate}.`
    : source === 'gift'
      ? 'A gift for the whole family. Nothing to pay, nothing to set up.'
      : source === 'odyssey' || source === 'charter'
        ? 'Paid with your education funds. Nothing else to pay.'
        : source === 'coop'
          ? 'Part of your co-op membership. Nothing to pay on your end.'
          : source === 'school'
            ? 'Your school has this covered. Nothing to pay on your end.'
            : 'Nothing to pay, nothing to set up.';

  return (
    <Html>
      <Head />
      <Preview>{subline}</Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={card}>
            <tbody>
              <tr>
                <td style={band}>
                  <Img src={LOGO_CREAM} alt="Anywhere Learning" width="38" style={{ display: 'block', width: '38px', height: 'auto' }} />
                  <div style={h1}>{headline}</div>
                  <div style={sublineStyle}>{subline}</div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    Anywhere Learning is a library of real-world activities you open on any device and do
                    together: cooking with fractions, planning a real budget, building a shelter, running
                    a tiny business. Low prep, no worksheets, and every guide adjusts to each kid.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    The button below signs you straight in. A few quick questions about your kids, and
                    your adventure map opens with a first activity already picked.
                  </Text>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={summaryCard}>
                    <tbody>
                      <tr>
                        <td style={summaryCell}>
                          <div style={{ ...label, color: C_MUTED }}>FULL ACCESS THROUGH</div>
                          <div style={summaryValue}>{endDate}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style={summaryCellTop}>
                          <div style={{ ...label, color: C_MUTED }}>BILLING</div>
                          <div style={summaryLine}>No card on file. Nothing renews or charges automatically.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0', textAlign: 'center' as const }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                    <tbody>
                      <tr>
                        <td style={btnCell}>
                          <Link href={signInUrl} style={btn}>Open your library &rarr;</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={micro}>
                    Signs you straight in, no password needed. The link works for 7 days. After that, sign in
                    at <Link href={`${SITE}/sign-in`} style={microLink}>anywherelearning.co/sign-in</Link> with this email.
                  </div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>xo,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

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

GrantWelcome.PreviewProps = {
  firstName: 'Sarah',
  signInUrl: 'https://anywherelearning.co/sign-in',
  source: 'gift',
  giftFrom: 'Grandma Jo',
  months: 12,
  endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
} satisfies Props;

/* ── "Trail map" tokens (match MembershipRenewal, Oct 2026) ── */
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
const card = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CARD, border: `1px solid ${C_RULE}`, borderRadius: '18px', overflow: 'hidden' as const };
const band = { backgroundColor: C_FOREST, padding: '26px 36px 28px', borderTopLeftRadius: '17px', borderTopRightRadius: '17px' };
const h1 = { fontFamily: FONT_DISPLAY, fontSize: '28px', lineHeight: 1.2, color: C_CARD, margin: '20px 0 8px' };
const sublineStyle = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', lineHeight: 1.6, color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const microLink = { color: C_MUTED, textDecoration: 'underline' };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED };
const summaryCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const summaryCell = { padding: '18px 20px', verticalAlign: 'middle' as const };
const summaryCellTop = { ...summaryCell, borderTop: `1px dashed ${C_RULE}` };
const summaryValue = { fontFamily: FONT_DISPLAY, fontSize: '20px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const summaryLine = { fontSize: '15px', lineHeight: 1.5, color: C_INK, marginTop: '6px', fontFamily: FONT_BODY };
