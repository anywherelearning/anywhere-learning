import { Body, Container, Head, Html, Img, Link, Preview, Text } from '@react-email/components';

interface Props {
  firstName?: string;
  /** Download links in display order (already signed). */
  files: { label: string; url: string }[];
  /** True when the course bonus (Directions Challenge) is included. */
  bonus: boolean;
  /** Trial link that applies the owner offer. */
  offerUrl: string;
  /** e.g. "Sunday, Oct 25", when the 20% ends. */
  offerEndsLabel: string;
}

// Absolute, always-live host for email assets (never localhost).
const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

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
      <Head />
      <Preview>Your Future-Ready Skills Map is ready to download. Start with page 5.</Preview>
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
                          <span style={badge}>YOUR SKILLS MAP</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>Here&apos;s your Skills Map, {name}.</div>
                  <div style={subline}>Thank you. Your download links are right below.</div>
                </td>
              </tr>

              {/* ── Downloads ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    Pick the version that fits how you&apos;ll use it: the phone version to read on
                    the go, or a print version for the kitchen table.
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '18px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={aside}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '20px 22px 22px' }}>
                          <div style={{ ...label, color: C_FOREST }}>YOUR DOWNLOADS</div>
                          <FileList files={mapFiles} />
                          {bonus && bonusFiles.length > 0 && (
                            <>
                              <div style={{ ...label, color: C_TERRA, marginTop: '20px' }}>YOUR COURSE BONUS</div>
                              <div style={{ fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '6px', fontFamily: FONT_BODY }}>
                                The full Directions Challenge guide, the one from Day 3.
                              </div>
                              <FileList files={bonusFiles} />
                            </>
                          )}
                          <div style={micro}>These links are yours to keep. Save this email to download again anytime.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Start here: a real three-step sequence ── */}
              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <div style={{ ...label, color: C_MUTED, marginBottom: '14px' }}>START HERE, 10 MINUTES</div>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '46px', verticalAlign: 'top' }}>
                          <div style={{ ...stepDot, backgroundColor: C_TERRA }}>1</div>
                        </td>
                        <td style={{ ...stepCell, borderLeft: `2px dashed ${C_RULE}` }}>
                          <div style={{ ...label, color: C_TERRA }}>TURN TO PAGE 5</div>
                          <div style={stepBody}>The whole map on one page.</div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '46px', verticalAlign: 'top' }}>
                          <div style={{ ...stepDot, backgroundColor: C_FOREST }}>2</div>
                        </td>
                        <td style={{ ...stepCell, borderLeft: `2px dashed ${C_RULE}` }}>
                          <div style={{ ...label, color: C_FOREST }}>CIRCLE TWO OR THREE AREAS</div>
                          <div style={stepBody}>
                            Read down your kid&apos;s column and circle the two or three areas that
                            feel most important right now. Not twelve. Two or three.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '46px', verticalAlign: 'top' }}>
                          <div style={{ ...stepDot, backgroundColor: C_GOLD }}>3</div>
                        </td>
                        <td style={{ ...stepCell, padding: '3px 0 4px 16px', borderLeft: '2px solid transparent' }}>
                          <div style={{ ...label, color: C_BROWN }}>PICK ONE IDEA FOR THIS WEEK</div>
                          <div style={stepBody}>Choose one hands-on idea from those pages to try this week.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── Owner offer ── */}
              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={aside}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '20px 22px 22px', textAlign: 'center' as const }}>
                          <div style={{ ...label, color: C_FOREST }}>ONE MORE THING</div>
                          <div style={{ fontSize: '15px', lineHeight: 1.6, color: C_BODY, marginTop: '8px', fontFamily: FONT_BODY }}>
                            Every area in the map has activities waiting in the Anywhere Learning
                            library, 120+ guides with your job and your kid&apos;s job at every step.
                            As a Skills Map owner, you get{' '}
                            <strong style={{ color: C_INK }}>20% off your first year</strong> until{' '}
                            {offerEndsLabel}. Start with 7 days free; nothing is charged today.
                          </div>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '18px auto 0' }}>
                            <tbody>
                              <tr>
                                <td style={btnCell}>
                                  <Link href={offerUrl} style={btn}>Try the library free for 7 days</Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={micro}>Your 20% is applied automatically. Yearly plan only.</div>
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
                    Questions, or a download that won&apos;t open? Hit reply. It comes straight to me.
                  </Text>
                  <Text style={{ ...p, margin: '18px 0 6px' }}>xo,</Text>
                  <Img src={`${SITE}/email-fn-amelie.png`} alt="Amelie" width="130" style={{ display: 'block', width: '130px', height: 'auto' }} />
                </td>
              </tr>

              {/* ── Footer ── */}
              <tr>
                <td style={{ padding: '28px 36px 30px', textAlign: 'center' as const }}>
                  <div style={rule} />
                  <div style={motto}>Meaningful Learning, Wherever You Are</div>
                  <Text style={legal}>
                    You&apos;re receiving this because you bought The Future-Ready Skills Map at
                    anywherelearning.co. The guide is for your family&apos;s use; please don&apos;t share
                    or resell it.
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

function FileList({ files }: { files: { label: string; url: string }[] }) {
  return (
    <div style={{ marginTop: '6px' }}>
      {files.map((f) => (
        <div key={f.url} style={{ marginTop: '8px' }}>
          <Link href={f.url} style={filePill}>&darr; {f.label}</Link>
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
const C_TERRA = '#C4836A';
const C_GOLD = '#D4A373';
const C_BROWN = '#8B7355';
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
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 30px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const stepDot = { width: '34px', height: '34px', borderRadius: '50%', color: '#FFFFFF', fontFamily: FONT_DISPLAY, fontSize: '17px', lineHeight: '34px', textAlign: 'center' as const };
const stepCell = { verticalAlign: 'top' as const, padding: '3px 0 20px 16px' };
const stepBody = { fontSize: '15.5px', lineHeight: 1.6, color: C_BODY, marginTop: '5px', fontFamily: FONT_BODY };
const aside = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '12px' };
const filePill = {
  display: 'inline-block',
  backgroundColor: C_CARD,
  border: `1px solid ${C_RULE}`,
  borderRadius: '999px',
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 600,
  color: C_INK,
  textDecoration: 'none',
  fontFamily: FONT_BODY,
};
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED, marginBottom: '8px' };
const legal = { fontSize: '12px', lineHeight: 1.7, color: '#A09A8C', margin: 0, fontFamily: FONT_BODY };
