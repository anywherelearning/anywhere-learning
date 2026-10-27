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
  /** Whether the founder rate is still open for new signups when this fires. */
  isFounderPhase: boolean;
  /** Stripe Checkout recovery URL (`session.after_expiration.recovery.url`) if
   *  available, sends them back to their pre-filled form. Falls back to /join. */
  resumeUrl: string;
  /** Live count of founder spots remaining (100 - active members). Optional.
   *  If omitted, the founder aside shows without the "X spots left" pill. */
  spotsLeft?: number;
  /** Billing plan of the abandoned checkout. Monthly drops all founder framing
   *  and shows $15/month. Defaults to annual. */
  plan?: 'annual' | 'monthly';
}

// Absolute, always-live host for email assets (never localhost).
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/**
 * Sent when a MEMBERSHIP Stripe Checkout session expires WITHOUT a
 * successful payment. Warm "I held your spot" tone, not a sales nudge.
 *
 * "Trail map" design (Oct 2026), same language as QuizPlanEmail:
 *   - Green header band, "nothing charged" badge
 *   - Resume CTA in a sage card
 *   - Three-stat card showing what's in the membership
 *   - "In case you were wondering" FAQ aside
 *   - Founder aside with live "X spots left" pill (only when founder)
 */
export default function AbandonedCheckoutMembership({
  firstName,
  isFounderPhase,
  resumeUrl,
  spotsLeft,
  plan,
}: Props) {
  const name = firstName?.trim() || 'there';
  const isMonthly = plan === 'monthly';
  // A monthly checkout never involves the founder rate, whatever the global
  // phase is, so suppress every founder line to match their cart.
  const founder = isFounderPhase && !isMonthly;
  const showFounderStamp = founder && typeof spotsLeft === 'number' && spotsLeft > 0;
  const priceLabel = isMonthly ? '$15' : founder ? '$99' : '$149';
  const subhead = founder
    ? 'Your spot, your founder rate, and the whole library, still waiting.'
    : 'Your spot and the whole library, still waiting.';

  return (
    <Html>
      <Head />
      <Preview>
        I held your spot. Pick up where you left off whenever you&apos;re ready.
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
                  <div style={h1}>Hi {name}, I held your spot for a bit.</div>
                  <div style={subline}>{subhead}</div>
                </td>
              </tr>

              {/* ── A note, not a nudge ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    Earlier today you started signing up for Anywhere Learning and got partway
                    through. Life happens. A kid needs something, an email pings, the dog gets out.
                    No judgment from this side.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    This is a note, not a nudge. I just wanted to leave you the link in case
                    you&apos;d like to come back to it.
                  </Text>
                </td>
              </tr>

              {/* ── Warm photo ── */}
              <tr>
                <td style={{ padding: '22px 36px 0' }}>
                  <Img
                    src={`${SITE}/email-trial-build.jpg`}
                    width="528"
                    alt="A parent and two kids building a garden bed together"
                    style={{ display: 'block', width: '100%', maxWidth: '528px', height: 'auto', border: `1px solid ${C_RULE}`, borderRadius: '12px' }}
                  />
                </td>
              </tr>

              {/* ── Resume checkout CTA ── */}
              <tr>
                <td style={{ padding: '22px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '22px 24px 24px', textAlign: 'center' as const }}>
                          <div style={{ ...label, color: C_FOREST }}>PICK UP WHERE YOU LEFT OFF</div>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '16px auto 0' }}>
                            <tbody>
                              <tr>
                                <td style={btnCell}>
                                  <Link href={resumeUrl} style={btn}>Resume my checkout &rarr;</Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={micro}>
                            {founder ? (
                              <>
                                Founder rate held · $99/year, locked in for life.
                                <br />
                                Founder spots are filling, your rate holds while they last.
                              </>
                            ) : (
                              <>
                                Membership · {isMonthly ? '$15/month' : '$149/year'}, cancel anytime.
                                <br />
                                14-day full refund if it&apos;s not for you.
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Inside the membership ── */}
              <tr>
                <td style={{ padding: '32px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>INSIDE THE MEMBERSHIP</div>
                  <div style={h2}>
                    {isMonthly ? 'A whole library of' : 'One year of'} real-world learning.
                  </div>
                  <Text style={{ ...p, margin: '10px 0 0' }}>
                    Here&apos;s what&apos;s waiting on the other side of that checkout button. The
                    whole library, three levels per activity so every kid does the same one together,
                    and the part that does the deciding for you: tell it your time and it picks the
                    next thing, every month arrives already set up, and what you finish becomes a
                    printable record without you lifting a finger.
                  </Text>
                </td>
              </tr>

              {/* ── Cart contents (3 stats) ── */}
              <tr>
                <td style={{ padding: '20px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={statCard}>
                    <tbody>
                      <tr>
                        <td colSpan={3} style={{ padding: '16px 18px 0', textAlign: 'center' as const }}>
                          <span style={statPill}>
                            {isMonthly ? 'MONTHLY MEMBERSHIP' : `ANNUAL MEMBERSHIP${founder ? ' · FOUNDER RATE' : ''}`}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <Stat num="120+" name="ACTIVITIES" desc="Across twelve real-life skill areas." />
                        <Stat num="4×" name="DROPS A YEAR" desc="New activities every quarter, included." />
                        <Stat
                          num={priceLabel}
                          name={founder ? 'LOCKED IN' : isMonthly ? 'PER MONTH' : 'PER YEAR'}
                          desc={
                            founder
                              ? 'Founder rate for life. Renews at the same price.'
                              : isMonthly
                                ? 'Renews monthly. Cancel anytime.'
                                : 'Renews annually. Cancel anytime.'
                          }
                        />
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── In case you were wondering (FAQ aside) ── */}
              <tr>
                <td style={{ padding: '32px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>IN CASE YOU WERE WONDERING</div>
                  <div style={h2}>The three questions I get most.</div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '16px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={aside}>
                    <tbody>
                      <Faq q={<>&ldquo;Will my kid actually use it?&rdquo;</>} first>
                        Every activity is hands-on, and you do it with them. Real cooking, real
                        building, real time outside. No screens required. Most land the first try.
                      </Faq>
                      <Faq q={<>&ldquo;What if it doesn&apos;t click for us?&rdquo;</>}>
                        14-day full refund, no questions, no awkward emails. Just reply and it&apos;s done.
                      </Faq>
                      <Faq q={`“Why ${priceLabel} when there’s free stuff out there?”`}>
                        Pinterest takes hours. This is a teacher&apos;s library, built to land the
                        first try, with three skill levels so it actually fits your kid. Less time
                        searching, more time doing.
                      </Faq>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Founder aside ── */}
              {founder && (
                <tr>
                  <td style={{ padding: '24px 36px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={founderBox}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '18px 20px' }}>
                            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                              <tbody>
                                <tr>
                                  <td style={{ verticalAlign: 'middle' }}>
                                    <div style={{ ...label, color: C_EARTH }}>THE FOUNDER RATE</div>
                                  </td>
                                  {showFounderStamp && (
                                    <td style={{ verticalAlign: 'middle', textAlign: 'right' as const }}>
                                      <span style={{ ...badge, fontSize: '11px', padding: '5px 11px' }}>
                                        {spotsLeft} SPOTS LEFT
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              </tbody>
                            </table>
                            <div style={{ fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '8px', fontFamily: FONT_BODY }}>
                              <strong style={{ color: C_INK }}>$99/year</strong>, locked in for as long
                              as you stay a member, the first 100 only. After that, it&apos;s $149 for
                              everyone else. Your spot is still being held.
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
                    Questions before you sign up? This comes straight to me, so just reply.
                  </Text>
                  <Text style={{ ...p, margin: '16px 0 6px' }}>xo,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              {/* ── Footer ── */}
              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                  <Text style={legal}>
                    You&apos;re getting this because you started a checkout on anywherelearning.co and
                    didn&apos;t finish. Nothing has been charged.
                    {founder ? ' Founder spots are limited to the first 100 members.' : ''}
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

// ── Reusable: one stat cell ──
function Stat({ num, name, desc }: { num: string; name: string; desc: string }) {
  return (
    <td style={statCell}>
      <div style={statNum}>{num}</div>
      <div style={{ ...label, fontSize: '11px', color: C_FOREST, marginTop: '6px' }}>{name}</div>
      <div style={statDesc}>{desc}</div>
    </td>
  );
}

// ── Reusable: one FAQ row inside the sage aside ──
function Faq({ q, first, children }: { q: React.ReactNode; first?: boolean; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: '16px 20px', borderTop: first ? 'none' : `1px dashed ${C_RULE}` }}>
        <div style={faqQ}>{q}</div>
        <div style={faqA}>{children}</div>
      </td>
    </tr>
  );
}

// Preview props for `npm run email:preview`.
AbandonedCheckoutMembership.PreviewProps = {
  firstName: 'Sarah',
  isFounderPhase: true,
  resumeUrl: 'https://checkout.stripe.com/c/pay/example',
  spotsLeft: 48,
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
const h2 = { fontFamily: FONT_DISPLAY, fontSize: '24px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const subline = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const sageCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', lineHeight: 1.6, color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const aside = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '12px' };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };

// ── Stat card ──
const statCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CARD, border: `1px solid ${C_RULE}`, borderRadius: '14px', tableLayout: 'fixed' as const };
const statPill = { ...label, fontSize: '11px', color: C_INK, backgroundColor: C_SAGE, padding: '6px 12px', borderRadius: '999px', display: 'inline-block' };
const statCell = { width: '33.33%', padding: '14px 10px 18px', verticalAlign: 'top' as const, textAlign: 'center' as const };
const statNum = { fontFamily: FONT_DISPLAY, fontSize: '28px', lineHeight: 1.1, color: C_INK };
const statDesc = { fontSize: '13px', lineHeight: 1.45, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };

// ── FAQ ──
const faqQ = { fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: 1.35, color: C_INK };
const faqA = { fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '6px', fontFamily: FONT_BODY };

// ── Founder aside ──
const founderBox = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: '#F6EEE2', border: '1px solid #E8C99A', borderRadius: '12px' };
