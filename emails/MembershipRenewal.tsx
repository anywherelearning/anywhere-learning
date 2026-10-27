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
  /** Whether they're on the founder rate ($99/yr locked) or the standard rate ($149/yr). */
  isFounderPhase: boolean;
  /** ISO date string for the upcoming renewal (e.g. "2027-05-20"). */
  renewalDate: string;
  /** Direct link to the Stripe Customer Portal so they can manage / cancel. */
  manageUrl: string;
  /** Card brand on file (e.g. "VISA", "MASTERCARD"). Falls back to "Card" if unknown. */
  cardBrand?: string;
  /** Last 4 digits of the card on file (e.g. "4242"). Optional. */
  cardLast4?: string;
  /** Card expiry in "MM/YY" form (e.g. "09/28"). Optional. */
  cardExp?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

// Absolute, always-live host for email assets (never localhost).
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/**
 * Membership renewal reminder, "Trail map" design (Oct 2026).
 *
 * Sent 14 days before currentPeriodEnd by the daily cron at
 * /api/cron/renewal-reminders. Honest heads-up, not a sales pitch.
 * (The 14 here is the annual renewal notice, unrelated to the 7-day trial.)
 *
 * Sections:
 *   - Green header band with the days-to-renewal badge
 *   - Heads-up body
 *   - Renewal summary card (date, card on file, what's renewing)
 *   - One-click sign-in CTA
 *   - "What's coming in year two" trail (hardcoded roadmap, edit per quarter)
 *   - "Need to change something?" manage rows (Update card, Cancel)
 *   - Founder aside (if applicable)
 *   - Sign-off + fine print + footer
 *
 * Deferred for a later sprint:
 *   - Year-in-review stats (needs progress tracking in DB; localStorage only today)
 *   - "Pause for a year" flow (Stripe pause_collection requires a custom page + webhook)
 */
export default function MembershipRenewal({
  firstName,
  isFounderPhase,
  renewalDate,
  manageUrl,
  cardBrand = 'Card',
  cardLast4,
  cardExp,
}: Props) {
  const name = firstName?.trim() || 'there';

  // Renewal date in two formats: full ("Wed, June 4") for the summary card,
  // long ("Wednesday, June 4") for sentences.
  const dateObj = new Date(renewalDate);
  const fullDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
  const year = dateObj.getFullYear();
  const sentenceDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Days from now until renewal, approximate (timezone-naive) but good
  // enough for the "14 days from today" microcopy.
  const daysFromNow = Math.max(
    1,
    Math.round((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  const daysLabel = daysFromNow === 1 ? '1 day' : `${daysFromNow} days`;

  const priceLabel = isFounderPhase ? '$99' : '$149';
  const rateLine = isFounderPhase ? '/year · founder rate' : '/year';

  return (
    <Html>
      <Head />
      <Preview>
        Your membership renews {sentenceDate}. A quick heads-up so it doesn&apos;t land out of nowhere.
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
                          <span style={badge}>RENEWS IN {daysLabel.toUpperCase()}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>Hi {name}, your membership renews in {daysLabel}.</div>
                  <div style={subline}>A friendly heads-up, so the charge never lands out of nowhere.</div>
                </td>
              </tr>

              {/* ── Intro ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    On <strong style={strongInk}>{sentenceDate}</strong> your Anywhere Learning
                    membership renews for another year
                    {isFounderPhase ? ', at the founder rate you locked in when you joined' : ''}.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Nothing for you to do, unless you&apos;d like to change something. No awkwardness,
                    no buried buttons. Everything you need is below.
                  </Text>
                </td>
              </tr>

              {/* ── Renewal summary card ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={summaryCard}>
                    <tbody>
                      {/* Row 1: Renews on + amount */}
                      <tr>
                        <td style={summaryCell}>
                          <div style={{ ...label, color: C_MUTED }}>RENEWS ON</div>
                          <div style={summaryValue}>
                            {fullDate} <span style={{ color: C_FOREST }}>· {year}</span>
                          </div>
                          <div style={summarySmall}>{daysLabel} from today</div>
                        </td>
                        <td style={{ ...summaryCell, textAlign: 'right' as const, whiteSpace: 'nowrap' as const }}>
                          <div style={summaryAmount}>{priceLabel}</div>
                          <div style={summarySmall}>{rateLine}</div>
                        </td>
                      </tr>

                      {/* Row 2: Card on file */}
                      {cardLast4 && (
                        <tr>
                          <td style={summaryCellTop}>
                            <div style={{ ...label, color: C_MUTED }}>CARD ON FILE</div>
                            <div style={summaryCardLine}>
                              <span style={cardBrandPill}>{cardBrand.toUpperCase()}</span>
                              {' '}•••• {cardLast4}
                              {cardExp ? ` · expires ${cardExp}` : ''}
                            </div>
                          </td>
                          <td style={{ ...summaryCellTop, textAlign: 'right' as const, whiteSpace: 'nowrap' as const }}>
                            <Link href={manageUrl} style={textLink}>Update card &rarr;</Link>
                          </td>
                        </tr>
                      )}

                      {/* Row 3: What's renewing */}
                      <tr>
                        <td colSpan={2} style={summaryCellTop}>
                          <div style={{ ...label, color: C_MUTED }}>WHAT&apos;S RENEWING</div>
                          <div style={{ ...summaryCardLine, lineHeight: 1.5 }}>
                            Full library · your family&apos;s trail and record · quarterly drops · Skills Map
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── One-click sign-in CTA ── */}
              <tr>
                <td style={{ padding: '26px 36px 0', textAlign: 'center' as const }}>
                  <div style={{ ...label, color: C_FOREST }}>KEEP USING YOUR MEMBERSHIP</div>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '14px auto 0' }}>
                    <tbody>
                      <tr>
                        <td style={btnCell}>
                          <Link href={`${baseUrl}/account/home`} style={btn}>Continue our adventure &rarr;</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={micro}>Signs you straight in. No password needed.</div>
                </td>
              </tr>

              {/* ── What's coming in year two ──
                  EDITORIAL NOTE: hardcoded roadmap. Refresh these 3 stops each
                  quarter (or whenever the renewal cohort changes) so they reflect
                  what's actually shipping next. Keep one line each. */}
              <tr>
                <td style={{ padding: '32px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>WHAT&apos;S COMING IN YEAR TWO</div>
                  <div style={h2}>Plenty of new ground ahead.</div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '18px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <TrailStep n={1} dot={C_TERRA} labelColor={C_TERRA} title="40+ NEW ACTIVITIES">
                        Four quarterly drops, included with your membership. The next drop lands
                        within weeks.
                      </TrailStep>
                      <TrailStep n={2} dot={C_FOREST} labelColor={C_FOREST} title="NEW CATEGORIES IN DEVELOPMENT">
                        Shaped by what members keep asking for.
                      </TrailStep>
                      <TrailStep n={3} dot={C_GOLD} labelColor={C_EARTH} title="THE BLOG KEEPS GROWING" last>
                        Real stories from our days, life-skills and parenting takes, no fluff.
                      </TrailStep>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Need to change something? ── */}
              <tr>
                <td style={{ padding: '32px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>NEED TO CHANGE SOMETHING?</div>
                  <div style={h2}>No buried buttons, I promise.</div>
                  <Text style={{ ...p, margin: '8px 0 0' }}>
                    Whatever you need, I&apos;d rather make it easy than make it sticky.
                  </Text>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={manageList}>
                    <tbody>
                      <tr>
                        <td style={manageBodyCol}>
                          <div style={manageName}>Update your card</div>
                          <div style={manageDesc}>Card expiring or new number? Swap it in a few clicks.</div>
                        </td>
                        <td style={manageLinkCol}>
                          <Link href={manageUrl} style={textLink}>Update card &rarr;</Link>
                        </td>
                      </tr>
                      <tr>
                        <td style={manageBodyCol}>
                          <div style={manageName}>Cancel my membership</div>
                          <div style={manageDesc}>
                            One click. No questions. No hard-feelings email. You keep access until{' '}
                            {sentenceDate}.
                          </div>
                        </td>
                        <td style={manageLinkCol}>
                          <Link href={manageUrl} style={textLink}>Cancel &rarr;</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Founder aside (conditional) ── */}
              {isFounderPhase && (
                <tr>
                  <td style={{ padding: '24px 36px 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={aside}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '18px 20px' }}>
                            <div style={{ ...label, color: C_FOREST }}>STILL LOCKED IN · FOUNDER RATE, YEAR 2</div>
                            <div style={{ fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '6px', fontFamily: FONT_BODY }}>
                              Renewing keeps your <strong style={strongInk}>$99/year</strong> for as long
                              as you stay a member. New members are paying $149 now, your price
                              doesn&apos;t move.
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
                    On {sentenceDate}, {year} your card{cardLast4 ? ` ending in ${cardLast4}` : ''} will
                    be charged {priceLabel} USD for one year of Anywhere Learning membership
                    {isFounderPhase ? ' at the founder rate' : ''}. You can update or cancel anytime
                    from{' '}
                    <Link href={manageUrl} style={legalLink}>
                      your account settings
                    </Link>
                    {' '}before that date, and there&apos;s no charge on cancel.
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

// ── Reusable: one numbered trail stop with the dashed connector ──
function TrailStep({
  n,
  dot,
  labelColor,
  title,
  last,
  children,
}: {
  n: number;
  dot: string;
  labelColor: string;
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td style={{ width: '46px', verticalAlign: 'top' }}>
        <div style={{ ...stepDot, backgroundColor: dot }}>{n}</div>
      </td>
      <td
        style={{
          verticalAlign: 'top',
          padding: last ? '3px 0 4px 16px' : '3px 0 20px 16px',
          borderLeft: last ? '2px solid transparent' : `2px dashed ${C_RULE}`,
        }}
      >
        <div style={{ ...label, color: labelColor }}>{title}</div>
        <div style={stepBody}>{children}</div>
      </td>
    </tr>
  );
}

// Preview props for `npm run email:preview`.
MembershipRenewal.PreviewProps = {
  firstName: 'Sarah',
  isFounderPhase: true,
  renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  manageUrl: 'https://billing.stripe.com/p/session/example',
  cardBrand: 'Visa',
  cardLast4: '4242',
  cardExp: '09/28',
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
const strongInk = { color: C_INK, fontWeight: 600 };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const stepDot = { width: '34px', height: '34px', borderRadius: '50%', color: '#FFFFFF', fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: '34px', textAlign: 'center' as const };
const stepBody = { fontSize: '15.5px', lineHeight: 1.6, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };
const aside = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '12px' };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
const legalLink = { color: '#A09A8C', textDecoration: 'underline' };

// ── Renewal summary card ──
const summaryCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const summaryCell = { padding: '18px 20px', verticalAlign: 'middle' as const };
const summaryCellTop = { ...summaryCell, borderTop: `1px dashed ${C_RULE}` };
const summaryValue = { fontFamily: FONT_DISPLAY, fontSize: '19px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const summarySmall = { fontSize: '12.5px', color: C_MUTED, marginTop: '4px', fontFamily: FONT_BODY };
const summaryAmount = { fontFamily: FONT_DISPLAY, fontSize: '30px', lineHeight: 1, color: C_INK };
const summaryCardLine = { fontSize: '15px', color: C_INK, marginTop: '6px', fontFamily: FONT_BODY };
const cardBrandPill = {
  display: 'inline-block',
  backgroundColor: C_CARD,
  border: `1px solid ${C_RULE}`,
  borderRadius: '6px',
  padding: '2px 7px',
  fontFamily: FONT_MONO,
  fontWeight: 700,
  fontSize: '11px',
  letterSpacing: '0.1em',
  color: C_BODY,
  marginRight: '2px',
};
const textLink = { fontSize: '14px', fontWeight: 600, color: C_FOREST, textDecoration: 'none', fontFamily: FONT_BODY };

// ── Manage options ──
const manageList = { width: '100%', marginTop: '14px', borderCollapse: 'collapse' as const, borderTop: `1px solid ${C_RULE}` };
const manageBodyCol = { padding: '14px 12px 14px 0', verticalAlign: 'middle' as const, borderBottom: `1px solid ${C_RULE}` };
const manageLinkCol = { padding: '14px 0', verticalAlign: 'middle' as const, textAlign: 'right' as const, whiteSpace: 'nowrap' as const, borderBottom: `1px solid ${C_RULE}` };
const manageName = { fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: 1.25, color: C_INK };
const manageDesc = { fontSize: '14px', lineHeight: 1.5, color: C_BODY, marginTop: '3px', fontFamily: FONT_BODY };
