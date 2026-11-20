import { Body, Container, Head, Html, Img, Link, Preview, Text } from '@react-email/components';

interface Props {
  /** 'Thursday, January 7' */
  dayLabel: string;
  /** '8:00 PM ET' */
  timeLabel: string;
  googleUrl: string;
  icsUrl: string;
  /** Set once WORKSHOP_ZOOM_URL exists; otherwise the link comes the day before. */
  zoomUrl?: string | null;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/** "You're in", sent once when someone signs up at /workshop. */
export default function WorkshopConfirmation({ dayLabel, timeLabel, googleUrl, icsUrl, zoomUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{`${dayLabel} at ${timeLabel}, 40 minutes on Zoom. Add it to your calendar.`}</Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={card}>
            <tbody>
              <tr>
                <td style={band}>
                  <Img src={LOGO_CREAM} alt="Anywhere Learning" width="38" style={{ display: 'block', width: '38px', height: 'auto' }} />
                  <div style={eyebrow}>Free live workshop</div>
                  <div style={h1}>You&apos;re in</div>
                  <div style={subline}>{dayLabel} · {timeLabel} · 40 minutes on Zoom</div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>Hi there,</Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Thank you for saving a seat. On {dayLabel}, I&apos;ll walk you through the Budget Challenge, one
                    real task from start to finish, and show you where the math, the writing and the life skills
                    show up along the way.
                  </Text>
                  <Text style={{ ...p, margin: '14px 0 0' }}>
                    Come as you are, camera on or off. Nobody has to talk. If you can&apos;t make it live, the replay
                    comes by email the next day.
                  </Text>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0', textAlign: 'center' as const }}>
                  {zoomUrl ? (
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                      <tbody>
                        <tr>
                          <td style={btnCell}>
                            <Link href={zoomUrl} style={btn}>Join on Zoom &rarr;</Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : null}
                  <div style={micro}>
                    Add it to your calendar:{' '}
                    <Link href={googleUrl} style={{ color: C_FOREST }}>Google</Link>
                    {' · '}
                    <Link href={icsUrl} style={{ color: C_FOREST }}>Apple or Outlook</Link>
                    {zoomUrl
                      ? '. Save this email, the button works on the night.'
                      : '. The Zoom link comes by email the day before, and again an hour before we start.'}
                  </div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>See you there,</Text>
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

WorkshopConfirmation.PreviewProps = {
  dayLabel: 'Thursday, January 7',
  timeLabel: '8:00 PM ET',
  googleUrl: 'https://calendar.google.com',
  icsUrl: `${SITE}/api/workshop/calendar`,
  zoomUrl: null,
} satisfies Props;

/* ── Same "trail map" tokens as BasecampReminder ── */
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";

const C_CARD = '#FAF9F6';
const C_BODY = '#4B5563';
const C_MUTED = '#8A8578';
const C_RULE = '#D8D4C5';
const C_FOREST = '#588157';
const C_PINE = '#2F5D4A';
const C_INK = '#2F3A2E';

const body = { backgroundColor: '#EBE9E2', fontFamily: FONT_BODY, margin: 0, padding: '32px 12px' };
const card = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CARD, border: `1px solid ${C_RULE}`, borderRadius: '18px', overflow: 'hidden' as const };
const band = { backgroundColor: C_PINE, padding: '26px 36px 28px', borderTopLeftRadius: '17px', borderTopRightRadius: '17px' };
const eyebrow = { fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#E8C99A', fontWeight: 700, margin: '20px 0 0', fontFamily: FONT_BODY };
const h1 = { fontFamily: FONT_DISPLAY, fontSize: '30px', lineHeight: 1.15, color: C_CARD, margin: '8px 0 8px' };
const subline = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '16px 34px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const micro = { fontSize: '13.5px', color: C_MUTED, marginTop: '12px', lineHeight: 1.6, fontFamily: FONT_BODY };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED };
