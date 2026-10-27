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
  /** Whether they're on the locked founder rate ($99/yr instead of $149/yr). */
  isFounderPhase: boolean;
  /** ISO date the membership renews (the current paid period end). */
  renewalDate: string;
  /** Link straight into their library. */
  homeUrl: string;
  /** Link to manage / cancel the subscription. */
  manageUrl: string;
  /** Discounted first-year price (e.g. '$79' for the Fall offer). */
  firstYearPrice?: string;
  /** Billing plan. Monthly swaps the price/interval wording; defaults to annual. */
  plan?: 'annual' | 'monthly';
}

// Absolute, always-live host for email assets (never localhost).
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;
const EMAIL_COLLAGE = `${SITE}/email-library-hero-v2.jpg`;

/** "June 26, 2026" for fine print. */
function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Membership-converted email. Fires when a free trial converts to a paid
 * membership (Stripe subscription 'trialing' to 'active'). A short, warm
 * confirmation: the moment they became a paying member, acknowledged.
 *
 * The welcome email (MembershipWelcome) already went out on day 0, so this one
 * stays focused: thank you, what just happened, and a door back into the library.
 */
export default function MembershipConverted({
  firstName,
  isFounderPhase,
  renewalDate,
  homeUrl,
  manageUrl,
  plan,
  firstYearPrice,
}: Props) {
  const name = firstName?.trim() || 'there';
  const isMonthly = plan === 'monthly';
  const price = isMonthly ? '$15' : isFounderPhase ? '$99' : '$149';
  const per = isMonthly ? 'month' : 'year';
  const renews = new Date(renewalDate);

  return (
    <Html>
      <Head />
      <Preview>
        It&apos;s official, {name}. Your trial just became a membership. Thank you for backing this.
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
                          <span style={badge}>YOU&apos;RE A MEMBER</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>You&apos;re a member now, {name}.</div>
                  <div style={subline}>Your free trial just turned into a real membership. Thank you.</div>
                </td>
              </tr>

              {/* ── Intro ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    It earned its place in your week, and that&apos;s the whole hope behind this. So
                    thank you, genuinely. I don&apos;t take it lightly.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Nothing changes about how you use it. Same library, same activities, same one
                    good hour at a time with your kids. The only difference is you can now save and
                    print every guide whenever you like, and the whole thing is yours for the {per}{' '}
                    ahead.
                  </Text>
                </td>
              </tr>

              {/* ── Confirmation + CTA card ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '24px 24px 26px', textAlign: 'center' as const }}>
                          <Img
                            src={EMAIL_COLLAGE}
                            alt="A fan of Anywhere Learning activity guides with the Skills Map in front"
                            width="300"
                            style={{ display: 'inline-block', width: '300px', maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
                          />
                          <div style={{ ...label, color: C_FOREST, marginTop: '18px' }}>MEMBERSHIP ACTIVE</div>
                          <div style={confirmLine}>
                            {firstYearPrice ? `${firstYearPrice} for your first year, then ${price} a ${per}` : `${price} a ${per}`}{isFounderPhase ? ', your founder rate, locked in for life' : ''}.
                            Renews {longDate(renews)}.
                          </div>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '20px auto 0' }}>
                            <tbody>
                              <tr>
                                <td style={btnCell}>
                                  <Link href={homeUrl} style={btn}>Continue our adventure &rarr;</Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={micro}>Changed your mind? You have 14 days for a full refund.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Sign-off ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={p}>
                    So glad you stayed. Now go do something real together this week, your kids
                    will remember it.
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
                    You&apos;re receiving this note because your free trial of Anywhere Learning
                    converted to a paid membership today. Your membership renews each {per} at {price}{' '}
                    USD{isFounderPhase ? ', your founder rate, locked in' : ''}. If it&apos;s not the
                    right fit, you have 14 days from today for a full refund, no questions asked,
                    just email info@anywherelearning.co.
                  </Text>
                  <Text style={{ ...legal, marginTop: '10px' }}>
                    <Link href={manageUrl} style={{ color: '#A09A8C', textDecoration: 'underline' }}>
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
MembershipConverted.PreviewProps = {
  firstName: 'Sarah',
  isFounderPhase: true,
  renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  homeUrl: 'https://anywherelearning.co/account/home',
  manageUrl: 'https://anywherelearning.co/account/settings',
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
const sageCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const confirmLine = { fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '8px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto', fontFamily: FONT_BODY };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
