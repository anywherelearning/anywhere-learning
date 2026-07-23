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

interface Activity {
  name: string;
  note: string;
  /** Product slug, used to build the cover-image URL. */
  slug: string;
}

interface Props {
  /** Archetype name, e.g. "The Non-Finisher". */
  archetypeTitle: string;
  /** Archetype tagline, e.g. "Big starts, unfinished middles." */
  tagline: string;
  /** The archetype's accent color (hex), used for the identity + numerals. */
  accent: string;
  /** One or two skill-gap labels (the "skills to build next"). */
  gaps: string[];
  /** The "do this Saturday" one-liner. */
  saturday: string;
  /** The three matched activities (name + note + slug for the cover image). */
  activities: Activity[];
  /** Flagship free guide name, e.g. "Kitchen Math & Meal Planning". */
  guideName: string;
  /** Price label of the free guide, e.g. "$5.99". */
  priceLabel: string;
  /** Direct download URL for the guide PDF. */
  downloadUrl: string;
}

// Absolute, always-live host for email assets + links (never localhost, so
// images render in every inbox regardless of deploy state).
const SITE = 'https://anywherelearning.co';
const EMAIL_LOGO =
  'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';

/**
 * Quiz result + free gift email. Fires the moment the quiz completes (from
 * /api/quiz): the personalized Real-World Skills Plan (styled to match the
 * on-page result, with activity cover photos and per-section card colors) plus
 * a one-click download of the flagship guide.
 */
export default function QuizPlanEmail({
  archetypeTitle,
  tagline,
  accent,
  gaps,
  saturday,
  activities,
  guideName,
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
      <Preview>
        Your kid&apos;s Real-World Skills Plan is here, plus a free gift I tucked in your inbox.
      </Preview>
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
              <tr>
                <td style={{ padding: '0 48px' }}><div style={fadeDivider} /></td>
              </tr>

              {/* ── Result headline ── */}
              <tr>
                <td style={{ padding: '30px 48px 0', textAlign: 'center' as const }}>
                  <div style={eyebrow}>Your kid&apos;s Real-World Skills Plan</div>
                  <div style={h1}>
                    Your kid is <span style={{ fontStyle: 'italic', color: accent }}>{archetypeTitle}</span>
                  </div>
                  <div style={{ ...taglineText, color: accent }}>{tagline}</div>
                </td>
              </tr>

              {/* ── The skills ── */}
              <tr>
                <td style={{ padding: '26px 48px 0' }}>
                  <div style={sectionLabel}>
                    {gaps.length > 1 ? 'Two skills to build next' : 'The skill to build next'}
                  </div>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%', marginTop: '10px' }}>
                    <tbody>
                      {gaps.map((g, i) => (
                        <tr key={i}>
                          <td style={{ width: '34px', verticalAlign: 'top' as const, paddingTop: '1px' }}>
                            <span style={{ ...gapNum, color: accent }}>{i + 1}</span>
                          </td>
                          <td style={{ verticalAlign: 'top' as const, paddingBottom: i === gaps.length - 1 ? '0' : '10px' }}>
                            <span style={gapText}>{g}.</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Do this Saturday (gold card) ── */}
              <tr>
                <td style={{ padding: '22px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={saturdayCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '18px 22px' }}>
                          <div style={saturdayLabel}>Try this together on Saturday</div>
                          <div style={saturdayBody}>{saturday}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Matched activities (photo cards) ── */}
              <tr>
                <td style={{ padding: '26px 48px 0' }}>
                  <div style={sectionLabel}>Three activities that fit this plan</div>
                  {activities.map((a, i) => (
                    <table key={i} role="presentation" cellPadding={0} cellSpacing={0} style={{ ...activityCard, marginTop: i === 0 ? '12px' : '8px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '66px', padding: '9px 0 9px 9px', verticalAlign: 'middle' as const }}>
                            <Img
                              src={`${SITE}/products/${a.slug}.jpg`}
                              alt=""
                              width="56"
                              height="56"
                              style={{ display: 'block', width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover' as const, border: '1px solid #ECE7DB' }}
                            />
                          </td>
                          <td style={{ padding: '9px 16px 9px 14px', verticalAlign: 'middle' as const }}>
                            <div style={activityName}>{a.name}</div>
                            <div style={activityNote}>{a.note}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ))}
                </td>
              </tr>

              {/* ── The free gift (gold gradient card) ── */}
              <tr>
                <td style={{ padding: '28px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={giftCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '26px 26px 28px', textAlign: 'center' as const }}>
                          <div style={giftEyebrow}>A free gift, on the house · {priceLabel}</div>
                          <div style={giftHeadline}>{guideName}</div>
                          <div style={giftBody}>
                            The complete guide, the same one I sell for {priceLabel}. Your kid plans
                            a real meal, shops for it on a budget, then cooks it. It&apos;s yours free.
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

              {/* ── Trial CTA (forest card) ── */}
              <tr>
                <td style={{ padding: '18px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={forestCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '26px 26px 28px', textAlign: 'center' as const }}>
                          <div style={forestHeadline}>These three are just the start.</div>
                          <div style={forestBody}>
                            Your membership opens 120+ guided activities like these, built to close
                            exactly this gap. No planning, no prep. Free for 14 days.
                          </div>
                          <div style={{ marginTop: '18px' }}>
                            <Link href={`${SITE}/join`} style={forestBtn}>Start your free trial &rarr;</Link>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Sign-off ── */}
              <tr>
                <td style={{ padding: '30px 48px 0' }}>
                  <Text style={p}>
                    Try the Saturday idea this week and see what happens. Then hit reply and tell me
                    how it went. I read every one.
                  </Text>
                  <div style={{ fontSize: '15px', color: C_BODY, marginTop: '14px' }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '2px' }}>Founder · Anywhere Learning</div>
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
  gaps: [
    'Planning something, sticking with it, and seeing it through',
    'Knowing when to put the screen down, and having something better to reach for',
  ],
  saturday:
    'This Saturday, pick one small thing and finish it together in a single afternoon, start to done. Bake it, build it, film it, whatever it is. Do not stop until it is actually finished.',
  activities: [
    { name: 'Board Game Studio', note: 'Design, build, and actually play the finished game', slug: 'board-game-studio' },
    { name: 'The Hard Thing Challenge', note: 'Pick one hard thing and cross the finish line', slug: 'hard-thing-challenge' },
    { name: 'Savings Goal Tracker', note: 'One real goal, stuck with to the end', slug: 'savings-goal-tracker' },
  ],
  guideName: 'Kitchen Math & Meal Planning',
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
  color: C_MUTED,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const h1 = { fontFamily: FONT_DISPLAY, fontSize: '30px', lineHeight: 1.16, color: C_INK, marginTop: '10px' };

const taglineText = {
  fontSize: '11.5px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  marginTop: '8px',
  fontFamily: FONT_BODY,
};

const sectionLabel = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.13em',
  color: C_MUTED,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const gapNum = { fontFamily: FONT_DISPLAY, fontSize: '22px', lineHeight: 1 };
const gapText = { fontSize: '16px', lineHeight: 1.45, color: C_INK, fontFamily: FONT_BODY };

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

const activityCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: '#FFFFFF',
  border: `1px solid #E4DFCF`,
  borderRadius: '13px',
};
const activityName = { fontSize: '15px', fontWeight: 600, color: C_INK, fontFamily: FONT_BODY };
const activityNote = { fontSize: '13px', color: C_MUTED, marginTop: '2px', lineHeight: 1.4, fontFamily: FONT_BODY };

const giftCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundImage: 'linear-gradient(140deg, #FBF3E2 0%, #F2E2C1 100%)',
  backgroundColor: '#FBF3E2',
  border: '1px solid rgba(181,128,62,0.42)',
  borderRadius: '15px',
};
const giftEyebrow = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.16em',
  color: C_GOLD_DARK,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};
const giftHeadline = { fontFamily: FONT_DISPLAY, fontSize: '23px', color: C_INK, marginTop: '6px' };
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
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '13px 30px',
  borderRadius: '11px',
  fontFamily: FONT_BODY,
};
const giftMicro = { fontSize: '12px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };

const forestCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: '#3A5A40',
  borderRadius: '15px',
};
const forestHeadline = { fontFamily: FONT_DISPLAY, fontSize: '22px', color: '#F7F4EA', lineHeight: 1.2 };
const forestBody = {
  fontSize: '13.5px',
  lineHeight: 1.6,
  color: 'rgba(247,244,234,0.86)',
  marginTop: '8px',
  maxWidth: '400px',
  marginLeft: 'auto',
  marginRight: 'auto',
  fontFamily: FONT_BODY,
};
const forestBtn = {
  display: 'inline-block',
  backgroundColor: '#F7F4EA',
  color: '#2D3A2E',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '13px 30px',
  borderRadius: '11px',
  fontFamily: FONT_BODY,
};

const p = { fontSize: '15px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const signature = { fontFamily: FONT_SCRIPT, fontSize: '42px', fontWeight: 600, color: C_TERRA, lineHeight: 1.15, marginTop: '2px' };
const legal = { fontSize: '12px', lineHeight: 1.6, color: C_MUTED, margin: '16px 0 0', fontFamily: FONT_BODY };
const credit = { textAlign: 'center' as const, fontSize: '12px', color: C_MUTED, paddingTop: '10px', fontFamily: FONT_BODY };
