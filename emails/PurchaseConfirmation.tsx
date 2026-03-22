import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface ProductItem {
  name: string;
  imageUrl: string;
}

interface PurchaseConfirmationProps {
  productName: string;
  downloadUrl: string;
  referralCode?: string;
  productImageUrl?: string;
  products?: ProductItem[];
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

PurchaseConfirmation.PreviewProps = {
  productName: 'Spring Outdoor Pack, Summer Outdoor Pack',
  downloadUrl: `${baseUrl}/account/downloads`,
  referralCode: 'REF-AMELIE-7X',
  products: [
    { name: 'Spring Outdoor Pack', imageUrl: '/static/spring-outdoor-pack.jpg' },
    { name: 'Summer Outdoor Pack', imageUrl: '/static/summer-outdoor-pack.jpg' },
  ],
} satisfies PurchaseConfirmationProps;

export default function PurchaseConfirmation({
  productName = 'Spring Outdoor Pack',
  downloadUrl = `${baseUrl}/account/downloads`,
  referralCode = 'REF-AMELIE-7X',
  productImageUrl = '/static/spring-outdoor-pack.jpg',
  products,
}: PurchaseConfirmationProps) {
  // Build product list: use products array if provided, else fall back to single image
  const productList: ProductItem[] = products && products.length > 0
    ? products
    : productImageUrl
      ? [{ name: productName, imageUrl: productImageUrl }]
      : [];
  const isSingle = productList.length === 1;
  const isMultiple = productList.length > 1;

  const logoUrl = (productList[0]?.imageUrl || '').startsWith('/static/')
    ? '/static/logo-icon.png'
    : `${baseUrl}/logo-icon.png`;

  // Smart heading: show product name for single, count for multiple
  const headingText = isSingle
    ? `Your ${productList[0].name} is ready!`
    : `Your ${productList.length} activity packs are ready!`;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        `}</style>
      </Head>
      <Preview>{headingText}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Brand Header ── */}
          <Section style={header}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tr>
                <td style={{ verticalAlign: 'middle', paddingRight: '10px' }}>
                  <Img src={logoUrl} width="36" height="26" alt="" style={{ display: 'block' }} />
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <Text style={brandName}>Anywhere Learning</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Success Banner ── */}
          <Section style={successBanner}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tr>
                <td style={{ textAlign: 'center' as const }}>
                  <div style={checkCircle}>
                    <span style={checkMark}>&#10003;</span>
                  </div>
                </td>
              </tr>
            </table>
            <Heading style={bannerHeading}>{headingText}</Heading>
          </Section>

          {/* ── Product Images ── */}
          {productList.length > 0 && (
            <Section style={imageSection}>
              {isSingle ? (
                <Img src={productList[0].imageUrl} width="560" alt={productList[0].name} style={productImage} />
              ) : (
                <Section style={multiProductGrid}>
                  <Row>
                    {productList.slice(0, 2).map((product, i) => (
                      <Column key={i} style={productThumbCol}>
                        <Img
                          src={product.imageUrl}
                          alt={product.name}
                          style={productThumb}
                        />
                        <Text style={productThumbName}>{product.name}</Text>
                      </Column>
                    ))}
                  </Row>
                  {productList.length > 2 && (
                    <Row>
                      {productList.slice(2, 4).map((product, i) => (
                        <Column key={i} style={productThumbCol}>
                          <Img
                            src={product.imageUrl}
                            alt={product.name}
                            style={productThumb}
                          />
                          <Text style={productThumbName}>{product.name}</Text>
                        </Column>
                      ))}
                      {productList.length === 3 && <Column style={productThumbCol} />}
                    </Row>
                  )}
                  {productList.length > 4 && (
                    <Text style={moreLabel}>+ {productList.length - 4} more in your downloads</Text>
                  )}
                </Section>
              )}
            </Section>
          )}

          {/* ── Main Content ── */}
          <Section style={contentSection}>
            <Text style={text}>Hey there!</Text>

            <Text style={text}>
              Your <strong>{isMultiple ? `${productList.length} activity packs` : productList[0]?.name || productName}</strong> {isSingle ? 'is' : 'are'} ready to download. Open on any device — phone, tablet, or laptop — and pick any activity to start.
            </Text>

            <Section style={buttonContainer}>
              <Link href={downloadUrl} style={button}>
                Download Your Pack
              </Link>
            </Section>

            {/* ── Quick Tips ── */}
            <Section style={tipsContainer}>
              <Row>
                <Column style={tipColumn}>
                  <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 6px' }}>
                    <tr><td style={tipIcon}>
                      {/* Phone/tablet icon - simple rectangle with notch */}
                      <div style={{ width: '12px', height: '16px', border: '2px solid #faf9f6', borderRadius: '3px', margin: '0 auto', position: 'relative' as const }}>
                        <div style={{ width: '6px', height: '2px', backgroundColor: '#faf9f6', borderRadius: '1px', margin: '0 auto', position: 'absolute' as const, bottom: '1px', left: '1px' }} />
                      </div>
                    </td></tr>
                  </table>
                  <Text style={tipLabel}>Open on any device</Text>
                </Column>
                <Column style={tipColumn}>
                  <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 6px' }}>
                    <tr><td style={tipIcon}>
                      {/* Checkmark / ready icon */}
                      <div style={{ fontSize: '16px', color: '#faf9f6', fontWeight: '700' as const, lineHeight: '1' }}>&#10003;</div>
                    </td></tr>
                  </table>
                  <Text style={tipLabel}>Zero prep needed</Text>
                </Column>
                <Column style={tipColumn}>
                  <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 6px' }}>
                    <tr><td style={tipIcon}>
                      {/* Infinity / reuse icon */}
                      <div style={{ fontSize: '18px', color: '#faf9f6', fontWeight: '700' as const, lineHeight: '1' }}>&infin;</div>
                    </td></tr>
                  </table>
                  <Text style={tipLabel}>Reuse year after year</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ── Referral Section ── */}
          {referralCode && (
            <Section style={referralSection}>
              <Heading as="h2" style={referralHeading}>
                Know a family who&apos;d love this?
              </Heading>
              <Text style={referralText}>
                Share your personal code and you&apos;ll <strong>both get 15% off</strong>:
              </Text>
              <Section style={codeBox}>
                <Text style={codeText}>{referralCode}</Text>
              </Section>
              <Text style={referralSmall}>
                Your friend enters this code at checkout. When they do, they save 15% — and you&apos;ll get a 15% off code for your next purchase, emailed straight to you.
              </Text>
            </Section>
          )}

          {/* ── Sign-off ── */}
          <Section style={contentSection}>
            <Text style={text}>
              If you have any questions, just hit reply — I&apos;m a real person.
            </Text>
            <Text style={signoff}>
              Happy learning,
              <br />
              <span style={signoffName}>Amelie</span>
            </Text>
          </Section>

          {/* ── Footer ── */}
          <Hr style={hr} />
          <Section style={footerSection}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 8px' }}>
              <tr>
                <td style={{ verticalAlign: 'middle', paddingRight: '6px' }}>
                  <Img src={logoUrl} width="20" height="14" alt="" style={{ display: 'block', opacity: 0.4 }} />
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <span style={{ fontSize: '13px', color: '#999999' }}>Anywhere Learning</span>
                </td>
              </tr>
            </table>
            <Text style={footer}>Meaningful Learning, Wherever You Are</Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/shop`} style={footerLink}>Shop</Link>
              {' · '}
              <Link href={`${baseUrl}/blog`} style={footerLink}>Blog</Link>
              {' · '}
              <Link href={`${baseUrl}/resources`} style={footerLink}>Resources</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#f5f3ee', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: '0 auto', maxWidth: '560px', backgroundColor: '#faf9f6' };
const header = { padding: '28px 24px 20px', textAlign: 'center' as const };
const brandName = { fontFamily: "'Dancing Script', cursive", fontSize: '22px', fontWeight: '700' as const, color: '#588157', margin: '0', lineHeight: '1' };
const successBanner = { backgroundColor: '#588157', padding: '28px 24px 24px', textAlign: 'center' as const };
const checkCircle = { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'inline-block' as const, lineHeight: '40px', textAlign: 'center' as const, marginBottom: '12px' };
const checkMark = { color: '#faf9f6', fontSize: '20px', fontWeight: '700' as const };
const bannerHeading = { fontSize: '22px', fontWeight: '600' as const, color: '#faf9f6', margin: '0', lineHeight: '1.3' };
const imageSection = { padding: '0', lineHeight: '0' };
const productImage = { width: '100%', maxWidth: '560px', display: 'block' as const };
const multiProductGrid = { backgroundColor: '#f7f5f0', padding: '16px 16px 8px' };
const productThumbCol = { textAlign: 'center' as const, verticalAlign: 'top' as const, padding: '0 6px 12px', width: '50%' };
const productThumb = { width: '100%', maxWidth: '240px', borderRadius: '8px', display: 'block' as const, margin: '0 auto' };
const productThumbName = { fontSize: '12px', color: '#555555', margin: '6px 0 0', lineHeight: '1.3', textAlign: 'center' as const };
const moreLabel = { fontSize: '12px', color: '#888888', margin: '0 0 8px', textAlign: 'center' as const };
const contentSection = { padding: '28px 32px 8px' };
const text = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '0 0 16px' };
const buttonContainer = { textAlign: 'center' as const, margin: '28px 0' };
const button = { backgroundColor: '#588157', borderRadius: '12px', color: '#faf9f6', display: 'inline-block', fontSize: '16px', fontWeight: '600' as const, padding: '16px 36px', textDecoration: 'none' };
const tipsContainer = { backgroundColor: '#f7f5f0', borderRadius: '12px', padding: '20px 8px', margin: '8px 0 24px' };
const tipColumn = { textAlign: 'center' as const, width: '33.33%' };
const tipIcon = { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#588157', textAlign: 'center' as const, lineHeight: '32px' };
const tipLabel = { fontSize: '12px', color: '#555555', margin: '0', lineHeight: '1.4', fontWeight: '500' as const };
const referralSection = { backgroundColor: '#f0f7f0', padding: '28px 32px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' };
const referralHeading = { fontSize: '18px', fontWeight: '600' as const, color: '#588157', margin: '0 0 8px', textAlign: 'center' as const };
const referralText = { fontSize: '15px', lineHeight: '24px', color: '#2d2d2d', margin: '0 0 16px', textAlign: 'center' as const };
const codeBox = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', textAlign: 'center' as const, margin: '0 0 16px', border: '2px dashed #588157' };
const codeText = { fontSize: '24px', fontWeight: '700' as const, color: '#588157', letterSpacing: '3px', margin: '0' };
const referralSmall = { fontSize: '13px', lineHeight: '20px', color: '#666666', textAlign: 'center' as const, margin: '0' };
const signoff = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '24px 0 0' };
const signoffName = { fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#588157' };
const hr = { borderColor: '#e5e5e5', margin: '0' };
const footerSection = { padding: '24px 32px', textAlign: 'center' as const };
const footer = { fontSize: '13px', color: '#999999', margin: '0 0 8px', lineHeight: '1.5' };
const footerLinks = { fontSize: '13px', margin: '0' };
const footerLink = { color: '#588157', textDecoration: 'none' };
