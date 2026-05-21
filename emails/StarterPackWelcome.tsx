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
  Section,
  Text,
} from '@react-email/components';

interface Props {
  /** The recipient's first name (or empty string if we don't know it). */
  firstName?: string;
  /** Magic-link sign-in URL from Clerk — signs them in + creates their account on first click. */
  signInUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

/**
 * Welcome email — Starter Pack v2 design.
 *
 * Visual twin of MembershipWelcome (same brand header, eyebrow rule, DM
 * Serif Display headlines, Skills Map illustration, CTA card, signoff).
 * Starter Pack specifics:
 *   - Subject + preview reframe ("Your Starter Pack is ready")
 *   - "Thank you for picking up the Starter Pack" intro close
 *   - "Open my Starter Pack →" CTA button
 *   - "What's in your Starter Pack" panel replaces "What's coming"
 *   - Sage upgrade nudge ("Whenever you're ready" → membership) replaces
 *     the peach founder banner
 *   - Fine print reframed to "one-time purchase, yours forever"
 */
export default function StarterPackWelcome({ firstName, signInUrl }: Props) {
  const name = firstName?.trim() || 'there';

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=Dancing+Script:wght@500;600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        Your 10 activities and the Skills Map are ready. Open in one click.
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

          {/* ── A warm welcome ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />A warm welcome
            </Text>
            <Heading style={h1Greet}>
              Hi {name}, I&apos;m so glad{' '}
              <span style={italicAccent}>you&apos;re here.</span>
            </Heading>
            <Text style={p}>
              I&apos;m Amelie. Fifteen years in classrooms, two degrees in education, a boy and
              a girl of my own. Last year I made the hardest call of my career: I left
              teaching to homeschool them. Partly because I missed them, mostly because I
              wanted to be the one helping them get ready for the life they&apos;re actually
              going to live.
            </Text>
            <Text style={p}>
              Anywhere Learning is what I wish I&apos;d had when I was the teacher AND the
              parent juggling both: small, doable, real-world activities a parent and a kid can
              do together. The stuff that builds the underlying muscle, self-regulation, focus,
              finishing things, the way childhood used to before we scheduled it all out.
            </Text>
            <Text style={pTight}>
              Thank you for picking up the Starter Pack. Honestly, you being here is what makes
              the whole thing possible.
            </Text>
          </div>

          {/* ── One-click sign-in CTA card ── */}
          <div style={ctaCardWrap}>
            <div style={ctaCard}>
              <div style={ctaSeal}>✦</div>
              <Text style={ctaLabel}>One-click sign-in</Text>
              <Link href={signInUrl} style={btn}>
                Open my Starter Pack →
              </Link>
              <Text style={ctaMicro}>
                This link signs you in and creates your account.
                <br />
                You can set a password from your settings whenever you want.
              </Text>
            </div>
          </div>

          {/* ── How it works ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />How it works
            </Text>
            <Heading as="h2" style={h2}>
              Start with the{' '}
              <span style={italicAccent}>Skills Map.</span>
            </Heading>
            <Text style={p}>
              It&apos;s your parent roadmap. It maps the skills modern childhood doesn&apos;t make
              space for (cooking, budgeting, planning, problem-solving, real-world math) to the
              right activity, at the right age. Open it first. Pick one. Grab what you already
              have at home. Do something real together.
            </Text>
            <Text style={pNoMargin}>
              Every activity comes with three skill levels, so siblings can work side by side
              at their own pace.
            </Text>
          </div>

          {/* ── Skills Map illustration (3 levels) ── */}
          <div style={mapCardWrap}>
            <div style={mapCard}>
              <div style={mapPinWrap}>
                <span style={mapPin}>3 levels · 1 activity</span>
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
                      <Level roman="i" name="Explore" desc="For getting started." />
                    </td>
                    <td style={levelsCell}>
                      <Level roman="ii" name="Develop" desc="For building confidence." />
                    </td>
                    <td style={levelsCell}>
                      <Level roman="iii" name="Extend" desc="For going deeper." />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── What's in your Starter Pack ── */}
          <div style={panelWrap}>
            <div style={panel}>
              <Text style={eyebrow}>
                <span style={eyebrowRule} />What&apos;s in your Starter Pack
              </Text>
              <Heading as="h2" style={h2}>
                Ten activities,{' '}
                <span style={italicAccent}>yours forever.</span>
              </Heading>
              <Bullet icon="▣" first>
                <strong style={bulletStrong}>10 hand-picked activities</strong>, pulled from
                across the library so your family gets a real taste of what&apos;s inside.
              </Bullet>
              <Bullet icon="◇">
                <strong style={bulletStrong}>The Future-Ready Skills Map</strong>, your parent
                roadmap to use alongside the activities.
              </Bullet>
              <Bullet icon="∞">
                <strong style={bulletStrong}>Yours forever</strong>, one-time purchase, no
                subscription, no renewal. Use them every year as your kids grow.
              </Bullet>
            </div>
          </div>

          {/* ── My door is open ── */}
          <div style={pad}>
            <Text style={eyebrow}>
              <span style={eyebrowRule} />My door is open
            </Text>
            <Heading as="h2" style={h2}>
              Talk to me{' '}
              <span style={italicAccent}>anytime.</span>
            </Heading>
            <Text style={p}>
              Reply to this email. It comes straight to me, and I read every one. Tell me how
              it&apos;s going. What clicks. What doesn&apos;t. What you wish existed. A question
              your kid asked that I should write about. I take requests, and I love hearing what
              you&apos;re doing.
            </Text>
            <Text style={pNoMargin}>
              And, if an activity lands really well with your kid, would you{' '}
              <Link href={`${baseUrl}/account`} style={inlineLink}>
                leave a quick review
              </Link>
              ? Other parents look at those before they pick what to do next, and your words
              matter more than mine.
            </Text>
          </div>

          {/* ── Ready for more? sage upgrade nudge ── */}
          <div style={upgradeWrap}>
            <div style={upgradeBox}>
              <div style={upgradeStamp}>Whenever you&apos;re ready</div>
              <Text style={upgradeHeadline}>Ready for more?</Text>
              <Text style={upgradeBody}>
                When you&apos;ve worked through these 10, the full membership unlocks the other
                90+ activities plus quarterly new drops, for $99/year. Founder rate while spots
                last.
              </Text>
              <Link href={`${baseUrl}/join`} style={upgradeLink}>
                See the membership →
              </Link>
            </div>
          </div>

          {/* ── Signature ── */}
          <div style={signoffBlock}>
            <Text style={xo}>xo,</Text>
            <Text style={nameSignoff}>Amelie</Text>
            <Text style={signoffRole}>Founder · Anywhere Learning</Text>
          </div>

          <Hr style={dashHr} />

          {/* ── Fine print ── */}
          <Text style={legal}>
            One-time purchase, yours forever. No subscription, no renewal. We never charge
            again. Manage your account from{' '}
            <Link href={`${baseUrl}/account/settings`} style={legalLink}>
              your account settings
            </Link>
            .
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

// ── Reusable: one Skills-Map level card ──
function Level({ roman, name, desc }: { roman: string; name: string; desc: string }) {
  return (
    <div style={level}>
      <Text style={levelNum}>{roman}</Text>
      <Text style={levelName}>{name}</Text>
      <Text style={levelDesc}>{desc}</Text>
    </div>
  );
}

// ── Reusable: one "What's in your Starter Pack" bullet ──
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
StarterPackWelcome.PreviewProps = {
  firstName: 'Sarah',
  signInUrl: 'https://anywherelearning.co/sign-in?__clerk_ticket=example_token',
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
const brandHead = {
  textAlign: 'center' as const,
  padding: '36px 24px 8px',
};

const brandIcon = {
  display: 'block' as const,
  margin: '0 auto 12px',
};

const brandName = {
  fontFamily: FONT_DISPLAY,
  fontSize: '22px',
  lineHeight: '1',
  color: C_INK,
  margin: '0 0 6px',
  letterSpacing: '-0.005em',
};

const brandItalic = {
  fontStyle: 'italic' as const,
  color: C_FOREST,
};

const tagline = {
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '14px',
  color: C_MUTED,
  margin: '0',
};

// ── Section padding ──
const pad = {
  padding: '6px 36px 4px',
};

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

const italicAccent = {
  fontStyle: 'italic' as const,
  color: C_FOREST,
};

// ── Body ──
const p = {
  fontFamily: FONT_BODY,
  color: C_BODY,
  fontSize: '15.5px',
  lineHeight: '1.65',
  margin: '0 0 14px',
};

const pTight = { ...p, marginBottom: '4px' };
const pNoMargin = { ...p, marginBottom: '0' };

// ── CTA card ──
const ctaCardWrap = {
  margin: '24px 28px 4px',
  padding: 0,
};

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

// ── Skills Map illustration ──
const mapCardWrap = {
  margin: '6px 28px 0',
  padding: 0,
};

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

const mapPinWrap = {
  textAlign: 'center' as const,
};

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

const level = {
  border: `1px solid ${C_RULE}`,
  backgroundColor: C_CREAM,
  borderRadius: '10px',
  padding: '10px 8px 11px',
  textAlign: 'left' as const,
};

const levelNum = {
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '14px',
  color: C_FOREST,
  margin: '0 0 4px',
  lineHeight: '1',
};

const levelName = {
  fontFamily: FONT_DISPLAY,
  fontSize: '15px',
  lineHeight: '1.1',
  color: C_INK,
  margin: '0 0 4px',
};

const levelDesc = {
  fontFamily: FONT_BODY,
  fontSize: '11.5px',
  color: C_BODY,
  lineHeight: '1.4',
  margin: '0',
};

// ── "What's in your Starter Pack" panel ──
const panelWrap = {
  margin: '20px 28px',
  padding: 0,
};

const panel = {
  backgroundColor: C_CREAM_2,
  border: `1px solid ${C_RULE}`,
  borderRadius: '14px',
  padding: '24px 28px 22px',
};

const bulletRow = {
  borderTop: `1px dashed ${C_BEIGE_2}`,
};

const bulletRowFirst = {
  borderTop: '0',
};

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

const bulletStrong = {
  color: C_INK,
  fontWeight: 600,
};

// ── Sage upgrade nudge (mirrors the founder banner shape, sage-tinted) ──
const upgradeWrap = {
  margin: '20px 28px',
  padding: 0,
};

const upgradeBox = {
  backgroundColor: C_SAGE_SOFT,
  border: `1px solid ${C_SAGE_BORDER}`,
  borderRadius: '14px',
  padding: '18px 24px 20px',
  textAlign: 'center' as const,
  position: 'relative' as const,
};

const upgradeStamp = {
  position: 'absolute' as const,
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%) rotate(-3deg)',
  backgroundColor: C_CREAM,
  border: `1px solid ${C_SAGE_BORDER}`,
  color: C_FOREST_DARK,
  fontFamily: FONT_DISPLAY,
  fontStyle: 'italic' as const,
  fontSize: '14px',
  padding: '4px 12px',
  borderRadius: '999px',
  boxShadow: '0 6px 12px -8px rgba(58,90,64,0.3)',
  whiteSpace: 'nowrap' as const,
};

const upgradeHeadline = {
  fontFamily: FONT_BODY,
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: C_FOREST_DARK,
  margin: '10px 0 8px',
};

const upgradeBody = {
  fontFamily: FONT_BODY,
  fontSize: '14px',
  lineHeight: '1.55',
  color: C_BODY,
  margin: '0 0 12px',
};

const upgradeLink = {
  display: 'inline-block' as const,
  fontFamily: FONT_BODY,
  fontWeight: 600,
  fontSize: '14px',
  color: C_FOREST_DARK,
  textDecoration: 'none',
  borderBottom: '1px solid rgba(58,90,64,0.3)',
  paddingBottom: '2px',
};

// ── Signoff ──
const signoffBlock = {
  padding: '24px 36px 8px',
};

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

const inlineLink = {
  color: C_FOREST_DARK,
  textDecoration: 'underline',
  fontWeight: 600,
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
