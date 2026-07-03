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
  /** Whether the founder rate is still open for new signups when this fires. */
  isFounderPhase: boolean;
  /** Stripe Checkout recovery URL (`session.after_expiration.recovery.url`) if
   *  available — sends them back to their pre-filled form. Falls back to /join. */
  resumeUrl: string;
  /** Live count of founder spots remaining (100 - active members). Optional —
   *  if omitted, the founder stamp falls back to a generic "Founder rate" label. */
  spotsLeft?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

/**
 * Sent when a MEMBERSHIP Stripe Checkout session expires WITHOUT a
 * successful payment. Warm "I held your spot" tone, not a sales nudge.
 *
 * v2 design — same brand language as the welcome / renewal templates:
 *   - Sage CTA card with floating ✦ seal
 *   - Cross-hatched cream-2 card showing what's in the membership (3 stat cells)
 *   - "In case you were wondering" FAQ panel
 *   - Founder banner with live "X spots left" stamp (only when isFounderPhase)
 */
export default function AbandonedCheckoutMembership({
  firstName,
  isFounderPhase,
  resumeUrl,
  spotsLeft,
}: Props) {
  const name = firstName?.trim() || 'there';
  const showFounderStamp = isFounderPhase && typeof spotsLeft === 'number' && spotsLeft > 0;
  const priceLabel = isFounderPhase ? '$99' : '$149';
  const subhead = isFounderPhase
    ? 'Your cart, your founder rate, your activities, still waiting.'
    : 'Your cart, your founder spot if available, your activities, still waiting.';

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=Dancing+Script:wght@500;600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        I held your spot. Pick up where you left off, or reply if anything&apos;s holding you up.
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

          {/* ── A note, not a nudge ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />A note, not a nudge
            </Text>
            <Heading style={h1Greet}>
              Hi {name}, I held your spot{' '}
              <span style={italicAccent}>for a bit.</span>
            </Heading>
            <Text style={p}>
              Earlier today you started signing up for Anywhere Learning and got partway through.
              Life happens. A kid needs something, an email pings, the dog gets out. No judgment
              from this side.
            </Text>
            <Text style={pTight}>
              I just wanted to leave you the link in case you&apos;d like to come back to it.{' '}
              {subhead}
            </Text>
          </div>

          {/* ── Resume checkout CTA ── */}
          <div style={ctaCardWrap}>
            <div style={ctaCard}>
              <div style={ctaSeal}>✦</div>
              <Text style={ctaLabel}>Pick up where you left off</Text>
              <Link href={resumeUrl} style={btn}>
                Resume my checkout →
              </Link>
              <Text style={ctaMicro}>
                {isFounderPhase ? (
                  <>
                    Founder rate held · $99/year, locked in for life.
                    <br />
                    Founder spots are filling, your rate holds while they last.
                  </>
                ) : (
                  <>
                    Membership · $149/year, cancel anytime.
                    <br />
                    14-day full refund if it&apos;s not for you.
                  </>
                )}
              </Text>
            </div>
          </div>

          {/* ── In your cart ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />In your cart
            </Text>
            <Heading as="h2" style={h2}>
              One year of{' '}
              <span style={italicAccent}>real-world learning.</span>
            </Heading>
            <Text style={pNoMargin}>
              Here&apos;s what&apos;s waiting on the other side of that checkout button. The whole
              library, three difficulty levels per activity, and the parent roadmap that ties it
              all together.
            </Text>
          </div>

          {/* ── Cart contents (3-stat map card) ── */}
          <div style={mapCardWrap}>
            <div style={mapCard}>
              <div style={mapPinWrap}>
                <span style={mapPin}>
                  Annual membership{isFounderPhase ? ' · founder rate' : ''}
                </span>
              </div>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                width="100%"
                style={levelsTable}
              >
                <tbody>
                  <tr>
                    <td style={levelsCell}>
                      <Stat
                        num="100+"
                        name="Activities"
                        desc="Across eight real-life categories."
                      />
                    </td>
                    <td style={levelsCell}>
                      <Stat
                        num="4×"
                        name="Drops a year"
                        desc="New activities every quarter, included."
                      />
                    </td>
                    <td style={levelsCell}>
                      <Stat
                        num={priceLabel}
                        name={isFounderPhase ? 'Locked in' : 'Per year'}
                        desc={
                          isFounderPhase
                            ? 'Founder rate for life. Renews at the same price.'
                            : 'Renews annually. Cancel anytime.'
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── In case you were wondering (FAQ panel) ── */}
          <div style={panelWrap}>
            <div style={panel}>
              <Text style={eyebrow}>
                <span style={eyebrowRule} />In case you were wondering
              </Text>
              <Heading as="h2" style={h2}>
                The three questions{' '}
                <span style={italicAccent}>I get most.</span>
              </Heading>
              <Bullet icon="?" first>
                <strong style={bulletStrong}>&ldquo;Will my kid actually use it?&rdquo;</strong>{' '}
                Every activity is hands-on. Real cooking, real building, real time outside. No
                screens required. Most lands the first try.
              </Bullet>
              <Bullet icon="↻">
                <strong style={bulletStrong}>&ldquo;What if it doesn&apos;t click for us?&rdquo;</strong>{' '}
                14-day full refund, no questions, no awkward emails. Just reply and it&apos;s done.
              </Bullet>
              <Bullet icon="$">
                <strong style={bulletStrong}>&ldquo;Why {priceLabel} when there&apos;s free stuff out there?&rdquo;</strong>{' '}
                Pinterest takes hours. This is a teacher&apos;s library, built to land the first
                try, with three skill levels so it actually fits your kid. Less time searching,
                more time doing.
              </Bullet>
            </div>
          </div>

          {/* ── Or just ask ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />Or just ask
            </Text>
            <Heading as="h2" style={h2}>
              Reply if{' '}
              <span style={italicAccent}>anything&apos;s holding you up.</span>
            </Heading>
            <Text style={pNoMargin}>
              This email goes straight to me, not a support inbox, not a bot. If there&apos;s
              something specific you wanted to check before you sign up, hit reply. I read every
              one, usually the same day.
            </Text>
          </div>

          {/* ── Founder spots banner ── */}
          {isFounderPhase && (
            <div style={founderWrap}>
              <div style={founderBox}>
                {showFounderStamp && (
                  <div style={founderStamp}>{spotsLeft} spots left</div>
                )}
                <Text style={founderHeadline}>The founder rate</Text>
                <Text style={founderBody}>
                  $99/year, locked in for as long as you stay a member, the first 100 only. After
                  that, it&apos;s $149 for everyone else. Your seat is in the cart already.
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
            You&apos;re getting this because you started a checkout on anywherelearning.co and
            didn&apos;t finish. Nothing has been charged.
            {isFounderPhase ? ' Founder spots are limited to the first 100 members.' : ''}
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

// ── Reusable: one stat card (mirrors the Level shape from the welcome email) ──
function Stat({ num, name, desc }: { num: string; name: string; desc: string }) {
  return (
    <div style={stat}>
      <Text style={statNum}>{num}</Text>
      <Text style={statName}>{name}</Text>
      <Text style={statDesc}>{desc}</Text>
    </div>
  );
}

// ── Reusable: one FAQ bullet ──
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
AbandonedCheckoutMembership.PreviewProps = {
  firstName: 'Sarah',
  isFounderPhase: true,
  resumeUrl: 'https://checkout.stripe.com/c/pay/example',
  spotsLeft: 48,
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

// Brand header
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

const pad = { padding: '6px 36px 4px' };

// Eyebrow
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

// Headlines
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

// Body
const p = {
  fontFamily: FONT_BODY,
  color: C_BODY,
  fontSize: '15.5px',
  lineHeight: '1.65',
  margin: '0 0 14px',
};
const pTight = { ...p, marginBottom: '4px' };
const pNoMargin = { ...p, marginBottom: '0' };

// CTA card
const ctaCardWrap = { margin: '24px 28px 4px', padding: 0 };
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

// Cart contents (map-card style)
const mapCardWrap = { margin: '6px 28px 0', padding: 0 };
const mapCard = {
  border: `1px solid ${C_RULE}`,
  borderRadius: '14px',
  backgroundColor: C_CREAM_2,
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(120,90,40,0.045) 0 2px, transparent 2px 12px)',
  padding: '14px 6px',
};
const mapPin = {
  display: 'inline-block' as const,
  fontFamily: FONT_BODY,
  fontWeight: 500,
  fontSize: '10.5px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: C_MUTED,
  backgroundColor: C_CREAM,
  border: `1px solid ${C_RULE}`,
  padding: '4px 11px',
  borderRadius: '999px',
  margin: '0 0 12px',
};
const mapPinWrap = { textAlign: 'center' as const };
const levelsTable = {
  width: '100%',
  tableLayout: 'fixed' as const,
  borderCollapse: 'separate' as const,
};
const levelsCell = {
  width: '33.33%',
  verticalAlign: 'top' as const,
  padding: '0 2px',
};
const stat = {
  border: `1px solid ${C_RULE}`,
  backgroundColor: C_CREAM,
  borderRadius: '10px',
  padding: '12px 10px 14px',
  textAlign: 'left' as const,
};
const statNum = {
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '24px',
  lineHeight: '1',
  color: C_FOREST_DARK,
  margin: '0 0 4px',
  letterSpacing: '-0.02em',
};
const statName = {
  fontFamily: FONT_DISPLAY,
  fontSize: '15px',
  lineHeight: '1.1',
  color: C_INK,
  margin: '0 0 4px',
};
const statDesc = {
  fontFamily: FONT_BODY,
  fontSize: '11.5px',
  color: C_BODY,
  lineHeight: '1.4',
  margin: '0',
};

// FAQ panel
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
const bulletBodyCol = { verticalAlign: 'top' as const, padding: '12px 0' };
const bulletText = {
  fontFamily: FONT_BODY,
  fontSize: '14.5px',
  lineHeight: '1.55',
  color: C_BODY,
  margin: '0',
};
const bulletStrong = { color: C_INK, fontWeight: 600 };

// Founder banner
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

// Signoff
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

// Misc
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

// Footer
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
