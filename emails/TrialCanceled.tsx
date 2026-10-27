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

interface Props {
  /** The recipient's first name (or undefined if we don't know it). */
  firstName?: string;
  /** Billing plan the trial was on. Only used for subtle wording. */
  plan?: 'annual' | 'monthly';
  /** exit_surveys row id, becomes the opaque token in the one-tap reason
   *  links. When missing (DB hiccup at send time) the reason row is hidden
   *  and the email still works as a plain confirmation. */
  surveyToken?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

// Absolute, always-live host for email assets (never localhost).
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/** The one-tap exit-survey choices. Keys must match /api/exit-reason's allowlist. */
export const EXIT_REASONS: Array<{ key: string; label: string }> = [
  { key: 'price', label: 'It got too expensive' },
  { key: 'time', label: 'We never found the time to use it' },
  { key: 'engagement', label: "My kids didn't take to the activities" },
  { key: 'ages', label: 'Not the right ages or stages for us' },
  { key: 'other', label: 'Something else' },
];

/**
 * Trial-canceled confirmation. Sent the moment a free trial is canceled
 * (they never paid). Job one: kill the "will I still get charged?" anxiety
 * in the first sentence. Job two: one-tap exit survey, zero guilt.
 *
 * No founder pitch, no discount, no dark patterns. A clean goodbye is the
 * best win-back asset this brand has.
 */
export default function TrialCanceled({ firstName, plan, surveyToken }: Props) {
  const name = firstName?.trim() || 'there';
  void plan; // reserved for future wording tweaks; trial cancels never paid either way

  return (
    <Html>
      <Head />
      <Preview>
        Your trial is canceled and nothing will be charged. This is your confirmation.
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
                          <span style={badge}>NOTHING CHARGED</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>Your trial is canceled, {name}.</div>
                  <div style={subline}>All taken care of. This email is your written confirmation.</div>
                </td>
              </tr>

              {/* ── Confirmation ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    Nothing will be charged. Not today, not later. The card you saved at sign-up
                    stays untouched.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    And no guilt trip from me. Wrong season, too much going on, not the right
                    fit, all completely fine. I&apos;m glad you gave it a look.
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
                    inbox, not a support queue, and I read every one. And if a better season comes around, the library
                    will be right here.
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
                    You&apos;re receiving this note because your free trial of Anywhere Learning was
                    canceled. Your card was not charged and will not be. If you didn&apos;t cancel
                    this yourself, just reply to this email and we&apos;ll sort it out.
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
TrialCanceled.PreviewProps = {
  firstName: 'Sarah',
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
