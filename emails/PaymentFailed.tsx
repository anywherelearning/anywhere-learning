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
  /** Formatted amount that failed, e.g. "$79". */
  amount: string;
  /** Stripe's hosted invoice page: pay with a new card, no sign-in needed. */
  payUrl: string;
}

const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';

/**
 * Payment-failed note. Sent once per invoice when a renewal or a trial's
 * first charge is declined (status goes 'past_due'). Calm and practical:
 * the library pauses until the payment goes through, one button fixes it. Never names the
 * bank's decline reason; "insufficient funds" in an inbox is nobody's business.
 */
export default function PaymentFailed({ firstName, amount, payUrl }: Props) {
  const name = firstName?.trim() || 'there';

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>
        Your payment didn&apos;t go through. It&apos;s a one-minute fix to get your library back.
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

              {/* ── 2 · What happened ── */}
              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    Quick heads-up
                  </div>
                  <div style={h1}>
                    Your payment didn&apos;t go through,{' '}
                    <span style={{ fontStyle: 'italic', color: C_FOREST }}>{name}</span>.
                  </div>
                  <Text style={p}>
                    Your <strong style={strongInk}>{amount}</strong> payment for Anywhere Learning
                    was declined by your bank. It happens all the time, usually an expired card or
                    a card limit, and it&apos;s an easy fix.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Your library is paused for now, and nothing is lost. As soon as the payment
                    goes through, everything is right where you left it. We&apos;ll try the card
                    again automatically over the next couple of weeks, or you can fix it right now.
                  </Text>
                </td>
              </tr>

              {/* ── 3 · The fix ── */}
              <tr>
                <td style={{ padding: '28px 48px 0', textAlign: 'center' as const }}>
                  <Link href={payUrl} style={btn}>
                    Update my payment
                  </Link>
                  <div style={ctaMicro}>Secure Stripe page. Takes a minute, no sign-in needed.</div>
                </td>
              </tr>

              {/* ── 4 · Sign-off ── */}
              <tr>
                <td style={{ padding: '30px 48px 0' }}>
                  <div style={{ fontSize: '15.5px', color: C_BODY }}>xo,</div>
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
                    You&apos;re receiving this note because a payment for your Anywhere Learning
                    membership didn&apos;t go through. If you&apos;d rather not continue, you
                    don&apos;t need to do anything. If the payment can&apos;t be collected, your
                    membership ends on its own and nothing more is charged.
                  </Text>
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
PaymentFailed.PreviewProps = {
  firstName: 'Sarah',
  amount: '$79',
  payUrl: 'https://invoice.stripe.com/i/preview',
} satisfies Props;

/* ── Brand tokens (shared with the other transactional emails) ── */

const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT = "'Dancing Script', 'Brush Script MT', cursive";

const C_CREAM = '#FAF8F3';
const C_INK = '#2D3A2E';
const C_BODY = '#4F5A50';
const C_MUTED = '#7B8378';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_FOREST_DARK = '#3A5A40';

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

const strongInk = { color: C_INK, fontWeight: 600 };

const signature = {
  fontFamily: FONT_SCRIPT,
  fontSize: '30px',
  color: C_FOREST_DARK,
  lineHeight: 1.2,
};

const legal = {
  fontSize: '12px',
  lineHeight: 1.6,
  color: C_MUTED,
  margin: '16px 0 0',
  fontFamily: FONT_BODY,
};

const credit = {
  textAlign: 'center' as const,
  fontSize: '12px',
  color: C_MUTED,
  padding: '18px 0 6px',
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
