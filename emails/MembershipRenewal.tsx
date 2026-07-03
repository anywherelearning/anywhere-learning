import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
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

/**
 * Membership renewal reminder — v2 design.
 *
 * Sent 14 days before currentPeriodEnd by the daily cron at
 * /api/cron/renewal-reminders. Honest heads-up, not a sales pitch.
 *
 * Sections shipped in v1:
 *   - Brand header
 *   - Heads-up greeting + body
 *   - Renewal summary card (date, card on file, what's renewing)
 *   - One-click sign-in CTA
 *   - "What's coming in year two" panel (hardcoded roadmap — edit per quarter)
 *   - "Need to change something?" manage rows (Update card, Cancel)
 *   - Founder banner (if applicable)
 *   - Signoff + fine print + footer
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

  // Renewal date in two formats: full ("Wed, June 4 · 2026") for the
  // summary card, short ("June 4") for the headline.
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

  // Days from now until renewal — approximate (timezone-naive) but good
  // enough for the "14 days from today" microcopy.
  const daysFromNow = Math.max(
    1,
    Math.round((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const priceLabel = isFounderPhase ? '$99' : '$149';
  const rateLine = isFounderPhase ? '/year · founder rate' : '/year';

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=Dancing+Script:wght@500;600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        Your membership renews {sentenceDate}. A quick heads-up so it doesn&apos;t land out of nowhere.
      </Preview>
      <Body style={body}>
        <Container style={envelope}>

          {/* ── Brand header ── */}
          <div style={brandHead}>
            <Img
              src={`${baseUrl}/logo-icon-transparent.png`}
              width="68"
              height="49"
              alt=""
              style={brandIcon}
            />
            <Text style={brandName}>
              anywhere <span style={brandItalic}>learning</span>
            </Text>
            <Text style={tagline}>
              Hands-on activities for raising capable kids, ready for real life.
            </Text>
          </div>

          {/* ── A friendly heads-up ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />A friendly heads-up
            </Text>
            <Heading style={h1Greet}>
              Hi {name}, your membership renews{' '}
              <span style={italicAccent}>in {daysFromNow === 1 ? '1 day' : `${daysFromNow} days`}.</span>
            </Heading>
            <Text style={p}>
              I never want a renewal charge to land out of nowhere, so here&apos;s a heads-up. On{' '}
              <strong style={strongInk}>{sentenceDate}</strong> your Anywhere Learning membership
              renews for another year{isFounderPhase ? ', at the founder rate you locked in when you joined' : ''}.
            </Text>
            <Text style={pTight}>
              Nothing for you to do, unless you&apos;d like to change something. No awkwardness,
              no buried buttons. Everything you need is below.
            </Text>
          </div>

          {/* ── Renewal summary card ── */}
          <div style={summaryWrap}>
            <div style={summary}>
              {/* Row 1: Renews on + amount */}
              <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={summaryRow}>
                <tbody>
                  <tr>
                    <td style={summaryLeftCol}>
                      <Text style={summaryKey}>Renews on</Text>
                      <Text style={summaryValue}>
                        {fullDate}{' '}
                        <span style={summaryValueItalic}>· {year}</span>
                      </Text>
                      <Text style={summarySmall}>
                        {daysFromNow === 1 ? '1 day from today' : `${daysFromNow} days from today`}
                      </Text>
                    </td>
                    <td style={summaryRightCol}>
                      <Text style={summaryAmount}>{priceLabel}</Text>
                      <Text style={summaryAmountSmall}>{rateLine}</Text>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Row 2: Card on file */}
              {cardLast4 && (
                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={summaryRowMid}>
                  <tbody>
                    <tr>
                      <td style={summaryLeftCol}>
                        <Text style={summaryKey}>Card on file</Text>
                        <Text style={summaryCardLine}>
                          <span style={cardBrandPill}>{cardBrand.toUpperCase()}</span>
                          {' '}•••• {cardLast4}
                          {cardExp ? ` · expires ${cardExp}` : ''}
                        </Text>
                      </td>
                      <td style={summaryRightColLink}>
                        <Link href={manageUrl} style={summaryLink}>
                          Update card →
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Row 3: What's renewing */}
              <div style={summaryRowLast}>
                <Text style={summaryKey}>What&apos;s renewing</Text>
                <Text style={summaryValueSmall}>
                  Full library access · quarterly drops · Skills Map
                </Text>
              </div>
            </div>
          </div>

          {/* ── One-click sign-in CTA ── */}
          <div style={ctaCardWrap}>
            <div style={ctaCard}>
              <div style={ctaSeal}>✦</div>
              <Text style={ctaLabel}>Keep using your membership</Text>
              <Link href={`${baseUrl}/account`} style={btn}>
                Open my library →
              </Link>
              <Text style={ctaMicro}>Signs you straight in. No password needed.</Text>
            </div>
          </div>

          {/* ── What's coming in year two ──
              EDITORIAL NOTE: hardcoded roadmap. Refresh these 3 bullets each
              quarter (or whenever the renewal cohort changes) so they reflect
              what's actually shipping next. Keep one line each. */}
          <div style={panelWrap}>
            <div style={panel}>
              <Text style={eyebrow}>
                <span style={eyebrowRule} />What&apos;s coming in year two
              </Text>
              <Heading as="h2" style={h2}>
                Plenty of{' '}
                <span style={italicAccent}>new ground</span> ahead.
              </Heading>
              <Bullet icon="+" first>
                <strong style={bulletStrong}>40+ new activities</strong>, four quarterly drops,
                included with your membership. The next drop lands within weeks.
              </Bullet>
              <Bullet icon="★">
                <strong style={bulletStrong}>New categories in development</strong>, shaped by
                what members keep asking for.
              </Bullet>
              <Bullet icon="✎">
                <strong style={bulletStrong}>The blog keeps growing</strong>, real stories from
                our days, life-skills and parenting takes, no fluff.
              </Bullet>
            </div>
          </div>

          {/* ── Need to change something? ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />Need to change something?
            </Text>
            <Heading as="h2" style={h2}>
              No buried buttons,{' '}
              <span style={italicAccent}>I promise.</span>
            </Heading>
            <Text style={pSmaller}>
              Whatever you need, I&apos;d rather make it easy than make it sticky.
            </Text>

            <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={manageList}>
              <tbody>
                <tr style={manageRow}>
                  <td style={manageBodyCol}>
                    <Text style={manageName}>Update your card</Text>
                    <Text style={manageDesc}>
                      Card expiring or new number? Swap it in a few clicks.
                    </Text>
                  </td>
                  <td style={manageLinkCol}>
                    <Link href={manageUrl} style={manageLink}>
                      Update card →
                    </Link>
                  </td>
                </tr>
                <tr style={manageRowLast}>
                  <td style={manageBodyCol}>
                    <Text style={manageName}>Cancel my membership</Text>
                    <Text style={manageDesc}>
                      One click. No questions. No hard-feelings email. You keep access until{' '}
                      {sentenceDate}.
                    </Text>
                  </td>
                  <td style={manageLinkCol}>
                    <Link href={manageUrl} style={manageLink}>
                      Cancel →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Founder banner (conditional) ── */}
          {isFounderPhase && (
            <div style={founderWrap}>
              <div style={founderBox}>
                <div style={founderStamp}>Still locked in</div>
                <Text style={founderHeadline}>Founder rate · year 2</Text>
                <Text style={founderBody}>
                  Renewing keeps your $99/year for as long as you stay a member. New members are
                  paying $149 now, your price doesn&apos;t move.
                </Text>
              </div>
            </div>
          )}

          {/* ── Signature ── */}
          <div style={signoffBlock}>
            <Text style={xo}>xo,</Text>
            <Text style={nameSignoff}>Amelie</Text>
            <Text style={signoffRole}>Founder · Anywhere Learning</Text>
          </div>

          <Hr style={dashHr} />

          {/* ── Fine print ── */}
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

          {/* ── Footer ── */}
          <div style={credit}>
            <Text style={creditText}>
              Anywhere Learning · <em style={creditItalic}>Built by Amelie</em> · Made in Nelson, BC
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  );
}

// ── Reusable: one "What's coming" bullet (matches MembershipWelcome shape) ──
function Bullet({
  icon,
  first,
  children,
}: {
  icon: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={first ? bulletRowFirst : bulletRow}
    >
      <tbody>
        <tr>
          <td style={bulletIconCol}>
            <div style={bulletDot}>{icon}</div>
          </td>
          <td style={bulletBodyCol}>
            <Text style={bulletText}>{children}</Text>
          </td>
        </tr>
      </tbody>
    </table>
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

// ─────────────────────────────────────────────────────────────
// Brand tokens — kept in sync with MembershipWelcome
// ─────────────────────────────────────────────────────────────

const FONT_BODY = '"DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const FONT_DISPLAY = '"DM Serif Display", Georgia, "Times New Roman", serif';
const FONT_SCRIPT = '"Dancing Script", "Brush Script MT", cursive';

const C_CREAM = '#FAF8F3';
const C_CREAM_2 = '#F2EFE4';
const C_SAGE_SOFT = '#E6EBDF';
const C_SAGE_BORDER = '#C9D3BE';
const C_INK = '#2D3A2E';
const C_BODY = '#4F5A50';
const C_MUTED = '#7B8378';
const C_RULE = '#D8D4C5';
const C_BEIGE_2 = '#C9C5B7';
const C_FOREST = '#588157';
const C_FOREST_DARK = '#3A5A40';
const C_TERRA = '#C97B5C';
const C_TERRA_DARK = '#7A3D24';
const C_TERRA_SOFT = '#F2DECF';

// ── Layout ──
const body = {
  backgroundColor: '#E9E5DC',
  fontFamily: FONT_BODY,
  margin: 0,
  padding: '24px 12px',
};

const envelope = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: C_CREAM,
  border: `1px solid ${C_RULE}`,
  borderRadius: '18px',
  overflow: 'hidden' as const,
};

// ── Brand header ──
const brandHead = { textAlign: 'center' as const, padding: '36px 24px 8px' };
const brandIcon = { display: 'block' as const, margin: '0 auto 12px' };
const brandName = {
  fontFamily: FONT_DISPLAY,
  fontSize: '22px',
  lineHeight: '1',
  color: C_INK,
  margin: '0 0 6px',
  letterSpacing: '-0.005em',
};
const brandItalic = { fontStyle: 'italic' as const, color: C_FOREST };
const tagline = {
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '14px',
  color: C_MUTED,
  margin: '0',
};

// ── Section padding ──
const pad = { padding: '6px 36px 4px' };

// ── Eyebrow ──
const eyebrow = {
  fontFamily: FONT_BODY,
  fontWeight: 500,
  fontSize: '11.5px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: C_FOREST_DARK,
  margin: '24px 0 12px',
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
};
const eyebrowRule = {
  display: 'inline-block' as const,
  width: '22px',
  height: '1px',
  backgroundColor: C_FOREST,
  marginRight: '10px',
  verticalAlign: 'middle' as const,
};

// ── Headlines ──
const h1Greet = {
  fontFamily: FONT_DISPLAY,
  fontWeight: 400,
  fontSize: '32px',
  lineHeight: '1.08',
  letterSpacing: '-0.014em',
  color: C_INK,
  margin: '0 0 18px',
};
const h2 = {
  fontFamily: FONT_DISPLAY,
  fontWeight: 400,
  fontSize: '25px',
  lineHeight: '1.15',
  letterSpacing: '-0.01em',
  color: C_INK,
  margin: '0 0 12px',
};
const italicAccent = { fontStyle: 'italic' as const, color: C_FOREST };

// ── Body ──
const p = {
  fontFamily: FONT_BODY,
  color: C_BODY,
  fontSize: '15.5px',
  lineHeight: '1.65',
  margin: '0 0 14px',
};
const pTight = { ...p, marginBottom: '4px' };
const pSmaller = { ...p, fontSize: '15px', margin: '0 0 6px' };
const strongInk = { color: C_INK, fontWeight: 600 };

// ── Renewal summary card ──
const summaryWrap = { margin: '24px 28px 0', padding: 0 };

const summary = {
  backgroundColor: C_CREAM,
  border: `1px solid ${C_RULE}`,
  borderRadius: '14px',
  overflow: 'hidden' as const,
};

const summaryRow = {
  borderBottom: `1px dashed ${C_BEIGE_2}`,
};

const summaryRowMid = {
  borderBottom: `1px dashed ${C_BEIGE_2}`,
};

const summaryRowLast = {
  padding: '16px 22px',
};

const summaryLeftCol = {
  padding: '16px 22px',
  verticalAlign: 'middle' as const,
};

const summaryRightCol = {
  padding: '16px 22px',
  verticalAlign: 'middle' as const,
  textAlign: 'right' as const,
  whiteSpace: 'nowrap' as const,
};

const summaryRightColLink = {
  padding: '16px 22px',
  verticalAlign: 'middle' as const,
  textAlign: 'right' as const,
  whiteSpace: 'nowrap' as const,
};

const summaryKey = {
  fontFamily: FONT_BODY,
  fontWeight: 500,
  fontSize: '11.5px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: C_MUTED,
  margin: '0 0 3px',
};

const summaryValue = {
  fontFamily: FONT_DISPLAY,
  fontSize: '18px',
  lineHeight: '1.2',
  color: C_INK,
  margin: '0',
};

const summaryValueSmall = {
  fontFamily: FONT_DISPLAY,
  fontSize: '15.5px',
  lineHeight: '1.3',
  color: C_INK,
  margin: '0',
};

const summaryValueItalic = {
  fontStyle: 'italic' as const,
  color: C_FOREST_DARK,
};

const summarySmall = {
  fontFamily: FONT_BODY,
  fontWeight: 500,
  fontSize: '12.5px',
  letterSpacing: '0.02em',
  color: C_MUTED,
  margin: '3px 0 0',
};

const summaryAmount = {
  fontFamily: FONT_DISPLAY,
  fontSize: '30px',
  lineHeight: '1',
  color: C_INK,
  margin: '0',
};

const summaryAmountSmall = {
  fontFamily: FONT_BODY,
  fontWeight: 500,
  fontSize: '11.5px',
  letterSpacing: '0.04em',
  color: C_MUTED,
  margin: '6px 0 0',
  textAlign: 'right' as const,
};

const summaryCardLine = {
  fontFamily: FONT_BODY,
  fontSize: '14.5px',
  color: C_INK,
  fontWeight: 500,
  margin: '0',
};

const cardBrandPill = {
  display: 'inline-block' as const,
  backgroundColor: C_CREAM_2,
  border: `1px solid ${C_RULE}`,
  borderRadius: '6px',
  padding: '3px 8px',
  fontFamily: FONT_BODY,
  fontWeight: 700,
  fontSize: '10.5px',
  letterSpacing: '0.12em',
  color: C_BODY,
  marginRight: '4px',
};

const summaryLink = {
  fontFamily: FONT_BODY,
  fontWeight: 600,
  fontSize: '13.5px',
  color: C_FOREST_DARK,
  textDecoration: 'none',
  borderBottom: '1px solid rgba(58,90,64,0.25)',
  paddingBottom: '1px',
};

// ── CTA card ──
const ctaCardWrap = { margin: '18px 28px 4px', padding: 0 };

const ctaCard = {
  backgroundColor: C_SAGE_SOFT,
  border: `1px solid ${C_SAGE_BORDER}`,
  borderRadius: '14px',
  padding: '24px',
  textAlign: 'center' as const,
  position: 'relative' as const,
};

const ctaSeal = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: C_CREAM,
  border: `1px solid ${C_SAGE_BORDER}`,
  color: C_FOREST_DARK,
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '18px',
  lineHeight: '36px',
  textAlign: 'center' as const,
  margin: '-38px auto 0',
};

const ctaLabel = {
  fontFamily: FONT_BODY,
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: C_FOREST_DARK,
  margin: '6px 0 12px',
};

const btn = {
  display: 'inline-block' as const,
  backgroundColor: C_FOREST,
  color: C_CREAM,
  fontFamily: FONT_BODY,
  fontWeight: 600,
  fontSize: '15.5px',
  textDecoration: 'none',
  padding: '13px 28px',
  borderRadius: '11px',
};

const ctaMicro = {
  fontFamily: FONT_BODY,
  fontSize: '12.5px',
  lineHeight: '1.55',
  color: C_MUTED,
  margin: '14px 0 0',
};

// ── "What's coming in year two" panel ──
const panelWrap = { margin: '20px 28px', padding: 0 };

const panel = {
  backgroundColor: C_CREAM_2,
  border: `1px solid ${C_RULE}`,
  borderRadius: '14px',
  padding: '24px 28px 22px',
};

const bulletRow = { borderTop: `1px dashed ${C_BEIGE_2}` };
const bulletRowFirst = { borderTop: '0' };

const bulletIconCol = {
  width: '32px',
  verticalAlign: 'top' as const,
  paddingTop: '14px',
};

const bulletDot = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: C_SAGE_SOFT,
  color: C_FOREST_DARK,
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};

const bulletBodyCol = {
  verticalAlign: 'top' as const,
  padding: '12px 0',
};

const bulletText = {
  fontFamily: FONT_BODY,
  fontSize: '14.5px',
  lineHeight: '1.55',
  color: C_BODY,
  margin: '0',
};

const bulletStrong = { color: C_INK, fontWeight: 600 };

// ── Manage options ──
const manageList = {
  marginTop: '14px',
  borderTop: `1px solid ${C_RULE}`,
};

const manageRow = {
  borderBottom: `1px solid ${C_RULE}`,
};

const manageRowLast = {
  borderBottom: `1px solid ${C_RULE}`,
};

const manageBodyCol = {
  padding: '14px 0',
  verticalAlign: 'middle' as const,
};

const manageLinkCol = {
  padding: '14px 0',
  verticalAlign: 'middle' as const,
  textAlign: 'right' as const,
  whiteSpace: 'nowrap' as const,
};

const manageName = {
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '17px',
  lineHeight: '1.2',
  color: C_INK,
  margin: '0 0 2px',
};

const manageDesc = {
  fontFamily: FONT_BODY,
  fontSize: '13.5px',
  color: C_BODY,
  lineHeight: '1.45',
  margin: '0',
};

const manageLink = {
  fontFamily: FONT_BODY,
  fontWeight: 600,
  fontSize: '13.5px',
  color: C_FOREST_DARK,
  textDecoration: 'none',
  borderBottom: '1px solid rgba(58,90,64,0.25)',
  paddingBottom: '1px',
};

// ── Founder banner ──
const founderWrap = { margin: '20px 28px', padding: 0 };

const founderBox = {
  backgroundColor: C_TERRA_SOFT,
  border: `1px solid rgba(201, 123, 92, 0.35)`,
  borderRadius: '14px',
  padding: '18px 24px 20px',
  textAlign: 'center' as const,
  position: 'relative' as const,
};

const founderStamp = {
  position: 'absolute' as const,
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%) rotate(-3deg)',
  backgroundColor: C_CREAM,
  border: `1px solid rgba(201, 123, 92, 0.35)`,
  color: C_TERRA_DARK,
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '14px',
  padding: '4px 12px',
  borderRadius: '999px',
  boxShadow: '0 6px 12px -8px rgba(201,123,92,0.5)',
  whiteSpace: 'nowrap' as const,
};

const founderHeadline = {
  fontFamily: FONT_BODY,
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: C_TERRA_DARK,
  margin: '10px 0 8px',
};

const founderBody = {
  fontFamily: FONT_BODY,
  fontSize: '14px',
  lineHeight: '1.55',
  color: C_TERRA_DARK,
  margin: '0',
};

// ── Signoff ──
const signoffBlock = { padding: '24px 36px 8px' };

const xo = {
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '16px',
  color: C_MUTED,
  margin: '0',
};

const nameSignoff = {
  fontFamily: FONT_SCRIPT,
  fontWeight: 700,
  fontSize: '42px',
  lineHeight: '1',
  color: C_TERRA,
  margin: '4px 0 4px',
};

const signoffRole = {
  fontFamily: FONT_BODY,
  fontWeight: 500,
  fontSize: '12.5px',
  letterSpacing: '0.04em',
  color: C_MUTED,
  margin: '0',
};

// ── Misc ──
const dashHr = {
  borderColor: C_RULE,
  borderStyle: 'dashed' as const,
  borderWidth: '1px 0 0',
  margin: '16px 36px 18px',
};

const legal = {
  fontFamily: FONT_BODY,
  fontSize: '12.5px',
  lineHeight: '1.55',
  color: C_MUTED,
  margin: '0 36px 8px',
};

const legalLink = {
  color: C_MUTED,
  textDecoration: 'underline',
};

// ── Footer ──
const credit = {
  textAlign: 'center' as const,
  padding: '8px 24px 28px',
};

const creditText = {
  fontFamily: FONT_BODY,
  fontSize: '12px',
  color: C_BEIGE_2,
  letterSpacing: '0.04em',
  margin: '0',
};

const creditItalic = {
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  color: C_MUTED,
};
