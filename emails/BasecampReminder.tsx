import { Body, Container, Head, Html, Img, Link, Preview, Text } from '@react-email/components';

interface Props {
  firstName?: string;
  /** 'Thursday, December 3' */
  dayLabel: string;
  /** '8:00 PM ET' */
  timeLabel: string;
  /** This month's skill, e.g. 'Making it by hand'. */
  topic: string;
  zoomUrl: string;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;
const PAGE = `${SITE}/account/this-month#basecamp`;

/**
 * "Basecamp is tomorrow", sent to every member the morning before each
 * session by runBasecampReminders (lib/basecamp-reminders.ts).
 */
export default function BasecampReminder({ firstName, dayLabel, timeLabel, topic, zoomUrl }: Props) {
  const name = firstName?.trim() || 'there';

  return (
    <Html>
      <Head />
      <Preview>{`Tomorrow at ${timeLabel}: Basecamp, live on Zoom. ${topic}.`}</Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={card}>
            <tbody>
              <tr>
                <td style={band}>
                  <Img src={LOGO_CREAM} alt="Anywhere Learning" width="38" style={{ display: 'block', width: '38px', height: 'auto' }} />
                  <div style={eyebrow}>Live with Amelie · Members only</div>
                  <div style={h1}>Basecamp is tomorrow</div>
                  <div style={subline}>{dayLabel} · {timeLabel} · 40 minutes on Zoom</div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>Hi {name},</Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Tomorrow evening we meet at Basecamp, and I&apos;d love to see you there. Come as you are, camera
                    on or off. Nobody has to talk unless they want to.
                  </Text>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '22px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={steps}>
                    <tbody>
                      {[
                        ['Welcome', 'A quick hello, and your name and where you are joining from, out loud or in the chat.'],
                        ["This month's trail", `${topic}: how to start this month's activities in ten minutes.`],
                        ['Ask the teacher', 'Your questions, about anything from motivation to mixed ages.'],
                        ['Campfire show-and-tell', 'Optional, at the end. Kids are welcome to join just for this part.'],
                      ].map(([t, d], i) => (
                        <tr key={t}>
                          <td style={num}>{i + 1}</td>
                          <td style={stepCell}>
                            <strong style={{ color: C_INK }}>{t}.</strong> {d}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0', textAlign: 'center' as const }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                    <tbody>
                      <tr>
                        <td style={btnCell}>
                          <Link href={zoomUrl} style={btn}>Join on Zoom &rarr;</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={micro}>
                    Save this email, the button works tomorrow at {timeLabel}.{' '}
                    <Link href={PAGE} style={{ color: C_FOREST }}>Add it to your calendar or send me a question</Link>.
                  </div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>See you at Basecamp,</Text>
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

BasecampReminder.PreviewProps = {
  firstName: 'Sarah',
  dayLabel: 'Thursday, December 3',
  timeLabel: '8:00 PM ET',
  topic: 'Making it by hand',
  zoomUrl: 'https://zoom.us/j/000',
} satisfies Props;

/* ── "Trail map" tokens (match GrantEnding, Oct 2026) ── */
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";

const C_CARD = '#FAF9F6';
const C_INK = '#2F3A2E';
const C_BODY = '#4B5563';
const C_MUTED = '#8A8578';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_PINE = '#2F5D4A';

const body = { backgroundColor: '#EBE9E2', fontFamily: FONT_BODY, margin: 0, padding: '32px 12px' };
const card = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CARD, border: `1px solid ${C_RULE}`, borderRadius: '18px', overflow: 'hidden' as const };
const band = { backgroundColor: C_PINE, padding: '26px 36px 28px', borderTopLeftRadius: '17px', borderTopRightRadius: '17px' };
const eyebrow = { fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#E8C99A', fontWeight: 700, margin: '20px 0 0', fontFamily: FONT_BODY };
const h1 = { fontFamily: FONT_DISPLAY, fontSize: '30px', lineHeight: 1.15, color: C_CARD, margin: '8px 0 8px' };
const subline = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const steps = { width: '100%', borderCollapse: 'collapse' as const };
const num = { width: '30px', verticalAlign: 'top' as const, padding: '8px 0', fontFamily: FONT_DISPLAY, fontSize: '18px', color: C_FOREST, fontWeight: 700 };
const stepCell = { padding: '8px 0', fontSize: '15px', lineHeight: 1.55, color: C_BODY, fontFamily: FONT_BODY, borderBottom: `1px dashed ${C_RULE}` };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '13px', color: C_MUTED, marginTop: '12px', lineHeight: 1.5, fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED };
