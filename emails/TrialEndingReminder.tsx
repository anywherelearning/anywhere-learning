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
  libraryUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

// Email images live on the Vercel Blob CDN, NOT the app domain. A stable
// public URL means they render in every inbox regardless of deploy state or
// NEXT_PUBLIC_URL (localhost in dev would otherwise yield broken images).
const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';
const EMAIL_COLLAGE = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-library-hero.png';

/**
 * Trial-ending heads-up — v2, implemented from the Claude Design handoff
 * ("Free trial" project, Reminder Email.dc.html, Jun 2026). Sent by the
 * Stripe webhook when customer.subscription.trial_will_end fires, 3 days
 * before the trial converts. Honest billing: what happens, when, and how
 * to stop it. No dark patterns.
 *
 * One deliberate deviation from the design: the footer ships "Manage
 * account" only (no "Email preferences · Unsubscribe" — this is a
 * transactional email and those destinations don't exist yet).
 */
export default function TrialEndingReminder({
  firstName,
  isFounderPhase,
  trialEndDate,
  manageUrl,
  libraryUrl,
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

  const price = isFounderPhase ? '$99' : '$149';

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        Your free trial ends {shortDate}. A quick heads-up so nothing lands out of nowhere.
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

              {/* ── 2 · The heads-up ── */}
              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    A friendly heads-up
                  </div>
                  <div style={h1}>
                    Hi {name}, your trial ends{' '}
                    <span style={{ fontStyle: 'italic', color: C_FOREST }}>in {daysLabel}.</span>
                  </div>
                  <Text style={p}>
                    I promised no surprise charges, so here it is in plain words: on {shortDate},
                    your free trial ends and your membership starts. Your card will be charged{' '}
                    {price} for the year
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

              {/* ── 3 · Plain summary card ── */}
              <tr>
                <td style={{ padding: '28px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={summaryCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '22px 26px 20px' }}>
                          <div style={summaryLabel}>The plain summary</div>
                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{
                              width: '100%',
                              borderCollapse: 'collapse' as const,
                              marginTop: '10px',
                            }}
                          >
                            <tbody>
                              <tr>
                                <td style={{ ...summaryKey, width: '150px' }}>
                                  Membership begins
                                </td>
                                <td style={summaryValue}>{fullDate}</td>
                              </tr>
                              <tr>
                                <td style={summaryKey}>Your price</td>
                                <td style={summaryValue}>
                                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: C_INK }}>
                                    {price} for the year
                                  </span>
                                  {isFounderPhase && (
                                    <>
                                      <br />
                                      <span style={founderPill}>
                                        Founder rate, locked for life
                                      </span>
                                    </>
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ ...summaryKeyLast }}>What unlocks</td>
                                <td style={summaryValueLast}>
                                  Unlimited downloads
                                  <br />
                                  <span style={{ fontSize: '13px', fontWeight: 400, color: C_BODY }}>
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

              {/* ── 4 · One more activity CTA ── */}
              <tr>
                <td style={{ padding: '32px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '24px 28px', textAlign: 'center' as const }}>
                          <Img
                            src={EMAIL_COLLAGE}
                            alt="A fan of Anywhere Learning activity guides with the Skills Map in front"
                            width="280"
                            height="216"
                            style={{
                              display: 'inline-block',
                              width: '280px',
                              height: 'auto',
                              maxWidth: '100%',
                            }}
                          />
                          <div style={{ ...ctaLabel, marginTop: '16px' }}>
                            Three days is one more activity
                          </div>
                          <div style={{ marginTop: '14px' }}>
                            <Link href={libraryUrl} style={btn}>
                              Open my library &rarr;
                            </Link>
                          </div>
                          <div style={ctaMicro}>
                            Pick one guide, grab what you already have at home, and see how it
                            feels to do something real together. That&apos;s the whole test.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── 5 · Need to change something ── */}
              <tr>
                <td style={{ padding: '38px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    Need to change something?
                  </div>
                  <div style={h2}>
                    No buried buttons,{' '}
                    <span style={{ fontStyle: 'italic', color: C_FOREST }}>I promise.</span>
                  </div>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={cancelCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' as const }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: C_INK }}>
                            Cancel my trial
                          </div>
                          <div
                            style={{
                              fontSize: '13.5px',
                              lineHeight: 1.55,
                              color: C_BODY,
                              marginTop: '3px',
                            }}
                          >
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
                  <div
                    style={{
                      fontSize: '13.5px',
                      lineHeight: 1.6,
                      color: C_MUTED,
                      marginTop: '14px',
                      fontFamily: FONT_BODY,
                    }}
                  >
                    Questions before then? Just reply, it lands straight in my inbox and I read
                    every one.
                  </div>
                </td>
              </tr>

              {/* ── 6 · Sign-off ── */}
              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={{ fontSize: '15.5px', color: C_BODY }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '4px' }}>
                    Founder · Anywhere Learning
                  </div>
                </td>
              </tr>

              {/* ── 7 · Fine print ── */}
              <tr>
                <td style={{ padding: '28px 48px 32px' }}>
                  <div style={fadeDivider} />
                  <Text style={legal}>
                    Unless you cancel before {fullDate}, the card you saved at sign-up will be
                    charged {price} USD for one year of Anywhere Learning membership. You can
                    cancel anytime before then with the link above or from your account page, and
                    you&apos;ll pay nothing. And if you change your
                    mind after the charge, the 14-day money-back guarantee still applies. Reply
                    within 14 days and I&apos;ll refund you in full, no questions asked.
                  </Text>
                  <div style={{ fontSize: '12px', color: C_MUTED, marginTop: '12px' }}>
                    <Link href={manageUrl} style={{ color: C_MUTED }}>
                      Manage account
                    </Link>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>

          {/* Outside-the-envelope credit line */}
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
TrialEndingReminder.PreviewProps = {
  firstName: 'Sarah',
  isFounderPhase: true,
  trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  manageUrl: 'https://anywherelearning.co/account/settings',
  libraryUrl: 'https://anywherelearning.co/account',
} satisfies Props;

/* ─────────────────────────────────────────────────────────────
   Brand tokens — from the Claude Design handoff (Free trial project),
   kept in sync with MembershipWelcome.
   ───────────────────────────────────────────────────────────── */

const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT = "'Dancing Script', 'Brush Script MT', cursive";

const C_CREAM = '#FAF8F3';
const C_CREAM_2 = '#F2EFE4';
const C_SAGE_SOFT = '#E6EBDF';
const C_SAGE_BORDER = '#C9D3BE';
const C_INK = '#2D3A2E';
const C_BODY = '#4F5A50';
const C_MUTED = '#7B8378';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_FOREST_DARK = '#3A5A40';
const C_TERRA = '#C97B5C';
const C_TERRA_DARK = '#7A3D24';
const C_TERRA_SOFT = '#F2DECF';

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

const brandName = {
  fontFamily: FONT_DISPLAY,
  fontSize: '25px',
  color: C_INK,
  marginTop: '10px',
};

const tagline = {
  fontSize: '13px',
  color: C_MUTED,
  marginTop: '5px',
  fontFamily: FONT_BODY,
};

// Solid fallback color + fading gradient where supported.
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

const h2 = {
  fontFamily: FONT_DISPLAY,
  fontSize: '23px',
  color: C_INK,
  marginTop: '10px',
};

const p = {
  fontSize: '15.5px',
  lineHeight: 1.68,
  color: C_BODY,
  margin: '18px 0 0',
  fontFamily: FONT_BODY,
};

const summaryCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_CREAM_2,
  borderRadius: '14px',
};

const summaryLabel = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  color: C_MUTED,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const summaryKey = {
  padding: '12px 0',
  borderBottom: `1px dashed ${C_RULE}`,
  fontSize: '13.5px',
  color: C_MUTED,
  verticalAlign: 'top' as const,
  fontFamily: FONT_BODY,
};

const summaryValue = {
  padding: '12px 0',
  borderBottom: `1px dashed ${C_RULE}`,
  fontSize: '14.5px',
  fontWeight: 600,
  color: C_INK,
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  fontFamily: FONT_BODY,
};

const summaryKeyLast = {
  padding: '12px 0 4px',
  fontSize: '13.5px',
  color: C_MUTED,
  verticalAlign: 'top' as const,
  fontFamily: FONT_BODY,
};

const summaryValueLast = {
  padding: '12px 0 4px',
  fontSize: '14.5px',
  fontWeight: 600,
  color: C_INK,
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  fontFamily: FONT_BODY,
};

const founderPill = {
  display: 'inline-block',
  marginTop: '5px',
  backgroundColor: C_TERRA_SOFT,
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: C_TERRA_DARK,
  textTransform: 'uppercase' as const,
  padding: '3px 9px',
  whiteSpace: 'nowrap' as const,
  fontFamily: FONT_BODY,
};

const sageCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_SAGE_SOFT,
  border: `1px solid ${C_SAGE_BORDER}`,
  borderRadius: '14px',
};

const ctaLabel = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  color: C_FOREST_DARK,
  textTransform: 'uppercase' as const,
  marginTop: '12px',
  fontFamily: FONT_BODY,
};

const btn = {
  display: 'inline-block',
  backgroundColor: C_FOREST,
  color: '#F7F4EA',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '13px 32px',
  borderRadius: '11px',
  fontFamily: FONT_BODY,
};

const ctaMicro = {
  fontSize: '12.5px',
  color: C_MUTED,
  marginTop: '12px',
  lineHeight: 1.55,
  fontFamily: FONT_BODY,
};

const cancelCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_CREAM,
  border: `1px solid ${C_RULE}`,
  borderRadius: '12px',
  marginTop: '16px',
};

const cancelLink = {
  fontSize: '14.5px',
  fontWeight: 600,
  color: C_FOREST,
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
  fontFamily: FONT_BODY,
};

const signature = {
  fontFamily: FONT_SCRIPT,
  fontSize: '46px',
  fontWeight: 600,
  color: C_TERRA,
  lineHeight: 1.15,
  marginTop: '2px',
};

const legal = {
  fontSize: '12.5px',
  lineHeight: 1.6,
  color: C_MUTED,
  margin: '18px 0 0',
  fontFamily: FONT_BODY,
};

const credit = {
  textAlign: 'center' as const,
  fontSize: '12px',
  color: C_MUTED,
  paddingTop: '10px',
  fontFamily: FONT_BODY,
};
