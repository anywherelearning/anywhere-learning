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
import type { MidpointGuide, MidpointVariant } from '@/lib/trial-midpoint';

interface Props {
  /** The recipient's first name (or undefined if we don't know it). */
  firstName?: string;
  variant: MidpointVariant;
  /** The guide this email is about: the one they did, browsed, or their first stop. */
  guide: MidpointGuide;
  /** 'doing' only: the suggested next guide. */
  next?: MidpointGuide;
  /** "Kirin (6)" / "Elijah and Indie" / "". */
  kids: string;
  /** ISO date the trial converts. */
  trialEndDate: string;
  /** One-tap sign-in link that lands on the main guide in the reader. */
  guideUrl: string;
  /** 'doing' only: one-tap sign-in link to the next guide. */
  nextUrl?: string;
}

const SITE = 'https://anywherelearning.co';
const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';

export function midpointSubject(variant: MidpointVariant, firstName?: string): string {
  const name = firstName ? `, ${firstName}` : '';
  if (variant === 'doing') return `One down${name}. Here's a good next one`;
  if (variant === 'browsing') return `Halfway through your trial${name}. Let's get one done this week`;
  return `Your first activity is already picked${name}`;
}

/**
 * Day-7 trial check-in, sent by the daily trial-midpoint cron halfway through
 * the 14-day trial. Fills the gap between the welcome email (day 0) and the
 * trial-ending heads-up (day 11). Three versions, one guide each, decided by
 * lib/trial-midpoint.ts from what they've actually done in the member zone.
 * Not a sales email: the goal is one activity done together this week.
 */
export default function TrialMidpoint({
  firstName,
  variant,
  guide,
  next,
  kids,
  trialEndDate,
  guideUrl,
  nextUrl,
}: Props) {
  // Headlines end ", Sarah." when we know the name, and just "." when we don't.
  const nameTail = firstName?.trim() ? `, ${firstName.trim()}.` : '.';
  const forKids = kids ? ` for ${kids}` : '';
  const ends = new Date(trialEndDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const preview =
    variant === 'doing'
      ? `You already did ${guide.name}. Here's what's next on your map.`
      : variant === 'browsing'
        ? `${guide.name} caught your eye. Here's how to actually make it happen.`
        : `I picked one for you: ${guide.name}.`;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
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
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0 48px' }}>
                  <div style={fadeDivider} />
                </td>
              </tr>

              {/* ── 2 · The note ── */}
              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={eyebrow}>
                    <span style={eyebrowRule} />
                    Halfway through your trial
                  </div>

                  {variant === 'doing' && (
                    <>
                      <div style={h1}>
                        You already did{' '}
                        <span style={{ fontStyle: 'italic', color: C_FOREST }}>one</span>
                        {nameTail}
                      </div>
                      <Text style={p}>
                        Your map says you finished <strong style={strong}>{guide.name}</strong>{' '}
                        together. That first one is the hardest to get to, honestly. Not because
                        it&apos;s difficult, but because life fills the week. You made the time.
                      </Text>
                      {next && (
                        <Text style={{ ...p, margin: '14px 0 0' }}>
                          If you&apos;ve got a little time this week, here&apos;s a good next
                          one{forKids}. It builds on what you just did.
                        </Text>
                      )}
                    </>
                  )}

                  {variant === 'browsing' && (
                    <>
                      <div style={h1}>
                        Let&apos;s get{' '}
                        <span style={{ fontStyle: 'italic', color: C_FOREST }}>one</span> done
                        this week{nameTail}
                      </div>
                      <Text style={p}>
                        Looks like <strong style={strong}>{guide.name}</strong> caught your eye. Good
                        pick. Reading the guides is the easy part though. Here&apos;s how to
                        actually get the first one done together:
                      </Text>
                    </>
                  )}

                  {variant === 'not-started' && (
                    <>
                      <div style={h1}>
                        I picked one{' '}
                        <span style={{ fontStyle: 'italic', color: C_FOREST }}>for you</span>
                        {nameTail}
                      </div>
                      <Text style={p}>
                        A week goes fast. If you haven&apos;t opened anything yet, that&apos;s
                        completely normal, and you haven&apos;t missed anything. Your map already
                        has a first stop waiting{forKids}, so there&apos;s nothing to choose.
                        Just open it.
                      </Text>
                    </>
                  )}
                </td>
              </tr>

              {/* ── 3 · Guide card ── */}
              <tr>
                <td style={{ padding: '26px 48px 0' }}>
                  <GuideCard
                    guide={variant === 'doing' && next ? next : guide}
                    url={variant === 'doing' && next && nextUrl ? nextUrl : guideUrl}
                    label={
                      variant === 'doing' ? 'Next on your map' : variant === 'browsing' ? 'The one that caught your eye' : 'Your first stop'
                    }
                  />
                </td>
              </tr>

              {/* ── 4 · How to make it happen (browsing + not started) ── */}
              {variant !== 'doing' && (
                <tr>
                  <td style={{ padding: '28px 48px 0' }}>
                    <div style={h2}>How to make it happen</div>
                    <Step n="1" title="Put it on the calendar">
                      {guide.timeRange === 'Multiple days'
                        ? 'This one runs over a few sessions. Book the first one now, before the week fills up.'
                        : `This one takes ${guide.timeRange?.toLowerCase() ?? 'an afternoon'}. Pick the slot now, before the week fills up.`}{' '}
                      A Saturday morning works for a lot of families.
                    </Step>
                    <Step n="2" title="Read it once yourself">
                      Ten minutes the night before, on your phone. You&apos;ll know what to grab and
                      what to say, so you&apos;re not figuring it out with an audience.
                    </Step>
                    <Step n="3" title="Start at Explore" last>
                      Every guide has three levels. Explore is the gentle first try. It
                      doesn&apos;t have to go perfectly, it just has to happen. Then tap{' '}
                      <strong style={strong}>We did it!</strong> so it lands on your map.
                    </Step>
                  </td>
                </tr>
              )}

              {/* ── 5 · Trial line + sign-off ── */}
              <tr>
                <td style={{ padding: '30px 48px 0' }}>
                  <Text style={{ ...p, margin: 0 }}>
                    Your free trial runs until {ends}, and every guide is open to you until then.
                    I&apos;ll email you 3 days before anything changes, no surprises.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    {variant === 'doing'
                      ? "If you feel like it, hit reply and tell me how it went. I read every one, and it genuinely shapes what I build next."
                      : "Stuck on something, or not sure which one fits your kids? Hit reply. This comes straight to my inbox and I read every one."}
                  </Text>
                  <div style={{ fontSize: '15.5px', color: C_BODY, marginTop: '16px' }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '4px' }}>
                    Founder · Anywhere Learning
                  </div>
                </td>
              </tr>

              {/* ── 6 · Fine print ── */}
              <tr>
                <td style={{ padding: '28px 48px 32px' }}>
                  <div style={fadeDivider} />
                  <Text style={legal}>
                    You&apos;re receiving this because you&apos;re on a free trial of Anywhere
                    Learning. Manage or cancel anytime from{' '}
                    <Link href={`${SITE}/account/settings`} style={{ color: C_MUTED }}>
                      your account
                    </Link>
                    .
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

function GuideCard({ guide, url, label }: { guide: MidpointGuide; url: string; label: string }) {
  const meta = [guide.timeRange, guide.ageRange].filter(Boolean).join(' · ');
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
      <tbody>
        <tr>
          <td style={{ padding: '20px 22px', width: '96px', verticalAlign: 'top' as const }}>
            <Img
              src={`${SITE}/products/${guide.slug}.jpg`}
              alt={guide.name}
              width="96"
              style={{ display: 'block', width: '96px', height: 'auto', borderRadius: '8px' }}
            />
          </td>
          <td style={{ padding: '20px 22px 20px 0', verticalAlign: 'top' as const }}>
            <div style={cardLabel}>{label}</div>
            <div style={cardTitle}>{guide.name}</div>
            {meta && <div style={cardMeta}>{meta}</div>}
            <Text style={cardBlurb}>{guide.blurb}</Text>
            <Link href={url} style={btn}>
              Open the guide &rarr;
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Step({
  n,
  title,
  children,
  last,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{ width: '100%', borderCollapse: 'collapse' as const, marginTop: '14px' }}
    >
      <tbody>
        <tr>
          <td style={{ width: '34px', verticalAlign: 'top' as const }}>
            <div style={stepNum}>{n}</div>
          </td>
          <td style={{ verticalAlign: 'top' as const, paddingBottom: last ? 0 : '4px' }}>
            <div style={stepTitle}>{title}</div>
            <Text style={stepBody}>{children}</Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// Preview props for `npm run email:preview`.
TrialMidpoint.PreviewProps = {
  firstName: 'Sarah',
  variant: 'browsing',
  guide: {
    slug: 'family-electricity-audit',
    name: 'Family Electricity Audit',
    blurb: 'Turn your home into an energy investigation.',
    timeRange: '3 to 4 hours',
    ageRange: 'Ages 8–14',
  },
  kids: 'Maya (8)',
  trialEndDate: '2026-10-24T19:21:32.000Z',
  guideUrl: `${SITE}/account/view/family-electricity-audit`,
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

const h2 = {
  fontFamily: FONT_DISPLAY,
  fontSize: '22px',
  color: C_INK,
};

const p = {
  fontSize: '15.5px',
  lineHeight: 1.68,
  color: C_BODY,
  margin: '18px 0 0',
  fontFamily: FONT_BODY,
};

const strong = { color: C_INK, fontWeight: 600 };

const sageCard = {
  width: '100%',
  borderCollapse: 'separate' as const,
  backgroundColor: C_SAGE_SOFT,
  border: `1px solid ${C_SAGE_BORDER}`,
  borderRadius: '14px',
};

const cardLabel = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  color: C_FOREST_DARK,
  textTransform: 'uppercase' as const,
  fontFamily: FONT_BODY,
};

const cardTitle = {
  fontFamily: FONT_DISPLAY,
  fontSize: '21px',
  lineHeight: 1.25,
  color: C_INK,
  marginTop: '6px',
};

const cardMeta = { fontSize: '12.5px', color: C_MUTED, marginTop: '4px', fontFamily: FONT_BODY };

const cardBlurb = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: C_BODY,
  margin: '10px 0 14px',
  fontFamily: FONT_BODY,
};

const btn = {
  display: 'inline-block',
  backgroundColor: C_FOREST,
  color: '#ffffff',
  borderRadius: '999px',
  padding: '11px 20px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  fontFamily: FONT_BODY,
};

const stepNum = {
  width: '24px',
  height: '24px',
  lineHeight: '24px',
  borderRadius: '999px',
  backgroundColor: C_SAGE_SOFT,
  border: `1px solid ${C_SAGE_BORDER}`,
  color: C_FOREST_DARK,
  fontSize: '12px',
  fontWeight: 700,
  textAlign: 'center' as const,
  fontFamily: FONT_BODY,
};

const stepTitle = { fontSize: '15px', fontWeight: 600, color: C_INK, fontFamily: FONT_BODY };

const stepBody = {
  fontSize: '14.5px',
  lineHeight: 1.6,
  color: C_BODY,
  margin: '4px 0 0',
  fontFamily: FONT_BODY,
};

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
