import { Body, Container, Head, Html, Img, Link, Preview, Text } from '@react-email/components';

interface Props {
  firstName?: string;
  /** Download links in display order (already signed). */
  files: { label: string; url: string }[];
  /** True when the course bonus (Directions Challenge) is included. */
  bonus: boolean;
  /** Trial link that applies the owner offer. */
  offerUrl: string;
  /** e.g. "Sunday, Oct 25" — when the 20% ends. */
  offerEndsLabel: string;
}

const EMAIL_LOGO = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/email-assets/email-logo-mark.png';

/**
 * Sent the moment a Skills Map purchase completes. Job one: the files.
 * Job two: tell them where to start (page 5, circle 2 or 3 areas). Job three:
 * the 72-hour owner offer, framed as the next step, not a hard sell.
 */
export default function SkillsMapDelivery({ firstName, files, bonus, offerUrl, offerEndsLabel }: Props) {
  const name = firstName?.trim() || 'there';
  const mapFiles = files.filter((f) => !f.label.startsWith('Directions'));
  const bonusFiles = files.filter((f) => f.label.startsWith('Directions'));

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@600;700&display=swap');
        `}</style>
      </Head>
      <Preview>Your Future-Ready Skills Map is ready to download. Start with page 5.</Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={envelope}>
            <tbody>
              <tr>
                <td style={{ padding: '38px 48px 26px', textAlign: 'center' as const }}>
                  <Img src={EMAIL_LOGO} alt="Anywhere Learning" width="46" height="46" style={{ display: 'inline-block', width: '46px', height: '46px' }} />
                  <div style={brandName}>
                    anywhere <span style={{ fontStyle: 'italic', color: C_FOREST }}>learning</span>
                  </div>
                </td>
              </tr>
              <tr><td style={{ padding: '0 48px' }}><div style={fadeDivider} /></td></tr>

              <tr>
                <td style={{ padding: '34px 48px 0' }}>
                  <div style={eyebrow}><span style={eyebrowRule} />Your download</div>
                  <div style={h1}>
                    Here&apos;s your <span style={{ fontStyle: 'italic', color: C_FOREST }}>Skills Map</span>, {name}.
                  </div>
                  <Text style={p}>
                    Thank you. Pick the version that fits how you&apos;ll use it: the phone version
                    to read on the go, or a print version for the kitchen table.
                  </Text>
                  <FileList files={mapFiles} />
                  {bonus && bonusFiles.length > 0 && (
                    <>
                      <Text style={{ ...p, margin: '22px 0 0' }}>
                        <strong style={{ color: C_INK }}>Your course bonus:</strong> the full
                        Directions Challenge guide, the one from Day 3.
                      </Text>
                      <FileList files={bonusFiles} />
                    </>
                  )}
                  <Text style={small}>These links are yours to keep. Save this email to download again anytime.</Text>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 48px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={sageCard}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '22px 26px 24px' }}>
                          <Text style={cardLabel}>Start here, 10 minutes</Text>
                          <Text style={{ ...p, margin: '8px 0 0' }}>
                            Turn to <strong style={{ color: C_INK }}>page 5</strong>, the whole map on one
                            page. Read down your kid&apos;s column and circle the two or three areas that
                            feel most important right now. Not twelve. Two or three. Then pick one
                            hands-on idea from those pages to try this week.
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 48px 0' }}>
                  <Text style={{ ...p, margin: 0 }}>
                    <strong style={{ color: C_INK }}>One more thing.</strong> Every area in the map has
                    activities waiting in the Anywhere Learning library, 120+ guides with your job and
                    your kid&apos;s job at every step. As a Skills Map owner, you get{' '}
                    <strong style={{ color: C_INK }}>20% off your first year</strong> until{' '}
                    {offerEndsLabel}. Start with 7 days free; nothing is charged today.
                  </Text>
                  <div style={{ marginTop: '18px' }}>
                    <Link href={offerUrl} style={button}>Try the library free for 7 days</Link>
                  </div>
                  <Text style={small}>Your 20% is applied automatically. Yearly plan only.</Text>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '30px 48px 0' }}>
                  <Text style={{ ...p, margin: 0 }}>
                    Questions, or a download that won&apos;t open? Hit reply. It comes straight to me.
                  </Text>
                  <div style={{ fontSize: '15.5px', color: C_BODY, marginTop: '16px' }}>xo,</div>
                  <div style={signature}>Amelie</div>
                  <div style={{ fontSize: '13px', color: C_MUTED, marginTop: '4px' }}>Founder · Anywhere Learning</div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 48px 32px' }}>
                  <div style={fadeDivider} />
                  <Text style={legal}>
                    You&apos;re receiving this because you bought The Future-Ready Skills Map at
                    anywherelearning.co. The guide is for your family&apos;s use; please don&apos;t share
                    or resell it.
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={credit}>Anywhere Learning · <em style={{ fontStyle: 'italic' }}>Built by Amelie</em> · Made in Nelson, BC</div>
        </Container>
      </Body>
    </Html>
  );
}

function FileList({ files }: { files: { label: string; url: string }[] }) {
  return (
    <div style={{ marginTop: '14px' }}>
      {files.map((f) => (
        <div key={f.url} style={{ marginTop: '8px' }}>
          <Link href={f.url} style={filePill}>↓ {f.label}</Link>
        </div>
      ))}
    </div>
  );
}

SkillsMapDelivery.PreviewProps = {
  firstName: 'Sarah',
  bonus: true,
  offerUrl: 'https://anywherelearning.co/map-offer',
  offerEndsLabel: 'Sunday, Oct 25',
  files: [
    { label: 'Skills Map, phone version', url: '#' },
    { label: 'Skills Map, print in color', url: '#' },
    { label: 'Skills Map, print in black & white', url: '#' },
    { label: 'Directions Challenge, phone version', url: '#' },
  ],
} satisfies Props;

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

const body = { backgroundColor: '#E9E5DC', fontFamily: FONT_BODY, margin: 0, padding: '24px 12px' };
const envelope = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CREAM, border: `1px solid ${C_RULE}`, borderRadius: '18px' };
const brandName = { fontFamily: FONT_DISPLAY, fontSize: '25px', color: C_INK, marginTop: '10px' };
const fadeDivider = { height: '1px', backgroundColor: C_RULE, backgroundImage: `linear-gradient(to right, rgba(216,212,197,0), ${C_RULE}, rgba(216,212,197,0))` };
const eyebrow = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: C_MUTED, textTransform: 'uppercase' as const, fontFamily: FONT_BODY };
const eyebrowRule = { display: 'inline-block', width: '26px', height: '1px', backgroundColor: C_FOREST, verticalAlign: '3px', marginRight: '10px' };
const h1 = { fontFamily: FONT_DISPLAY, fontSize: '31px', lineHeight: 1.22, color: C_INK, marginTop: '12px' };
const p = { fontSize: '15.5px', lineHeight: 1.68, color: C_BODY, margin: '18px 0 0', fontFamily: FONT_BODY };
const small = { fontSize: '12.5px', color: C_MUTED, margin: '12px 0 0', fontFamily: FONT_BODY };
const sageCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE_SOFT, border: `1px solid ${C_SAGE_BORDER}`, borderRadius: '14px' };
const cardLabel = { fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.22em', color: C_FOREST_DARK, textTransform: 'uppercase' as const, margin: 0, fontFamily: FONT_BODY };
const filePill = { display: 'inline-block', backgroundColor: '#FFFFFF', border: `1px solid ${C_SAGE_BORDER}`, borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: 600, color: C_FOREST_DARK, textDecoration: 'none', fontFamily: FONT_BODY };
const button = { display: 'inline-block', backgroundColor: C_FOREST, color: '#FAF8F3', borderRadius: '12px', padding: '14px 24px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', fontFamily: FONT_BODY };
const signature = { fontFamily: FONT_SCRIPT, fontSize: '30px', color: C_FOREST_DARK, lineHeight: 1.2 };
const legal = { fontSize: '12px', lineHeight: 1.6, color: C_MUTED, margin: '16px 0 0', fontFamily: FONT_BODY };
const credit = { textAlign: 'center' as const, fontSize: '12px', color: C_MUTED, marginTop: '18px', fontFamily: FONT_BODY };
