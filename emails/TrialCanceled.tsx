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
  /** exit_surveys row id — becomes the opaque token in the one-tap reason
   *  links. When missing (DB hiccup at send time) the reason row is hidden
   *  and the email still works as a plain confirmation. */
  surveyToken?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';

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
 * No founder pitch, no discount, no dark patterns — a clean goodbye is the
 * best win-back asset this brand has.
 */
export default function TrialCanceled({ firstName, plan, surveyToken }: Props) {
  const name = firstName?.trim() || 'there';
  void plan; // reserved for future wording tweaks; trial cancels never paid either way

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        Your trial is canceled and nothing will be charged. This is your confirmation.
      </Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={envelope}>
            <tbody>

              {/* ── 1 · Brand header ── */}
              <tr>
                <td style={{ padding: '38px 48px 26px', textAlign: 'center' as const }}>
                  <Img
                    src={EMAIL_LOGO}
                    alt="Anywhere Learning"
                    width="46"
                    height="46"
                    style={{ display: 'inline-block', width: '46px', height: '46px' }}
                  />
                  <div style={brandName}>
                    anywhere <span style={{ fontStyle: 'italic', color: C_FOREST }}>learning</span>
                  </div>
                  <div style={tagline}>
                    Hands-on activities for raising capable kids, ready for real life.
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0 48px' }}>
                  <div style={fadeDivider} />
                </td>
              </tr>

              {/* ── 2 · Confirmation ── */}
              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    All taken care of
                  </div>
                  <div style={h1}>
                    Your trial is{' '}
                    <span style={{ fontStyle: 'italic', color: C_FOREST }}>canceled</span>, {name}.
                  </div>
                  <Text style={p}>
                    Nothing will be charged. Not today, not later. The card you saved at sign-up
                    stays untouched, and this email is your written confirmation.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    And no guilt trip from me. Wrong season, too much going on, not the right
                    fit, all completely fine. I&apos;m glad you gave it a look.
                  </Text>
                </td>
              </tr>

              {/* ── 3 · One-tap exit survey ── */}
              {surveyToken && (
                <tr>
                  <td style={{ padding: '28px 48px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '22px 26px 24px' }}>
                            <Text style={surveyLabel}>One question, only if you feel like it</Text>
                            <Text style={surveyLead}>What made today the day?</Text>
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
                            <Text style={surveyMicro}>
                              One tap, that&apos;s it. It genuinely shapes what I build next.
                            </Text>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              {/* ── 4 · Sign-off ── */}
              <tr>
                <td style={{ padding: '30px 48px 0' }}>
                  <Text style={{ ...p, margin: 0 }}>
                    If it was something specific, hit reply and tell me. This lands straight in my
                    inbox, not a support queue, and I read every one. And if a better season comes
                    around, the library will be right here.
                  </Text>
                  <div style={{ fontSize: '15.5px', color: C_BODY, marginTop: '16px' }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '4px' }}>
                    Founder · Anywhere Learning
                  </div>
                </td>
              </tr>

              {/* ── 5 · Fine print ── */}
              <tr>
                <td style={{ padding: '28px 48px 32px' }}>
                  <div style={fadeDivider} />
                  <Text style={legal}>
                    You&apos;re receiving this note because your free trial of Anywhere Learning was
                    canceled. Your card was not charged and will not be. If you didn&apos;t cancel
                    this yourself, just reply to this email and we&apos;ll sort it out.
                  </Text>
                </td>
              </tr>

            </tbody>
          </table>

          <div style={credit}>
            Anywhere Learning · <em style={{ fontStyle: 'italic' }}>Built by Amelie</em> · Made in
            Nelson, BC
          </div>
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

/* ── Brand tokens (shared with the other transactional emails) ── */

const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT = "'Dancing Script', 'Brush Script MT', cursive";

const C_CREAM = '#FAF8F3';
const C_SAGE_SOFT = '#E6EBDF';
const C_SAGE_BORDER = '#C9D3BE';
const C_INK = '#2D3A2E';
const C_BODY = '#4F5A50';
const C_MUTED = '#7B8378';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_FOREST_DARK = '#3A5A40';

const body = {
  backgroundColor: '#E9E5DC',
  fontFamily: FONT_BODY,
  margin: 0,
  padding: '24px 12px',
};

const envelope = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_CREAM,
  border: `1px solid ${C_RULE}`,
  borderRadius: '18px',
};

const brandName = { fontFamily: FONT_DISPLAY, fontSize: '25px', color: C_INK, marginTop: '10px' };
const tagline = { fontSize: '13px', color: C_MUTED, marginTop: '5px', fontFamily: FONT_BODY };

const fadeDivider = {
  height: '1px',
  backgroundColor: C_RULE,
  backgroundImage: `linear-gradient(to right, rgba(216,212,197,0), ${C_RULE}, rgba(216,212,197,0))`,
};

const eyebrow = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.2em',
  color: C_MUTED,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const eyebrowRule = {
  display: 'inline-block',
  width: '26px',
  height: '1px',
  backgroundColor: C_FOREST,
  verticalAlign: '3px',
  marginRight: '10px',
};

const h1 = {
  fontFamily: FONT_DISPLAY,
  fontSize: '31px',
  lineHeight: 1.22,
  color: C_INK,
  marginTop: '12px',
};

const p = {
  fontSize: '15.5px',
  lineHeight: 1.68,
  color: C_BODY,
  margin: '18px 0 0',
  fontFamily: FONT_BODY,
};

const sageCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_SAGE_SOFT,
  border: `1px solid ${C_SAGE_BORDER}`,
  borderRadius: '14px',
};

const surveyLabel = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  color: C_FOREST_DARK,
  textTransform: 'uppercase' as const,
  margin: 0,
  fontFamily: FONT_BODY,
};

const surveyLead = {
  fontFamily: FONT_DISPLAY,
  fontSize: '20px',
  color: C_INK,
  margin: '8px 0 12px',
};

const reasonPill = {
  display: 'inline-block',
  backgroundColor: C_CREAM,
  border: `1px solid ${C_SAGE_BORDER}`,
  borderRadius: '999px',
  padding: '9px 16px',
  fontSize: '13.5px',
  fontWeight: 600,
  color: C_FOREST_DARK,
  textDecoration: 'none',
  fontFamily: FONT_BODY,
};

const surveyMicro = {
  fontSize: '12.5px',
  color: C_MUTED,
  margin: '14px 0 0',
  fontFamily: FONT_BODY,
};

const signature = {
  fontFamily: FONT_SCRIPT,
  fontSize: '30px',
  color: C_FOREST_DARK,
  lineHeight: 1.2,
};

const legal = {
  fontSize: '12px',
  lineHeight: 1.6,
  color: C_MUTED,
  margin: '16px 0 0',
  fontFamily: FONT_BODY,
};

const credit = {
  textAlign: 'center' as const,
  fontSize: '12px',
  color: C_MUTED,
  padding: '18px 0 6px',
  fontFamily: FONT_BODY,
};
