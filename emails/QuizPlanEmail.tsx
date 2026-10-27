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
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/**
 * Quiz result email. The SURPRISE, not a re-run of the page.
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
      <Head />
      <Preview>A little surprise for taking the quiz: your free {guideName} guide is inside.</Preview>
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
                          <span style={badge}>FREE GIFT INSIDE</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>I tucked a free gift in with your plan.</div>
                  <div style={subline}>Thanks for taking the quiz. This one is yours to keep.</div>
                </td>
              </tr>

              {/* ── Intro ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    On top of the plan you just saw, here&apos;s a whole guide I normally sell for{' '}
                    {priceLabel}. No strings, just download it and use it.
                  </Text>
                </td>
              </tr>

              {/* ── Gift card ── */}
              <tr>
                <td style={{ padding: '22px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={giftCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '24px 24px 26px', textAlign: 'center' as const }}>
                          <Img
                            src={`${SITE}/products/${guideSlug}.jpg`}
                            alt={guideName}
                            width="170"
                            style={{ display: 'inline-block', width: '170px', height: 'auto', borderRadius: '10px', border: `1px solid ${C_RULE}` }}
                          />
                          <div style={{ ...label, color: C_FOREST, marginTop: '18px' }}>YOUR FREE GUIDE &middot; {priceLabel.toUpperCase()} VALUE</div>
                          <div style={giftHeadline}>{guideName}</div>
                          <div style={giftBody}>
                            Your kid plans a real family meal, prices out the ingredients, scales the
                            recipes, and keeps it all within a grocery budget. You lead, they do the math.
                          </div>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '20px auto 0' }}>
                            <tbody>
                              <tr>
                                <td style={btnCell}>
                                  <Link href={downloadUrl} style={btn}>Download my free guide &darr;</Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={micro}>A PDF you can open on any device, or print if you like.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Their type + the Saturday action ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED }}>YOUR QUIZ RESULT</div>
                  <div style={{ ...typeName, color: accent }}>{archetypeTitle}</div>
                  <Text style={{ ...p, margin: '6px 0 0' }}>
                    {tagline} Your full plan is back on the results page whenever you want it, but if
                    you only do one thing this week, make it this one.
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '18px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '46px', verticalAlign: 'top' }}>
                          <div style={{ ...stepDot, backgroundColor: C_TERRA, fontFamily: FONT_MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>SAT</div>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '3px 0 4px 16px' }}>
                          <div style={{ ...label, color: C_TERRA }}>TRY THIS TOGETHER ON SATURDAY</div>
                          <div style={stepBody}>{saturday}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Membership aside ── */}
              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={aside}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '16px 20px', fontSize: '15px', lineHeight: 1.6, color: C_BODY, fontFamily: FONT_BODY }}>
                          <strong style={{ color: C_INK }}>Want more like this?</strong> There are 120+
                          guides like this one inside the membership, built to close exactly the gap
                          your kid&apos;s plan pointed to.{' '}
                          <Link href={`${SITE}/#membership`} style={{ color: C_FOREST, fontWeight: 600 }}>
                            Try it all free for 7 days &rarr;
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Sign-off ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>Have fun with it,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              {/* ── Footer ── */}
              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                  <Text style={legal}>
                    You&apos;re getting this because you took the What&apos;s Your Kid&apos;s Missing
                    Life Skill quiz at anywherelearning.co with this email address.
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

/* ── "Trail map" tokens (match the Kit sequence emails, Oct 2026) ── */
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
const giftCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const giftHeadline = { fontFamily: FONT_DISPLAY, fontSize: '25px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const giftBody = { fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '9px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto', fontFamily: FONT_BODY };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const typeName = { fontFamily: FONT_DISPLAY, fontSize: '24px', lineHeight: 1.25, marginTop: '6px' };
const stepDot = { width: '34px', height: '34px', borderRadius: '50%', color: '#FFFFFF', fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: '34px', textAlign: 'center' as const };
const stepBody = { fontSize: '15.5px', lineHeight: 1.6, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };
const aside = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '12px' };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
