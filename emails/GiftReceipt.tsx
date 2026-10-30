import { Body, Container, Head, Html, Img, Link, Preview, Text } from '@react-email/components';

interface Props {
  firstName?: string;
  /** Parent's first name, as typed on /gift. */
  recipientName: string;
  recipientEmail: string;
  /** ISO moment a scheduled gift is delivered. Absent = delivered now. */
  deliverAt?: string;
  /** Printable gift card page (/gift/card/[id]). */
  cardUrl: string;
  /** "$99" */
  amountLabel: string;
}

const SITE = 'https://anywherelearning.co';
const LOGO_CREAM = `${SITE}/email-logo-cream.png`;

/**
 * Receipt for the person who bought a gift membership on /gift. Sent by the
 * Stripe webhook (handleGiftPurchase). Main job: when it arrives, and the
 * printable card to wrap or tuck in a birthday card.
 */
export default function GiftReceipt({ firstName, recipientName, recipientEmail, deliverAt, cardUrl, amountLabel }: Props) {
  const name = firstName?.trim() || 'there';
  const when = deliverAt
    ? new Date(deliverAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' })
    : null;

  return (
    <Html>
      <Head />
      <Preview>
        {when ? `Your gift for ${recipientName} arrives ${when}.` : `Your gift is on its way to ${recipientName}.`} Here is the printable card.
      </Preview>
      <Body style={body}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={card}>
            <tbody>
              <tr>
                <td style={band}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'middle' }}>
                          <Img src={LOGO_CREAM} alt="Anywhere Learning" width="38" style={{ display: 'block', width: '38px', height: 'auto' }} />
                        </td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'right' as const }}>
                          <span style={badge}>{when ? 'GIFT SCHEDULED' : 'GIFT SENT'}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={h1}>Thank you, {name}. What a lovely gift.</div>
                  <div style={subline}>
                    {when
                      ? `${recipientName}'s family gets their year of adventures on ${when}.`
                      : `${recipientName}'s family has their year of adventures. The email is in their inbox now.`}
                  </div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px 36px 0' }}>
                  <Text style={p}>
                    {when
                      ? `On the morning of ${when} we'll email ${recipientEmail} with your name, your note, and a one-tap button into the library. Their 12 months start that day.`
                      : `We just emailed ${recipientEmail} with your name, your note, and a one-tap button into the library. Their 12 months start today.`}{' '}
                    Nothing renews and they never need a card.
                  </Text>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={cardBox}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '22px 24px', textAlign: 'center' as const }}>
                          <div style={{ ...label, color: C_TERRA }}>SOMETHING TO WRAP</div>
                          <div style={h2}>Your printable gift card</div>
                          <div style={{ ...p, fontSize: '15px', marginTop: '6px' }}>
                            Print it, tuck it in a card, or text a photo of it. It shows your name, your note and
                            when the gift opens.
                          </div>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '16px auto 0' }}>
                            <tbody>
                              <tr>
                                <td style={btnCell}>
                                  <Link href={cardUrl} style={btn}>Open the gift card &rarr;</Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '24px 36px 0' }}>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={summaryCard}>
                    <tbody>
                      <tr>
                        <td style={summaryCell}>
                          <div style={{ ...label, color: C_MUTED }}>GIFT</div>
                          <div style={summaryLine}>12 months of Anywhere Learning for {recipientName}&apos;s family</div>
                        </td>
                        <td style={{ ...summaryCell, textAlign: 'right' as const, whiteSpace: 'nowrap' as const }}>
                          <div style={amount}>{amountLabel}</div>
                          <div style={small}>paid once</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={micro}>
                    Stripe sends your payment receipt separately. Wrong email address or date? Write to{' '}
                    <Link href="mailto:info@anywherelearning.co" style={microLink}>info@anywherelearning.co</Link> and I&apos;ll fix it.
                  </div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '26px 36px 0' }}>
                  <Text style={{ ...p, margin: '0 0 6px' }}>With gratitude,</Text>
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

GiftReceipt.PreviewProps = {
  firstName: 'Jo',
  recipientName: 'Sarah',
  recipientEmail: 'sarah@example.com',
  deliverAt: '2026-12-25T13:00:00Z',
  cardUrl: 'https://anywherelearning.co/gift/card/example',
  amountLabel: '$99',
} satisfies Props;

/* ── "Trail map" tokens (match MembershipWelcome, Oct 2026) ── */
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
const C_SAGE = '#EEF2EC';

const body = { backgroundColor: '#EBE9E2', fontFamily: FONT_BODY, margin: 0, padding: '32px 12px' };
const card = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_CARD, border: `1px solid ${C_RULE}`, borderRadius: '18px', overflow: 'hidden' as const };
const band = { backgroundColor: C_FOREST, padding: '26px 36px 28px', borderTopLeftRadius: '17px', borderTopRightRadius: '17px' };
const badge = { display: 'inline-block', backgroundColor: '#E8C99A', color: C_INK, fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', padding: '7px 13px', borderRadius: '999px' };
const h1 = { fontFamily: FONT_DISPLAY, fontSize: '30px', lineHeight: 1.18, color: C_CARD, margin: '20px 0 8px' };
const h2 = { fontFamily: FONT_DISPLAY, fontSize: '24px', lineHeight: 1.25, color: C_INK, marginTop: '6px' };
const subline = { fontSize: '15px', lineHeight: 1.5, color: '#DFE8DC', fontFamily: FONT_BODY };
const p = { fontSize: '16px', lineHeight: 1.65, color: C_BODY, margin: 0, fontFamily: FONT_BODY };
const label = { fontFamily: FONT_MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em' };
const btnCell = { backgroundColor: C_INK, borderRadius: '12px', textAlign: 'center' as const };
const btn = { display: 'inline-block', padding: '15px 30px', fontSize: '16px', fontWeight: 700, color: C_CARD, textDecoration: 'none', lineHeight: 1, fontFamily: FONT_BODY };
const cardBox = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: '#FBF3E8', border: `1.5px dashed ${C_GOLD}`, borderRadius: '14px' };
const summaryCard = { width: '100%', borderCollapse: 'separate' as const, backgroundColor: C_SAGE, borderRadius: '14px' };
const summaryCell = { padding: '18px 20px', verticalAlign: 'middle' as const };
const summaryLine = { fontSize: '15px', lineHeight: 1.5, color: C_INK, marginTop: '6px', fontFamily: FONT_BODY };
const amount = { fontFamily: FONT_DISPLAY, fontSize: '28px', lineHeight: 1, color: C_INK };
const small = { fontSize: '12.5px', color: C_MUTED, marginTop: '4px', fontFamily: FONT_BODY };
const micro = { fontSize: '12.5px', lineHeight: 1.6, color: C_MUTED, marginTop: '12px', fontFamily: FONT_BODY };
const microLink = { color: C_MUTED, textDecoration: 'underline' };
const rule = { height: '1px', lineHeight: '1px', fontSize: 0, backgroundColor: '#E3E0D6', marginBottom: '18px' };
const motto = { fontFamily: FONT_DISPLAY, fontStyle: 'italic' as const, fontSize: '14px', color: C_MUTED };
