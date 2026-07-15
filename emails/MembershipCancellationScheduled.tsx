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
  /** exit_surveys row id — opaque token for the one-tap reason links.
   *  When missing, the reason row is hidden. */
  surveyToken?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';

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
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        Cancellation confirmed. You keep full access until {until}, then no further billing.
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
                    Cancellation confirmed
                  </div>
                  <div style={h1}>
                    All set, <span style={{ fontStyle: 'italic', color: C_FOREST }}>{name}</span>.
                  </div>
                  <Text style={p}>
                    Your membership is canceled and you won&apos;t be billed again. You keep full
                    access, every guide, every download, until <strong style={strongInk}>{until}</strong>,
                    the end of the {per} you&apos;ve already paid for. After that it winds down
                    quietly. No further charges, no hoops.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Thank you for being a member. Truly. Every family that joined this early
                    shaped what it became.
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
                    inbox and I read every one. And if you change your mind before {until}, you can{' '}
                    <Link href={manageUrl} style={{ color: C_FOREST, fontWeight: 600 }}>
                      resume your membership
                    </Link>{' '}
                    from your account and nothing is interrupted.
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
                    You&apos;re receiving this note because your Anywhere Learning membership was
                    set to cancel. Access continues through {until}; no charges after that. If you
                    didn&apos;t cancel this yourself, reply to this email and we&apos;ll sort it out.
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
MembershipCancellationScheduled.PreviewProps = {
  firstName: 'Sarah',
  accessUntil: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
  manageUrl: 'https://anywherelearning.co/account/settings',
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

const strongInk = { color: C_INK, fontWeight: 600 };

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
