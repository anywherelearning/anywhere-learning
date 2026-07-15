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
  /** The recipient's first name (or empty string if we don't know it). */
  firstName?: string;
  /** Magic-link sign-in URL from Clerk — signs them in + creates their account on first click. */
  signInUrl: string;
  /** Whether the buyer locked in the founder rate ($99/yr instead of $149/yr). */
  isFounderPhase: boolean;
  /** True when this signup started a free trial (no charge yet). */
  isTrial?: boolean;
  /** ISO date the trial converts to a paid membership. Only set when isTrial. */
  trialEndsAt?: string;
  /** Billing plan. Monthly swaps the price/interval wording; defaults to annual. */
  plan?: 'annual' | 'monthly';
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

// Email images live on the Vercel Blob CDN, NOT the app domain. A stable
// public URL means they render in every inbox regardless of deploy state or
// NEXT_PUBLIC_URL (localhost in dev would otherwise yield broken images).
const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';
const EMAIL_COLLAGE = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-library-hero.png';

/** "JUN 26" pill label. */
function pillDate(d: Date): string {
  return d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();
}

/** "June 26, 2026" for fine print. */
function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Welcome email — v3, implemented from the Claude Design handoff
 * ("Free trial" project, Welcome Email.dc.html, Jun 2026).
 *
 * Serves both signup flows:
 *   - free trial (isTrial)  → includes the "Your free trial, plainly"
 *     timeline box and trial-specific fine print
 *   - direct paid signup    → same layout without the trial box
 *
 * Faithful to the design with two deliberate deviations:
 *   - The design's footer had "Email preferences · Unsubscribe" links; this is
 *     a transactional email with no marketing list behind it, so dead links
 *     would mislead. We ship "Manage account" only.
 *   - The cancel reassurance line links to account settings (real) instead of
 *     "from any email I send" (not yet true of every email).
 */
export default function MembershipWelcome({
  firstName,
  signInUrl,
  isFounderPhase,
  isTrial,
  trialEndsAt,
  plan,
}: Props) {
  const name = firstName?.trim() || 'there';
  const isMonthly = plan === 'monthly';
  const price = isMonthly ? '$15' : isFounderPhase ? '$99' : '$149';
  /** "for the year" / "for the month" phrasing. */
  const per = isMonthly ? 'month' : 'year';

  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const headsUp = trialEnd ? new Date(trialEnd.getTime() - 3 * 24 * 60 * 60 * 1000) : null;
  const trialStart = new Date(); // rendered at send time = signup day

  const manageUrl = `${baseUrl}/account/settings`;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        {isTrial
          ? `Welcome, ${name}. Your trial is open, every guide is yours to explore, and nothing was charged today.`
          : `Welcome, ${name}. Real-world skills, hand-picked activities, and a person on the other end of the line.`}
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

              {/* ── 2 · Warm hello ── */}
              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    A warm hello
                  </div>
                  <div style={h1}>
                    Hi {name}, I&apos;m{' '}
                    <span style={{ fontStyle: 'italic', color: C_FOREST }}>so glad</span>{' '}
                    you&apos;re here.
                  </div>
                  <Text style={p}>
                    I taught for fifteen years before I left the classroom to homeschool my own
                    two kids. Somewhere along the way I noticed the learning that stuck was never
                    on a worksheet. It was the night we budgeted a grocery run, the afternoon we
                    built a wobbly birdhouse and laughed at it.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Everything in your new library comes from that idea. Real activities, low
                    prep, made to be done side by side. You don&apos;t need a plan for the whole
                    year. You just need one good hour this week.
                  </Text>
                </td>
              </tr>

              {/* ── 3 · Sign-in CTA card ── */}
              <tr>
                <td style={{ padding: '30px 48px 0' }}>
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
                          <div style={{ ...ctaLabel, marginTop: '16px' }}>One-click sign-in</div>
                          <div style={{ marginTop: '14px' }}>
                            <Link href={signInUrl} style={btn}>
                              Open my library &rarr;
                            </Link>
                          </div>
                          <div style={ctaMicro}>
                            This button signs you in on this device. No password to remember.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── 4 · How it works ── */}
              <tr>
                <td style={{ padding: '38px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    Getting started
                  </div>
                  <div style={h2}>How it works</div>
                  <table
                    role="presentation"
                    cellPadding={0}
                    cellSpacing={0}
                    style={{ width: '100%', borderCollapse: 'collapse' as const, marginTop: '16px' }}
                  >
                    <tbody>
                      <Step
                        n="1"
                        title="Start with your Skills Map"
                        last={false}
                        first
                      >
                        It&apos;s the parent roadmap. A calm picture of everything your kids can
                        learn to do, from first pancakes to first customer.
                      </Step>
                      <Step n="2" title="Pick one activity" last={false}>
                        Whatever fits this week. Twenty minutes or a whole afternoon, every guide
                        tells you exactly what to grab.
                      </Step>
                      <Step n="3" title="Do something real together" last>
                        Cook the meal, build the stand, plant the bed. The learning takes care of
                        itself.
                      </Step>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── 5 · Three levels ── */}
              <tr>
                <td style={{ padding: '28px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={levelsCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '22px 16px 20px', textAlign: 'center' as const }}>
                          <div style={levelsHeader}>Every guide comes in three levels</div>
                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            style={levelsRow}
                          >
                            <tbody>
                              <tr>
                                <Level filled={1} name="Explore" desc="a gentle first try" />
                                <Level filled={2} name="Develop" desc="more hands, less help" />
                                <Level filled={3} name="Extend" desc="they run the show" />
                              </tr>
                            </tbody>
                          </table>
                          <div style={levelsFootnote}>
                            Same activity, sized to your kid. Pick whichever fits today.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── 6 · Your free trial, plainly (trial signups only) ── */}
              {isTrial && trialEnd && headsUp && (
                <tr>
                  <td style={{ padding: '34px 48px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '24px 26px 22px' }}>
                            <div style={{ ...eyebrow, color: C_FOREST_DARK }}>
                              <span style={eyebrowRule} />
                              Your free trial, plainly
                            </div>

                            <table
                              role="presentation"
                              cellPadding={0}
                              cellSpacing={0}
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse' as const,
                                marginTop: '16px',
                              }}
                            >
                              <tbody>
                                <TrialRow label="TODAY" first>
                                  <strong style={strongInk}>$0 charged.</strong> For 14 days,
                                  read every guide in your browser, on any device, as much as you
                                  like. Want to save guides as PDFs? Start your membership anytime.
                                </TrialRow>
                                <TrialDivider />
                                <TrialRow label={pillDate(headsUp)}>
                                  <strong style={strongInk}>One friendly heads-up.</strong>{' '}
                                  I&apos;ll email you 3 days before anything changes. No surprise
                                  charges, I promise.
                                </TrialRow>
                                <TrialDivider />
                                <TrialRow label={pillDate(trialEnd)} last>
                                  <strong style={strongInk}>Membership begins.</strong> Your plan
                                  starts at {price} for the {per} and downloads unlock.
                                </TrialRow>
                              </tbody>
                            </table>

                            <div style={cancelNote}>
                              Not the right season for it?{' '}
                              <Link href={manageUrl} style={{ color: C_FOREST, fontWeight: 600 }}>
                                Cancel in one click
                              </Link>{' '}
                              and you&apos;ll pay nothing at all.
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              {/* ── 7 · Founder rate banner ── */}
              {isFounderPhase && (
                <tr>
                  <td style={{ padding: '30px 48px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={founderCard}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '24px 26px', verticalAlign: 'middle' as const }}>
                            <div style={founderEyebrow}>Your founder rate</div>
                            <div style={founderHeadline}>
                              $99 a year, for as long as you stay.
                            </div>
                            <div style={founderBody}>
                              You&apos;re joining in our founding season. When new members pay
                              $149, your price won&apos;t move an inch.
                            </div>
                          </td>
                          <td
                            style={{
                              width: '150px',
                              padding: '24px 26px 24px 0',
                              verticalAlign: 'middle' as const,
                              textAlign: 'center' as const,
                            }}
                          >
                            <div style={founderStamp}>Locked in for life</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              {/* ── 8 · Sign-off ── */}
              <tr>
                <td style={{ padding: '36px 48px 0' }}>
                  <Text style={{ ...p, margin: '0 0 16px' }}>
                    One genuine ask: as you and your kids start trying things, tell me what they
                    love and what falls flat. I build every bit of this for families like yours, so
                    what you notice really does shape what comes next. Just hit reply, it lands
                    straight in my inbox and I read every one.
                  </Text>
                  <div style={{ fontSize: '15.5px', color: C_BODY }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '4px' }}>
                    Founder · Anywhere Learning
                  </div>
                </td>
              </tr>

              {/* ── 9 · Fine print ── */}
              <tr>
                <td style={{ padding: '28px 48px 32px' }}>
                  <div style={fadeDivider} />
                  <Text style={legal}>
                    {isTrial && trialEnd ? (
                      <>
                        You&apos;re receiving this note because you started a 14-day free trial
                        of Anywhere Learning with this email address on {longDate(trialStart)}.
                        Your card on file was not charged today. Unless you cancel, your
                        membership begins on {longDate(trialEnd)} and renews each {per} at {price}{' '}
                        USD. You can cancel anytime from your account page.
                      </>
                    ) : (
                      <>
                        You&apos;re receiving this note because you joined Anywhere Learning with
                        this email address. Your membership renews each {per} at {price} USD
                        {isFounderPhase ? ', your founder rate, locked in' : ''}. If it&apos;s not
                        the right fit, you have 14 days for a full refund, no questions asked, just
                        email info@anywherelearning.co.
                      </>
                    )}
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

/* ── Reusable pieces ───────────────────────────────────────── */

/** Numbered "How it works" row. */
function Step({
  n,
  title,
  first,
  last,
  children,
}: {
  n: string;
  title: string;
  first?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  const padBottom = last ? '0' : '18px';
  return (
    <tr>
      <td
        style={{
          width: '46px',
          verticalAlign: 'top' as const,
          padding: `${first ? '4px' : '0'} 0 ${padBottom}`,
        }}
      >
        <div style={stepCircle}>{n}</div>
      </td>
      <td
        style={{
          verticalAlign: 'top' as const,
          padding: `${first ? '2px' : '0'} 0 ${padBottom}`,
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 600, color: C_INK }}>{title}</div>
        <div style={{ fontSize: '14px', lineHeight: 1.6, color: C_BODY, marginTop: '3px' }}>
          {children}
        </div>
      </td>
    </tr>
  );
}

/** One of the three difficulty-level mini cards (dots + name + blurb). */
function Level({ filled, name, desc }: { filled: number; name: string; desc: string }) {
  return (
    <td style={levelCell}>
      <div>
        {[1, 2, 3].map((i) => (
          <span key={i} style={i <= filled ? dotFilled : dotEmpty} />
        ))}
      </div>
      <div style={levelName}>{name}</div>
      <div style={levelDesc}>{desc}</div>
    </td>
  );
}

/** A pill-chipped row of the trial timeline. */
function TrialRow({
  label,
  first,
  last,
  children,
}: {
  label: string;
  first?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  const padTop = first ? '0' : '13px';
  const padBottom = last ? '0' : '14px';
  return (
    <tr>
      <td style={{ width: '76px', verticalAlign: 'top' as const, padding: `${padTop} 0 ${padBottom}` }}>
        <span style={trialPill}>{label}</span>
      </td>
      <td
        style={{
          verticalAlign: 'top' as const,
          padding: `${first ? '2px' : '15px'} 0 ${padBottom}`,
          fontSize: '14px',
          lineHeight: 1.6,
          color: C_BODY,
          fontFamily: FONT_BODY,
        }}
      >
        {children}
      </td>
    </tr>
  );
}

function TrialDivider() {
  return (
    <tr>
      <td
        colSpan={2}
        style={{
          borderTop: `1px dashed ${C_SAGE_BORDER}`,
          height: '1px',
          lineHeight: '1px',
          fontSize: '1px',
        }}
      >
        &nbsp;
      </td>
    </tr>
  );
}

// Preview props for `npm run email:preview`.
MembershipWelcome.PreviewProps = {
  firstName: 'Sarah',
  signInUrl: 'https://anywherelearning.co/sign-in?__clerk_ticket=example_token',
  isFounderPhase: true,
  isTrial: true,
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
} satisfies Props;

/* ─────────────────────────────────────────────────────────────
   Brand tokens — from the Claude Design handoff (Free trial project)
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

const strongInk = { fontWeight: 600, color: C_INK };

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
  fontFamily: FONT_BODY,
};

const stepCircle = {
  width: '32px',
  height: '32px',
  border: `1.5px solid ${C_FOREST}`,
  borderRadius: '50%',
  fontFamily: FONT_DISPLAY,
  fontSize: '16px',
  color: C_FOREST,
  textAlign: 'center' as const,
  lineHeight: '31px',
};

const levelsCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_CREAM_2,
  borderRadius: '14px',
};

const levelsHeader = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  color: C_MUTED,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const levelsRow = {
  width: '100%',
  borderCollapse: 'separate' as const,
  borderSpacing: '6px 0',
  marginTop: '12px',
};

const levelCell = {
  width: '33.3%',
  backgroundColor: C_CREAM,
  border: `1px solid ${C_RULE}`,
  borderRadius: '10px',
  padding: '14px 8px 13px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
};

const dotFilled = {
  display: 'inline-block',
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: C_FOREST,
  margin: '0 2px',
};

const dotEmpty = {
  display: 'inline-block',
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  border: `1px solid ${C_SAGE_BORDER}`,
  margin: '0 2px',
};

const levelName = {
  fontFamily: FONT_DISPLAY,
  fontSize: '16px',
  color: C_INK,
  marginTop: '8px',
};

const levelDesc = {
  fontSize: '12px',
  color: C_MUTED,
  marginTop: '3px',
  lineHeight: 1.45,
  fontFamily: FONT_BODY,
};

const levelsFootnote = {
  fontSize: '12.5px',
  color: C_MUTED,
  marginTop: '12px',
  fontFamily: FONT_BODY,
};

const trialPill = {
  display: 'inline-block',
  backgroundColor: C_CREAM,
  border: `1px solid ${C_SAGE_BORDER}`,
  borderRadius: '999px',
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: C_FOREST_DARK,
  padding: '4px 10px',
  whiteSpace: 'nowrap' as const,
  fontFamily: FONT_BODY,
};

const cancelNote = {
  marginTop: '18px',
  backgroundColor: C_CREAM,
  borderRadius: '10px',
  padding: '12px 16px',
  fontSize: '13px',
  lineHeight: 1.6,
  color: C_BODY,
  fontFamily: FONT_BODY,
};

const founderCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_TERRA,
  borderRadius: '14px',
};

const founderEyebrow = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  color: '#F2DECF',
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const founderHeadline = {
  fontFamily: FONT_DISPLAY,
  fontSize: '21px',
  lineHeight: 1.3,
  color: '#FFF8F0',
  marginTop: '7px',
};

const founderBody = {
  fontSize: '13.5px',
  lineHeight: 1.6,
  color: '#F6E3D3',
  marginTop: '7px',
  fontFamily: FONT_BODY,
};

// The rotate degrades gracefully (sits straight) in clients that strip it.
const founderStamp = {
  display: 'inline-block',
  transform: 'rotate(-7deg)',
  backgroundColor: C_TERRA_DARK,
  border: '1px dashed rgba(242,222,207,0.55)',
  borderRadius: '999px',
  padding: '9px 16px',
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: '#F2DECF',
  textTransform: 'uppercase' as const,
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
