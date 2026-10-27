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
  /** Formatted amount that failed, e.g. "$79". */
  amount: string;
  /** Stripe's hosted invoice page: pay with a new card, no sign-in needed. */
  payUrl: string;
}

// Absolute, always-live host for email assets (never localhost).
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/**
 * Payment-failed note. Sent once per invoice when a renewal or a trial's
 * first charge is declined (status goes 'past_due'). Calm and practical:
 * the library pauses until the payment goes through, one button fixes it. Never names the
 * bank's decline reason; "insufficient funds" in an inbox is nobody's business.
 */
export default function PaymentFailed({ firstName, amount, payUrl }: Props) {
  const name = firstName?.trim() || 'there';

  return (
    <Html>
      <Head />
      <Preview>
        Your payment didn&apos;t go through. It&apos;s a one-minute fix to get your library back.
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
                          <span style={badge}>QUICK HEADS-UP</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>Your payment didn&apos;t go through, {name}.</div>
                  <div style={subline}>It happens all the time, and it&apos;s an easy fix.</div>
                </td>
              </tr>

              {/* ── What happened ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    Your <strong style={{ color: C_INK }}>{amount}</strong> payment for Anywhere Learning
                    was declined by your bank. Usually it&apos;s an expired card or a card limit.
                  </Text>
                </td>
              </tr>

              {/* ── Status aside ── */}
              <tr>
                <td style={{ padding: '22px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={aside}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '18px 22px 20px' }}>
                          <div style={{ ...label, color: C_FOREST }}>WHERE THINGS STAND</div>
                          <div style={{ fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '8px', fontFamily: FONT_BODY }}>
                            <strong style={{ color: C_INK }}>Your library is paused for now, and nothing is lost.</strong>{' '}
                            As soon as the payment goes through, everything is right where you left
                            it. We&apos;ll try the card again automatically over the next couple of
                            weeks, or you can fix it right now.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── The fix ── */}
              <tr>
                <td style={{ padding: '26px 36px 0', textAlign: 'center' as const }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                    <tbody>
                      <tr>
                        <td style={btnCell}>
                          <Link href={payUrl} style={btn}>Update my payment</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={micro}>Secure Stripe page. Takes a minute, no sign-in needed.</div>
                </td>
              </tr>

              {/* ── Sign-off ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>xo,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              {/* ── Footer ── */}
              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                  <Text style={legal}>
                    You&apos;re receiving this note because a payment for your Anywhere Learning
                    membership didn&apos;t go through. If you&apos;d rather not continue, you
                    don&apos;t need to do anything. If the payment can&apos;t be collected, your
                    membership ends on its own and nothing more is charged.
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
PaymentFailed.PreviewProps = {
  firstName: 'Sarah',
  amount: '$79',
  payUrl: 'https://invoice.stripe.com/i/preview',
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
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const aside = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '12px' };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
