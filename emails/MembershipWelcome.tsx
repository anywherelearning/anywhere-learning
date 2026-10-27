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
  /** Magic-link sign-in URL from Clerk. Signs them in + creates their account on first click. */
  signInUrl: string;
  /** Whether the buyer locked in the founder rate ($99/yr instead of $149/yr). */
  isFounderPhase: boolean;
  /** True when this signup started a free trial (no charge yet). */
  isTrial?: boolean;
  /** ISO date the trial converts to a paid membership. Only set when isTrial. */
  trialEndsAt?: string;
  /** Discounted first-year price (e.g. '$79' for the Fall offer). */
  firstYearPrice?: string;
  /** Billing plan. Monthly swaps the price/interval wording; defaults to annual. */
  plan?: 'annual' | 'monthly';
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

// Absolute, always-live host for email assets (never localhost), so images
// render in every inbox regardless of deploy state or NEXT_PUBLIC_URL.
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;
const EMAIL_COLLAGE = `${SITE}/email-library-hero-v2.jpg`;

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
 * Welcome email, "Trail map" design (Oct 2026, matches QuizPlanEmail and the
 * Kit sequence emails).
 *
 * Serves both signup flows:
 *   - free trial (isTrial): includes the "Your free trial, plainly" timeline
 *     box and trial-specific fine print
 *   - direct paid signup: same layout without the trial box
 *
 * The footer ships "Manage account" only: this is a transactional email with
 * no marketing list behind it, so unsubscribe links would mislead.
 */
export default function MembershipWelcome({
  firstName,
  signInUrl,
  isFounderPhase,
  isTrial,
  trialEndsAt,
  plan,
  firstYearPrice,
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
      <Head />
      <Preview>
        {isTrial
          ? `Welcome, ${name}. Your trial is open, every guide is yours to explore, and nothing was charged today.`
          : `Welcome, ${name}. Real-world skills, hand-picked activities, and a person on the other end of the line.`}
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
                          <span style={badge}>{isTrial ? 'DAY 1 / 7' : "YOU'RE IN"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>Hi {name}, I&apos;m so glad you&apos;re here.</div>
                  <div style={subline}>
                    {isTrial
                      ? 'Your 7-day free trial is open. Nothing was charged today.'
                      : 'Your membership is open. Every guide is waiting for you.'}
                  </div>
                </td>
              </tr>

              {/* ── Warm hello ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
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

              {/* ── Sign-in CTA card ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0', textAlign: 'center' as const }}>
                          <Img
                            src={EMAIL_COLLAGE}
                            alt="A fan of Anywhere Learning activities and the Future-Ready Skills Map"
                            width="260"
                            style={{ display: 'inline-block', width: '260px', maxWidth: '100%', height: 'auto' }}
                          />
                          <div style={{ ...label, color: C_FOREST, marginTop: '16px' }}>ONE-CLICK SIGN-IN</div>
                          {/* Lands on /account/welcome (the onboarding quiz):
                              add kids, then build each explorer, then the map
                              opens with the first stop chosen. The label names
                              that, not the library, because picking from a
                              library is exactly what a new member shouldn't do
                              first. */}
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '16px auto 0' }}>
                            <tbody>
                              <tr>
                                <td style={btnCell}>
                                  <Link href={signInUrl} style={btn}>Start our adventure &rarr;</Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={micro}>
                            This button signs you in on this device. No password to remember.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── How it works ── */}
              <tr>
                <td style={{ padding: '32px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>GETTING STARTED</div>
                  <div style={h2}>How it works</div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '18px 36px 0' }}>
                  {/* Mirrors the real first run (KidsSetup): add kids, pick
                      focus + time + trail format, then the map opens with the
                      next stop already chosen. Deliberately does NOT say
                      "pick an activity": the engine picks, the parent
                      nudges, and choice paralysis is the thing we remove. */}
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <Step n="1" color={C_TERRA} title="ADD YOUR KIDS">
                        Takes a minute. Their ages, what you&apos;d like to focus on, and how much
                        time you usually have. That&apos;s all it needs.
                      </Step>
                      <Step n="2" color={C_FOREST} title="YOUR FIRST STOP IS ALREADY PICKED">
                        No scrolling a library deciding on nothing. Open it and something is
                        waiting, sized to your family. Want a different one? Say so and it swaps.
                      </Step>
                      <Step n="3" color={C_GOLD} labelColor={C_EARTH} title="DO IT TOGETHER" last>
                        Cook the meal, build the stand, plant the bed. Most families walk one trail
                        together, so everyone&apos;s in on the same thing. The learning takes care
                        of itself.
                      </Step>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Three levels ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '20px 14px 18px', textAlign: 'center' as const }}>
                          <div style={{ ...label, color: C_FOREST }}>EVERY GUIDE COMES IN THREE LEVELS</div>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={levelsRow}>
                            <tbody>
                              <tr>
                                <Level filled={1} name="Explore" desc="a gentle first try" />
                                <Level filled={2} name="Develop" desc="more hands, less help" />
                                <Level filled={3} name="Extend" desc="they run the show" />
                              </tr>
                            </tbody>
                          </table>
                          <div style={{ ...micro, marginTop: '14px' }}>
                            Same activity, sized to your kid. Pick whichever fits today.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Your free trial, plainly (trial signups only) ── */}
              {isTrial && trialEnd && headsUp && (
                <tr>
                  <td style={{ padding: '26px 36px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '22px 24px 22px' }}>
                            <div style={{ ...label, color: C_FOREST }}>YOUR FREE TRIAL, PLAINLY</div>
                            <table
                              role="presentation"
                              cellPadding={0}
                              cellSpacing={0}
                              style={{ width: '100%', borderCollapse: 'collapse' as const, marginTop: '14px' }}
                            >
                              <tbody>
                                <TrialRow label="TODAY" first>
                                  <strong style={strongInk}>$0 charged.</strong> For 7 days,
                                  read every guide in your browser, on any device, as much as you
                                  like. Want to save guides as PDFs? Start your membership anytime.
                                </TrialRow>
                                <TrialRow label={pillDate(headsUp)}>
                                  <strong style={strongInk}>One friendly heads-up.</strong>{' '}
                                  I&apos;ll email you 3 days before anything changes. No surprise
                                  charges, I promise.
                                </TrialRow>
                                <TrialRow label={pillDate(trialEnd)} last>
                                  <strong style={strongInk}>Membership begins.</strong> Your plan
                                  starts at {firstYearPrice ?? price} for the {firstYearPrice ? 'first year' : per} and downloads unlock.
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

              {/* ── Founder rate ── */}
              {isFounderPhase && (
                <tr>
                  <td style={{ padding: '26px 36px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={founderCard}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '22px 24px 24px' }}>
                            <span style={founderPill}>LOCKED IN FOR LIFE</span>
                            <div style={{ ...label, color: C_TERRA, marginTop: '16px' }}>YOUR FOUNDER RATE</div>
                            <div style={founderHeadline}>$99 a year, for as long as you stay.</div>
                            <div style={founderBody}>
                              You&apos;re joining in our founding season. When new members pay
                              $149, your price won&apos;t move an inch.
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
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>Enjoy that first hour together,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              {/* ── Footer ── */}
              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                  <Text style={legal}>
                    {isTrial && trialEnd ? (
                      <>
                        You&apos;re receiving this note because you started a 7-day free trial
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

/* ── Reusable pieces ── */

/** Numbered trail step: colored dot, Courier label, dashed connector to the next step. */
function Step({
  n,
  title,
  color,
  labelColor,
  last,
  children,
}: {
  n: string;
  title: string;
  color: string;
  labelColor?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td style={{ width: '46px', verticalAlign: 'top' as const }}>
        <div style={{ ...stepDot, backgroundColor: color }}>{n}</div>
      </td>
      <td
        style={{
          verticalAlign: 'top' as const,
          padding: last ? '3px 0 4px 16px' : '3px 0 20px 16px',
          borderLeft: last ? '2px solid transparent' : `2px dashed ${C_RULE}`,
        }}
      >
        <div style={{ ...label, color: labelColor ?? color }}>{title}</div>
        <div style={stepBody}>{children}</div>
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

/** A date-pilled row of the trial timeline, dashed rule between rows. */
function TrialRow({
  label: pill,
  first,
  last,
  children,
}: {
  label: string;
  first?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  const pad = `${first ? '0' : '14px'} 0 ${last ? '0' : '14px'}`;
  const divider = last ? undefined : `1px dashed ${C_RULE}`;
  return (
    <tr>
      <td style={{ width: '84px', verticalAlign: 'top' as const, padding: pad, borderBottom: divider }}>
        <span style={trialPill}>{pill}</span>
      </td>
      <td
        style={{
          verticalAlign: 'top' as const,
          padding: pad,
          borderBottom: divider,
          fontSize: '14.5px',
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

// Preview props for `npm run email:preview`.
MembershipWelcome.PreviewProps = {
  firstName: 'Sarah',
  signInUrl:
    'https://anywherelearning.co/sign-in?__clerk_ticket=example_token&redirect_url=%2Faccount%2Fwelcome',
  isFounderPhase: true,
  isTrial: true,
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
const C_GOLD = '#D4A373';
const C_GOLD_LIGHT = '#E8C99A';
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
  backgroundColor: C_GOLD_LIGHT,
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
const strongInk = { fontWeight: 700, color: C_INK };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const sageCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', lineHeight: 1.55, color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const stepDot = { width: '34px', height: '34px', borderRadius: '50%', color: '#FFFFFF', fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: '34px', textAlign: 'center' as const };
const stepBody = { fontSize: '15.5px', lineHeight: 1.6, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };
const levelsRow = { width: '100%', borderCollapse: 'separate' as const, borderSpacing: '6px 0', marginTop: '12px' };
const levelCell = {
  width: '33.3%',
  backgroundColor: C_CARD,
  border: `1px solid ${C_RULE}`,
  borderRadius: '10px',
  padding: '14px 8px 13px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
};
const dotFilled = { display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: C_FOREST, margin: '0 2px' };
const dotEmpty = { display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', border: `1px solid ${C_RULE}`, margin: '0 2px' };
const levelName = { fontFamily: FONT_DISPLAY, fontSize: '17px', color: C_INK, marginTop: '8px' };
const levelDesc = { fontSize: '12.5px', color: C_MUTED, marginTop: '3px', lineHeight: 1.45, fontFamily: FONT_BODY };
const trialPill = {
  display: 'inline-block',
  backgroundColor: C_CARD,
  border: `1px solid ${C_RULE}`,
  borderRadius: '999px',
  fontFamily: FONT_MONO,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: C_FOREST,
  padding: '4px 9px',
  whiteSpace: 'nowrap' as const,
};
const cancelNote = {
  marginTop: '18px',
  backgroundColor: C_CARD,
  borderRadius: '10px',
  padding: '12px 16px',
  fontSize: '13.5px',
  lineHeight: 1.6,
  color: C_BODY,
  fontFamily: FONT_BODY,
};
const founderCard = sageCard;
const founderPill = { ...badge, fontSize: '11px', padding: '6px 11px' };
const founderHeadline = { fontFamily: FONT_DISPLAY, fontSize: '23px', lineHeight: 1.3, color: C_INK, marginTop: '6px' };
const founderBody = { fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '8px', fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
