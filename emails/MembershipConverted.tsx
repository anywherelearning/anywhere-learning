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
  libraryUrl: string;
  /** Link to manage / cancel the subscription. */
  manageUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';
const EMAIL_COLLAGE = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-library-hero.png';

/** "June 26, 2026" for fine print. */
function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Membership-converted email — fires when a free trial converts to a paid
 * membership (Stripe subscription 'trialing' → 'active'). A short, warm
 * confirmation: the moment they became a paying member, acknowledged.
 *
 * The welcome email (MembershipWelcome) already went out on day 0, so this one
 * stays focused: thank you, what just happened, and a door back into the library.
 */
export default function MembershipConverted({
  firstName,
  isFounderPhase,
  renewalDate,
  libraryUrl,
  manageUrl,
}: Props) {
  const name = firstName?.trim() || 'there';
  const price = isFounderPhase ? '$99' : '$149';
  const renews = new Date(renewalDate);

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        It&apos;s official, {name} — your trial just became a membership. Thank you for backing this.
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

              {/* ── 2 · It's official ── */}
              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    It&apos;s official
                  </div>
                  <div style={h1}>
                    You&apos;re a{' '}
                    <span style={{ fontStyle: 'italic', color: C_FOREST }}>member</span> now, {name}.
                  </div>
                  <Text style={p}>
                    Your free trial just turned into a real membership, which means it earned its
                    place in your week. That&apos;s the whole hope behind this, so thank you,
                    genuinely. I don&apos;t take it lightly.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Nothing changes about how you use it. Same library, same activities, same one
                    good hour at a time. The only difference is you can now save and print every
                    guide whenever you like, and the whole thing is yours for the year ahead.
                  </Text>
                </td>
              </tr>

              {/* ── 3 · Confirmation + CTA card ── */}
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
                          <div style={{ ...ctaLabel, marginTop: '16px' }}>Membership active</div>
                          <div style={confirmLine}>
                            {price} a year{isFounderPhase ? ', your founder rate, locked in for life' : ''}.
                            Renews {longDate(renews)}.
                          </div>
                          <div style={{ marginTop: '16px' }}>
                            <Link href={libraryUrl} style={btn}>
                              Open my library &rarr;
                            </Link>
                          </div>
                          <div style={ctaMicro}>
                            Cancel anytime from your account, or just reply to this email.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── 4 · Sign-off ── */}
              <tr>
                <td style={{ padding: '36px 48px 0' }}>
                  <Text style={{ ...p, margin: '0 0 4px' }}>
                    So glad you stayed. Now go do something real with your kids this week, they&apos;ll
                    remember it.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    And a genuine ask: as you and your kids dig in, tell me what they love and what
                    falls flat. I build every bit of this for families like yours, so what you notice
                    really does shape what comes next. Just hit reply, it lands straight in my inbox
                    and I read every one.
                  </Text>
                  <div style={{ fontSize: '15.5px', color: C_BODY, marginTop: '16px' }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '4px' }}>
                    Founder · Anywhere Learning
                  </div>
                </td>
              </tr>

              {/* ── 5 · Fine print ── */}
              <tr>
                <td style={{ padding: '28px 48px 32px' }}>
                  <div style={fadeDivider} />
                  <Text style={legal}>
                    You&apos;re receiving this note because your free trial of Anywhere Learning
                    converted to a paid membership today. Your membership renews each year at {price}{' '}
                    USD{isFounderPhase ? ', your founder rate, locked in' : ''}. You can cancel
                    anytime from your account page, or just reply to this email and I&apos;ll take
                    care of it myself.
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
MembershipConverted.PreviewProps = {
  firstName: 'Sarah',
  isFounderPhase: true,
  renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  libraryUrl: 'https://anywherelearning.co/account',
  manageUrl: 'https://anywherelearning.co/account/settings',
} satisfies Props;

/* ── Brand tokens (shared with the other transactional emails) ── */

const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT = "'Dancing Script', 'Brush Script MT', cursive";

const C_CREAM = '#FAF8F3';
const C_SAGE_SOFT = '#E6EBDF';
const C_SAGE_BORDER = '#C9D3BE';
const C_INK = '#2D3A2E';
const C_BODY = '#4F5A50';
const C_MUTED = '#7B8378';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_FOREST_DARK = '#3A5A40';
const C_TERRA = '#C97B5C';

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

const brandName = { fontFamily: FONT_DISPLAY, fontSize: '25px', color: C_INK, marginTop: '10px' };
const tagline = { fontSize: '13px', color: C_MUTED, marginTop: '5px', fontFamily: FONT_BODY };

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

const p = {
  fontSize: '15.5px',
  lineHeight: 1.68,
  color: C_BODY,
  margin: '18px 0 0',
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

const confirmLine = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: C_BODY,
  marginTop: '8px',
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

const ctaMicro = { fontSize: '12.5px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };

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
