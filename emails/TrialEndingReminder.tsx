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
  /** Whether they locked the founder rate ($99/yr) or the standard rate ($149/yr). */
  isFounderPhase: boolean;
  /** ISO date string for the trial end / first charge. */
  trialEndDate: string;
  /** Link to account settings so they can manage / cancel. */
  manageUrl: string;
  /** Link to the library dashboard. */
  homeUrl: string;
  /** Billing plan. Monthly swaps the price/interval wording; defaults to annual. */
  plan?: 'annual' | 'monthly';
  /** Discounted first charge (e.g. '$79' for the Fall offer). Overrides the plan price. */
  priceOverride?: string;
}

// Absolute, always-live host for email assets (never localhost), so images
// render in every inbox regardless of deploy state or NEXT_PUBLIC_URL.
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;
const EMAIL_COLLAGE = `${SITE}/email-library-hero-v2.jpg`;

/**
 * Trial-ending heads-up, "Trail map" design (Oct 2026, matches QuizPlanEmail
 * and the Kit sequence emails). Sent by the Stripe webhook when
 * customer.subscription.trial_will_end fires, 3 days before the trial
 * converts (day 4 of the 7-day trial). Honest billing: what happens, when,
 * and how to stop it. No dark patterns.
 *
 * The footer ships "Manage account" only (no "Email preferences" or
 * "Unsubscribe": this is a transactional email and those destinations
 * don't exist yet).
 */
export default function TrialEndingReminder({
  firstName,
  isFounderPhase,
  trialEndDate,
  manageUrl,
  homeUrl,
  plan,
  priceOverride,
}: Props) {
  const name = firstName?.trim() || 'there';

  const dateObj = new Date(trialEndDate);
  const shortDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const fullDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const daysFromNow = Math.max(
    1,
    Math.round((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  const daysLabel = daysFromNow === 1 ? '1 day' : `${daysFromNow} days`;

  const isMonthly = plan === 'monthly';
  const price = priceOverride ?? (isMonthly ? '$15' : isFounderPhase ? '$99' : '$149');
  /** "for the year" / "for the month" phrasing. */
  const forThe = isMonthly ? 'for the month' : 'for the year';

  return (
    <Html>
      <Head />
      <Preview>
        Your free trial ends {shortDate}. A quick heads-up so nothing lands out of nowhere.
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
                          <span style={badge}>{daysLabel.toUpperCase()} LEFT</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>Hi {name}, your trial ends in {daysLabel}.</div>
                  <div style={subline}>A friendly heads-up, so nothing lands out of nowhere.</div>
                </td>
              </tr>

              {/* ── The heads-up ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    I promised no surprise charges, so here it is in plain words: on {shortDate},
                    your free trial ends and your membership starts. Your card will be charged{' '}
                    {price} {forThe}
                    {isFounderPhase
                      ? ', at the founder rate you locked in when you signed up'
                      : ''}
                    . From that moment, you can download any guide to keep.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    If Anywhere Learning has earned a spot in your family&apos;s weeks, you
                    don&apos;t need to do a thing. If it hasn&apos;t, canceling takes one click.
                    No questions, no guilt trip, no charge.
                  </Text>
                </td>
              </tr>

              {/* ── Plain summary ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '20px 24px 18px' }}>
                          <div style={{ ...label, color: C_FOREST }}>THE PLAIN SUMMARY</div>
                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ width: '100%', borderCollapse: 'collapse' as const, marginTop: '8px' }}
                          >
                            <tbody>
                              <tr>
                                <td style={{ ...summaryKey, width: '150px' }}>Membership begins</td>
                                <td style={summaryValue}>{fullDate}</td>
                              </tr>
                              <tr>
                                <td style={summaryKey}>Your price</td>
                                <td style={summaryValue}>
                                  {price} {forThe}
                                  {isFounderPhase && (
                                    <>
                                      <br />
                                      <span style={founderPill}>FOUNDER RATE, LOCKED FOR LIFE</span>
                                    </>
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td style={summaryKeyLast}>What unlocks</td>
                                <td style={summaryValueLast}>
                                  Unlimited downloads
                                  <br />
                                  <span style={{ fontSize: '13.5px', fontWeight: 400, color: C_BODY }}>
                                    plus new guide drops every quarter
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── One more activity CTA ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0', textAlign: 'center' as const }}>
                          <Img
                            src={EMAIL_COLLAGE}
                            alt="A fan of Anywhere Learning activities and the Future-Ready Skills Map"
                            width="240"
                            style={{ display: 'inline-block', width: '240px', maxWidth: '100%', height: 'auto' }}
                          />
                          <div style={{ ...label, color: C_FOREST, marginTop: '16px' }}>
                            THREE DAYS IS ONE MORE ACTIVITY
                          </div>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '16px auto 0' }}>
                            <tbody>
                              <tr>
                                <td style={btnCell}>
                                  <Link href={homeUrl} style={btn}>Continue our adventure &rarr;</Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* The button lands on the map, where the next stop is
                              already chosen. Telling them to pick one would
                              describe a product we deliberately don't ship. */}
                          <div style={micro}>
                            Your next stop is already waiting. Grab what you have at home and see
                            how it feels to do something real together. That&apos;s the whole test.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Need to change something ── */}
              <tr>
                <td style={{ padding: '32px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>NEED TO CHANGE SOMETHING?</div>
                  <div style={h2}>No buried buttons, I promise.</div>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={cancelCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' as const }}>
                          <div style={{ fontSize: '15.5px', fontWeight: 700, color: C_INK, fontFamily: FONT_BODY }}>
                            Cancel my trial
                          </div>
                          <div style={{ fontSize: '14.5px', lineHeight: 1.55, color: C_BODY, marginTop: '3px', fontFamily: FONT_BODY }}>
                            One click before {shortDate} and you&apos;re never charged. We part as
                            friends.
                          </div>
                        </td>
                        <td
                          style={{
                            width: '96px',
                            padding: '16px 20px 16px 0',
                            verticalAlign: 'middle' as const,
                            textAlign: 'right' as const,
                          }}
                        >
                          <Link href={manageUrl} style={cancelLink}>
                            Cancel &rarr;
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Text style={{ ...p, fontSize: '14.5px', color: C_MUTED, margin: '14px 0 0' }}>
                    Questions before then? Just reply.
                  </Text>
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
                    Unless you cancel before {fullDate}, the card you saved at sign-up will be
                    charged {price} USD for one {isMonthly ? 'month' : 'year'} of Anywhere
                    Learning membership{isMonthly ? ', renewing monthly' : ''}. You can
                    cancel anytime before then with the link above or from your account page, and
                    you&apos;ll pay nothing. And if you change your
                    mind after the charge, the 14-day money-back guarantee still applies. Reply
                    within 14 days and I&apos;ll refund you in full, no questions asked.
                  </Text>
                  <Text style={{ ...legal, marginTop: '10px' }}>
                    <Link href={manageUrl} style={{ color: '#A09A8C' }}>
                      Manage account
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

// Preview props for `npm run email:preview`.
TrialEndingReminder.PreviewProps = {
  firstName: 'Sarah',
  isFounderPhase: true,
  trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  manageUrl: 'https://anywherelearning.co/account/settings',
  homeUrl: 'https://anywherelearning.co/account/home',
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
const h2 = { fontFamily: FONT_DISPLAY, fontSize: '24px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const subline = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const sageCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '13px', lineHeight: 1.55, color: C_MUTED, marginTop: '12px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', fontFamily: FONT_BODY };

const summaryCell = { padding: '12px 0', verticalAlign: 'top' as const, fontFamily: FONT_BODY };
const summaryKey = { ...summaryCell, borderBottom: `1px dashed ${C_RULE}`, fontSize: '14px', color: C_MUTED };
const summaryValue = {
  ...summaryCell,
  borderBottom: `1px dashed ${C_RULE}`,
  fontSize: '15px',
  fontWeight: 700,
  color: C_INK,
  textAlign: 'right' as const,
};
const summaryKeyLast = { ...summaryCell, padding: '12px 0 4px', fontSize: '14px', color: C_MUTED };
const summaryValueLast = { ...summaryCell, padding: '12px 0 4px', fontSize: '15px', fontWeight: 700, color: C_INK, textAlign: 'right' as const };
const founderPill = {
  display: 'inline-block',
  marginTop: '6px',
  backgroundColor: '#E8C99A',
  color: C_INK,
  borderRadius: '999px',
  fontFamily: FONT_MONO,
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  padding: '4px 9px',
  whiteSpace: 'nowrap' as const,
};
const cancelCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_CARD,
  border: `1px solid ${C_RULE}`,
  borderRadius: '12px',
  marginTop: '16px',
};
const cancelLink = {
  fontSize: '15px',
  fontWeight: 700,
  color: C_FOREST,
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
  fontFamily: FONT_BODY,
};
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
