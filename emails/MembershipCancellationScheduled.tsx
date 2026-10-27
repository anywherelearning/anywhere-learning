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
import { EXIT_REASONS } from './TrialCanceled';

interface Props {
  /** The recipient's first name (or undefined if we don't know it). */
  firstName?: string;
  /** ISO date access runs until (the paid period end). */
  accessUntil: string;
  /** Billing plan: swaps "your year" / "your month" wording. */
  plan?: 'annual' | 'monthly';
  /** Link to account settings, where the membership can be resumed. */
  manageUrl: string;
  /** exit_surveys row id, the opaque token for the one-tap reason links.
   *  When missing, the reason row is hidden. */
  surveyToken?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

// Absolute, always-live host for email assets (never localhost).
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/** "June 26, 2026" for body copy and fine print. */
function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Cancellation-scheduled confirmation. Sent when a paying member cancels
 * (Stripe flips cancel_at_period_end to true): access continues to the end
 * of the paid period, then no further billing. Plain confirmation first,
 * one-tap exit survey second, one quiet door back. No discounts, no guilt.
 */
export default function MembershipCancellationScheduled({
  firstName,
  accessUntil,
  plan,
  manageUrl,
  surveyToken,
}: Props) {
  const name = firstName?.trim() || 'there';
  const isMonthly = plan === 'monthly';
  const per = isMonthly ? 'month' : 'year';
  const until = longDate(new Date(accessUntil));

  return (
    <Html>
      <Head />
      <Preview>
        Cancellation confirmed. You keep full access until {until}, then no further billing.
      </Preview>
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
                          <span style={badge}>CANCELLATION CONFIRMED</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>All set, {name}.</div>
                  <div style={subline}>Your membership is canceled and you won&apos;t be billed again.</div>
                </td>
              </tr>

              {/* ── What happens now (a real timeline, two stops) ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED, marginBottom: '14px' }}>WHAT HAPPENS NOW</div>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '46px', verticalAlign: 'top' }}>
                          <div style={{ ...stepDot, backgroundColor: C_TERRA }}>1</div>
                        </td>
                        <td style={{ ...stepCell, borderLeft: `2px dashed ${C_RULE}` }}>
                          <div style={{ ...label, color: C_TERRA }}>NOW THROUGH {until.toUpperCase()}</div>
                          <div style={stepBody}>
                            You keep full access, every guide, every download, until{' '}
                            <strong style={{ color: C_INK }}>{until}</strong>, the end of the {per}{' '}
                            you&apos;ve already paid for.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '46px', verticalAlign: 'top' }}>
                          <div style={{ ...stepDot, backgroundColor: C_FOREST }}>2</div>
                        </td>
                        <td style={{ ...stepCell, padding: '3px 0 4px 16px', borderLeft: '2px solid transparent' }}>
                          <div style={{ ...label, color: C_FOREST }}>AFTER THAT</div>
                          <div style={stepBody}>It winds down quietly. No further charges, no hoops.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Text style={{ ...p, margin: '20px 0 0' }}>
                    Thank you for being a member. Truly. Every family that joined this early
                    shaped what it became.
                  </Text>
                </td>
              </tr>

              {/* ── One-tap exit survey ── */}
              {surveyToken && (
                <tr>
                  <td style={{ padding: '24px 36px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={aside}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '22px 24px 24px' }}>
                            <div style={{ ...label, color: C_FOREST }}>ONE QUESTION, ONLY IF YOU FEEL LIKE IT</div>
                            <div style={surveyLead}>What made today the day?</div>
                            {EXIT_REASONS.map((r) => (
                              <div key={r.key} style={{ marginTop: '8px' }}>
                                <Link
                                  href={`${baseUrl}/api/exit-reason?t=${surveyToken}&r=${r.key}`}
                                  style={reasonPill}
                                >
                                  {r.label}
                                </Link>
                              </div>
                            ))}
                            <div style={micro}>
                              One tap, that&apos;s it. It genuinely shapes what I build next.
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              {/* ── Sign-off ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={p}>
                    If it was something specific, hit reply and tell me. This lands straight in my
                    inbox and I read every one. And if you change your mind before {until}, you can{' '}
                    <Link href={manageUrl} style={{ color: C_FOREST, fontWeight: 600 }}>
                      resume your membership
                    </Link>{' '}
                    from your account and nothing is interrupted.
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
                    You&apos;re receiving this note because your Anywhere Learning membership was
                    set to cancel. Access continues through {until}, no charges after that. If you
                    didn&apos;t cancel this yourself, reply to this email and we&apos;ll sort it out.
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

// Preview props for `npm run email:preview`.
MembershipCancellationScheduled.PreviewProps = {
  firstName: 'Sarah',
  accessUntil: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
  manageUrl: 'https://anywherelearning.co/account/settings',
  surveyToken: 'preview-token',
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
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const micro = { fontSize: '12.5px', color: C_MUTED, marginTop: '14px', fontFamily: FONT_BODY };
const stepDot = { width: '34px', height: '34px', borderRadius: '50%', color: '#FFFFFF', fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: '34px', textAlign: 'center' as const };
const stepCell = { verticalAlign: 'top' as const, padding: '3px 0 20px 16px' };
const stepBody = { fontSize: '15.5px', lineHeight: 1.6, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };
const aside = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '12px' };
const surveyLead = { fontFamily: FONT_DISPLAY, fontSize: '21px', lineHeight: 1.3, color: C_INK, margin: '8px 0 10px' };
const reasonPill = {
  display: 'inline-block',
  backgroundColor: C_CARD,
  border: `1px solid ${C_RULE}`,
  borderRadius: '999px',
  padding: '9px 16px',
  fontSize: '14px',
  fontWeight: 600,
  color: C_INK,
  textDecoration: 'none',
  fontFamily: FONT_BODY,
};
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
