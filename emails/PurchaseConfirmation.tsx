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
  customerName?: string;
  productName: string;
  downloadUrl: string;
  referralCode?: string;
  productImageUrl?: string;
  products?: ProductItem[];
  signInUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

PurchaseConfirmation.PreviewProps = {
  customerName: 'Sarah',
  productName: 'Spring Outdoor Pack, Summer Outdoor Pack',
  downloadUrl: `${baseUrl}/account/downloads`,
  referralCode: 'REF-AMELIE-7X',
  signInUrl: `${baseUrl}/account/downloads#__clerk_ticket=example_token`,
  products: [
    { name: 'Spring Outdoor Pack', imageUrl: '/static/spring-outdoor-pack.jpg' },
    { name: 'Summer Outdoor Pack', imageUrl: '/static/summer-outdoor-pack.jpg' },
  ],
} satisfies PurchaseConfirmationProps;

export default function PurchaseConfirmation({
  customerName,
  productName = 'Spring Outdoor Pack',
  downloadUrl = `${baseUrl}/account/downloads`,
  referralCode = 'REF-AMELIE-7X',
  productImageUrl = '/static/spring-outdoor-pack.jpg',
  products,
  signInUrl,
}: PurchaseConfirmationProps) {
  const greeting = customerName ? `Hey ${customerName}!` : 'Hey there!';
  // Build product list: use products array if provided, else fall back to single image.
  // Ensure all image URLs are absolute so email clients can fetch them.
  const ensureAbsolute = (url: string) =>
    url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  const productList: ProductItem[] = (products && products.length > 0
    ? products
    : productImageUrl
      ? [{ name: productName, imageUrl: productImageUrl }]
      : []
  ).map((p) => ({ ...p, imageUrl: ensureAbsolute(p.imageUrl) }));
  const isSingle = productList.length === 1;
  const isMultiple = productList.length > 1;

  const logoUrl = (productList[0]?.imageUrl || '').startsWith('/static/')
    ? '/static/logo-full.png'
    : `${baseUrl}/logo-full.png`;
  const footerIconUrl = (productList[0]?.imageUrl || '').startsWith('/static/')
    ? '/static/logo-icon-circle.png'
    : `${baseUrl}/logo-icon-circle.png`;

  // Smart heading: show product name for single, count for multiple
  const headingText = isSingle
    ? `Your ${productList[0].name} is ready!`
    : `Your ${productList.length} guides are ready!`;

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
            <Img src={logoUrl} width="220" alt="Anywhere Learning" style={{ display: 'block', margin: '0 auto', maxWidth: '220px' }} />
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
            <Text style={text}>{greeting}</Text>

            <Text style={text}>
              Your <strong>{isMultiple ? `${productList.length} guides` : productList[0]?.name || productName}</strong> {isSingle ? 'is' : 'are'} ready to download. Open on any device, phone, tablet, or laptop, and jump right in.
            </Text>

            <Section style={buttonContainer}>
              <Link href={downloadUrl} style={button}>
                Download Your Guide
              </Link>
            </Section>

          </Section>

          {/* ── Account Section (guest buyers only) ── */}
          {signInUrl && (
            <Section style={accountSection}>
              <Heading as="h2" style={accountHeading}>
                Your account is ready
              </Heading>
              <Text style={accountText}>
                We created an account for you so you can access your downloads anytime. No password needed - just click below to sign in.
              </Text>
              <Section style={buttonContainer}>
                <Link href={signInUrl} style={accountButton}>
                  Sign in to your account
                </Link>
              </Section>
              <Text style={accountSmall}>
                This link expires in 7 days. After that, use &quot;Forgot password&quot; on the sign-in page to set one up.
              </Text>
            </Section>
          )}

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
                Your friend enters this code at checkout. When they do, they save 15%, and you&apos;ll get a 15% off code for your next purchase, emailed straight to you.
              </Text>
            </Section>
          )}

          {/* ── Sign-off ── */}
          <Section style={contentSection}>
            <Text style={text}>
              If you have any questions, just hit reply, I&apos;d love to hear from you.
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
            <Img src={footerIconUrl} width="32" alt="" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }} />
            <Text style={footerBrand}>Anywhere Learning</Text>
            <Text style={footer}>Meaningful Learning, Wherever You Are</Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/shop`} style={footerLink}>Shop</Link>
              {' · '}
              <Link href={`${baseUrl}/blog`} style={footerLink}>Blog</Link>
              {' · '}
              <Link href={`${baseUrl}/guides`} style={footerLink}>Guides</Link>
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
const footerBrand = { fontSize: '13px', color: '#999999', margin: '0 0 4px' };
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
const accountSection = { backgroundColor: '#f7f5f0', padding: '28px 32px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' };
const accountHeading = { fontSize: '18px', fontWeight: '600' as const, color: '#588157', margin: '0 0 8px', textAlign: 'center' as const };
const accountText = { fontSize: '15px', lineHeight: '24px', color: '#2d2d2d', margin: '0 0 16px', textAlign: 'center' as const };
const accountButton = { backgroundColor: '#ffffff', border: '2px solid #588157', borderRadius: '12px', color: '#588157', display: 'inline-block', fontSize: '15px', fontWeight: '600' as const, padding: '14px 32px', textDecoration: 'none' };
const accountSmall = { fontSize: '13px', lineHeight: '20px', color: '#666666', textAlign: 'center' as const, margin: '16px 0 0' };
const referralSection = { backgroundColor: '#f0f7f0', padding: '28px 32px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' };
const referralHeading = { fontSize: '18px', fontWeight: '600' as const, color: '#588157', margin: '0 0 8px', textAlign: 'center' as const };
const referralText = { fontSize: '15px', lineHeight: '24px', color: '#2d2d2d', margin: '0 0 16px', textAlign: 'center' as const };
const codeBox = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', textAlign: 'center' as const, margin: '0 0 16px', border: '2px dashed #588157' };
const codeText = { fontSize: '24px', fontWeight: '700' as const, color: '#588157', letterSpacing: '3px', margin: '0' };
const referralSmall = { fontSize: '13px', lineHeight: '20px', color: '#666666', textAlign: 'center' as const, margin: '0' };
const signoff = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '24px 0 0' };
const signoffName = { fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#d4a373' };
const hr = { borderColor: '#e5e5e5', margin: '0' };
const footerSection = { padding: '24px 32px', textAlign: 'center' as const };
const footer = { fontSize: '13px', color: '#999999', margin: '0 0 8px', lineHeight: '1.5' };
const footerLinks = { fontSize: '13px', margin: '0' };
const footerLink = { color: '#588157', textDecoration: 'none' };
