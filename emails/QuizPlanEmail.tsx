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
  /** Archetype name, e.g. "The Non-Finisher". */
  archetypeTitle: string;
  /** Archetype tagline, e.g. "Big starts, unfinished middles." */
  tagline: string;
  /** The archetype's accent color (hex), used for the ribbon + type name. */
  accent: string;
  /** The "do this Saturday" one-liner (the one actionable keepsake). */
  saturday: string;
  /** Flagship free guide name, e.g. "Kitchen Math & Meal Planning". */
  guideName: string;
  /** Flagship guide slug, used to build its cover-image URL. */
  guideSlug: string;
  /** Price label of the free guide, e.g. "$5.99". */
  priceLabel: string;
  /** Direct download URL for the guide PDF. */
  downloadUrl: string;
}

// Absolute, always-live host for email assets + links (never localhost).
const SITE = 'https://anywherelearning.co';
const EMAIL_LOGO =
  'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';

/**
 * Quiz result email — the SURPRISE, not a re-run of the page.
 *
 * The recipient just read their full plan (type, skills, Saturday action,
 * activities) on the result page seconds ago, so this email deliberately does
 * NOT repeat it. Its whole job is the thing they can't get on the page: the
 * actual free guide, front and centre with a one-click download. One personal
 * tie (their kid's type + the single Saturday action, worth keeping in the
 * inbox to act on later) keeps it warm; a soft PS handles the trial.
 */
export default function QuizPlanEmail({
  archetypeTitle,
  tagline,
  accent,
  saturday,
  guideName,
  guideSlug,
  priceLabel,
  downloadUrl,
}: Props) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>A little surprise for taking the quiz: your free {guideName} guide is inside.</Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={envelope}>
            <tbody>

              {/* accent ribbon */}
              <tr>
                <td style={{ height: '6px', backgroundColor: accent, borderTopLeftRadius: '18px', borderTopRightRadius: '18px', lineHeight: '6px', fontSize: '1px' }}>&nbsp;</td>
              </tr>

              {/* ── Brand header ── */}
              <tr>
                <td style={{ padding: '32px 48px 20px', textAlign: 'center' as const }}>
                  <Img src={EMAIL_LOGO} alt="Anywhere Learning" width="42" height="42" style={{ display: 'inline-block', width: '42px', height: '42px' }} />
                  <div style={brandName}>
                    anywhere <span style={{ fontStyle: 'italic', color: C_FOREST }}>learning</span>
                  </div>
                </td>
              </tr>

              {/* ── The surprise (hero) ── */}
              <tr>
                <td style={{ padding: '6px 48px 0', textAlign: 'center' as const }}>
                  <div style={{ ...eyebrow, color: C_GOLD_DARK }}>A little surprise, just for you</div>
                  <div style={h1}>
                    I tucked a{' '}
                    <span style={{ fontStyle: 'italic', color: accent }}>free gift</span>{' '}
                    in with your plan.
                  </div>
                  <Text style={{ ...p, textAlign: 'center' as const, maxWidth: '400px', margin: '12px auto 0' }}>
                    Thanks for taking the quiz. On top of the plan you just saw, here&apos;s a whole
                    guide I normally sell, yours to keep.
                  </Text>
                </td>
              </tr>

              {/* ── Gift card ── */}
              <tr>
                <td style={{ padding: '22px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={giftCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '26px 26px 28px', textAlign: 'center' as const }}>
                          <Img
                            src={`${SITE}/products/${guideSlug}.jpg`}
                            alt={guideName}
                            width="150"
                            height="150"
                            style={{ display: 'inline-block', width: '150px', height: 'auto', borderRadius: '10px', border: '1px solid rgba(181,128,62,0.4)' }}
                          />
                          <div style={{ ...giftEyebrow, marginTop: '18px' }}>Your free gift · {priceLabel} value</div>
                          <div style={giftHeadline}>{guideName}</div>
                          <div style={giftBody}>
                            The complete guide, the same one I sell for {priceLabel}. Your kid plans a
                            real meal, shops for it on a budget, then cooks it. Yours free.
                          </div>
                          <div style={{ marginTop: '18px' }}>
                            <Link href={downloadUrl} style={giftBtn}>Download my free guide &darr;</Link>
                          </div>
                          <div style={giftMicro}>A PDF you can open on any device, or print if you like.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── One personal tie: their type + the Saturday action ── */}
              <tr>
                <td style={{ padding: '26px 48px 0' }}>
                  <div style={fadeDivider} />
                  <Text style={{ ...p, margin: '22px 0 0' }}>
                    Your quiz says you&apos;ve got{' '}
                    <span style={{ fontWeight: 600, color: accent }}>{archetypeTitle}</span> on your
                    hands ({tagline.toLowerCase().replace(/\.$/, '')}). Your full plan is back on the
                    results page whenever you want it, but if you only do one thing this week, make it
                    this:
                  </Text>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ ...saturdayCard, marginTop: '14px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={saturdayLabel}>Try this together on Saturday</div>
                          <div style={saturdayBody}>{saturday}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Sign-off + soft trial PS ── */}
              <tr>
                <td style={{ padding: '28px 48px 0' }}>
                  <Text style={p}>
                    Try it, then hit reply and tell me how it went. I read every one.
                  </Text>
                  <div style={{ fontSize: '15px', color: C_BODY, marginTop: '14px' }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '2px' }}>Founder · Anywhere Learning</div>
                  <Text style={{ ...ps, margin: '20px 0 0' }}>
                    <strong style={{ color: C_INK }}>PS</strong> &mdash; there are 120+ guides like this
                    one inside the membership, built to close exactly the gap your kid&apos;s plan
                    pointed to. You can{' '}
                    <Link href={`${SITE}/join`} style={{ color: C_FOREST, fontWeight: 600 }}>try it all free for 14 days</Link>.
                  </Text>
                </td>
              </tr>

              {/* ── Fine print ── */}
              <tr>
                <td style={{ padding: '26px 48px 32px' }}>
                  <div style={fadeDivider} />
                  <Text style={legal}>
                    You&apos;re getting this because you took the What&apos;s Your Kid&apos;s Missing
                    Life Skill quiz at anywherelearning.co with this email address. Questions? Just
                    reply, it lands straight in my inbox.
                  </Text>
                </td>
              </tr>

            </tbody>
          </table>
          <div style={credit}>
            Anywhere Learning · <em style={{ fontStyle: 'italic' }}>Built by Amelie</em> · Made in Nelson, BC
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for `npm run email:preview`.
QuizPlanEmail.PreviewProps = {
  archetypeTitle: 'The Non-Finisher',
  tagline: 'Big starts, unfinished middles.',
  accent: '#B6913F',
  saturday:
    'This Saturday, pick one small thing and finish it together in a single afternoon, start to done. Bake it, build it, film it, whatever it is. Do not stop until it is actually finished.',
  guideName: 'Kitchen Math & Meal Planning',
  guideSlug: 'kitchen-math-challenge',
  priceLabel: '$5.99',
  downloadUrl: 'https://anywherelearning.co',
} satisfies Props;

/* ── Brand tokens (shared with MembershipWelcome) ── */
const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT = "'Dancing Script', 'Brush Script MT', cursive";

const C_CREAM = '#FAF8F3';
const C_INK = '#2D3A2E';
const C_BODY = '#4F5A50';
const C_MUTED = '#7B8378';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_GOLD_DARK = '#8A6A22';
const C_TERRA = '#C97B5C';

const body = { backgroundColor: '#E9E5DC', fontFamily: FONT_BODY, margin: 0, padding: '24px 12px' };

const envelope = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_CREAM,
  border: `1px solid ${C_RULE}`,
  borderRadius: '18px',
};

const brandName = { fontFamily: FONT_DISPLAY, fontSize: '24px', color: C_INK, marginTop: '9px' };

const fadeDivider = {
  height: '1px',
  backgroundColor: C_RULE,
  backgroundImage: `linear-gradient(to right, rgba(216,212,197,0), ${C_RULE}, rgba(216,212,197,0))`,
};

const eyebrow = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const h1 = { fontFamily: FONT_DISPLAY, fontSize: '29px', lineHeight: 1.18, color: C_INK, marginTop: '10px' };

const giftCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundImage: 'linear-gradient(140deg, #FBF3E2 0%, #F2E2C1 100%)',
  backgroundColor: '#FBF3E2',
  border: '1px solid rgba(181,128,62,0.42)',
  borderRadius: '16px',
};
const giftEyebrow = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.16em',
  color: C_GOLD_DARK,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};
const giftHeadline = { fontFamily: FONT_DISPLAY, fontSize: '25px', color: C_INK, marginTop: '6px' };
const giftBody = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#5c4a2e',
  marginTop: '9px',
  maxWidth: '400px',
  marginLeft: 'auto',
  marginRight: 'auto',
  fontFamily: FONT_BODY,
};
const giftBtn = {
  display: 'inline-block',
  backgroundColor: C_FOREST,
  color: '#F7F4EA',
  fontSize: '15.5px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '11px',
  fontFamily: FONT_BODY,
};
const giftMicro = { fontSize: '12px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };

const saturdayCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: '#FBF3E2',
  border: '1px solid rgba(181,128,62,0.32)',
  borderRadius: '13px',
};
const saturdayLabel = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.13em',
  color: C_GOLD_DARK,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};
const saturdayBody = { fontSize: '14.5px', lineHeight: 1.6, color: '#5c4a2e', marginTop: '7px', fontFamily: FONT_BODY };

const p = { fontSize: '15px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const ps = { fontSize: '13.5px', lineHeight: 1.6, color: C_MUTED, fontFamily: FONT_BODY };
const signature = { fontFamily: FONT_SCRIPT, fontSize: '42px', fontWeight: 600, color: C_TERRA, lineHeight: 1.15, marginTop: '2px' };
const legal = { fontSize: '12px', lineHeight: 1.6, color: C_MUTED, margin: '16px 0 0', fontFamily: FONT_BODY };
const credit = { textAlign: 'center' as const, fontSize: '12px', color: C_MUTED, paddingTop: '10px', fontFamily: FONT_BODY };
