import { Body, Container, Head, Html, Img, Link, Preview, Text } from '@react-email/components';

type Source = 'gift' | 'odyssey' | 'charter' | 'coop' | 'school' | 'comp';

interface Props {
  firstName?: string;
  /** ISO date the grant ends. */
  endsAt: string;
  source: Source;
  /** One-tap sign-in link that lands on /choose-plan. */
  signInUrl: string;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/**
 * "Your access ends on X" for a prepaid grant, sent once ~14 days before the
 * end by runGrantLifecycle (lib/access-grants.ts). Nothing is charged, so this
 * is the only nudge a grantee gets toward their own membership.
 */
export default function GrantEnding({ firstName, endsAt, source, signInUrl }: Props) {
  const name = firstName?.trim() || 'there';
  const endDate = new Date(endsAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const funded = source === 'odyssey' || source === 'charter';

  return (
    <Html>
      <Head />
      <Preview>Your access ends {endDate}. Nothing will be charged.</Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={card}>
            <tbody>
              <tr>
                <td style={band}>
                  <Img src={LOGO_CREAM} alt="Anywhere Learning" width="38" style={{ display: 'block', width: '38px', height: 'auto' }} />
                  <div style={h1}>Hi {name}, your membership ends on {endDate}.</div>
                  <div style={subline}>Nothing will be charged. This is just a heads-up.</div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    {source === 'gift'
                      ? 'The gift membership your family has been using runs out soon.'
                      : 'Your prepaid membership runs out soon.'}{' '}
                    Until {endDate} everything stays open, so it&apos;s a good moment to fit in one more
                    activity your kids have been asking about.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    {funded
                      ? 'If you want to keep going, you can order it again with your education funds, or become a member directly.'
                      : 'If your family wants to keep going, you can become a member and pick up right where you left off.'}{' '}
                    Your kids&apos; trail and learning record stay saved on your account either way.
                  </Text>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0', textAlign: 'center' as const }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                    <tbody>
                      <tr>
                        <td style={btnCell}>
                          <Link href={signInUrl} style={btn}>Keep our adventure going &rarr;</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={micro}>Signs you straight in and shows the plans.</div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>xo,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                </td>
              </tr>
            </tbody>
          </table>
        </Container>
      </Body>
    </Html>
  );
}

GrantEnding.PreviewProps = {
  firstName: 'Sarah',
  endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  source: 'gift',
  signInUrl: 'https://anywherelearning.co/sign-in',
} satisfies Props;

/* ── "Trail map" tokens (match MembershipRenewal, Oct 2026) ── */
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";

const C_CARD = '#FAF9F6';
const C_INK = '#2F3A2E';
const C_BODY = '#4B5563';
const C_MUTED = '#8A8578';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';

const body = { backgroundColor: '#EBE9E2', fontFamily: FONT_BODY, margin: 0, padding: '32px 12px' };
const card = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CARD, border: `1px solid ${C_RULE}`, borderRadius: '18px', overflow: 'hidden' as const };
const band = { backgroundColor: C_FOREST, padding: '26px 36px 28px', borderTopLeftRadius: '17px', borderTopRightRadius: '17px' };
const h1 = { fontFamily: FONT_DISPLAY, fontSize: '28px', lineHeight: 1.2, color: C_CARD, margin: '20px 0 8px' };
const subline = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED };
