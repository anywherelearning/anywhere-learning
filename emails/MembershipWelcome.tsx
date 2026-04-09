import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface MembershipWelcomeProps {
  plan: string;
  libraryUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';
const logoUrl = '/static/logo-full.png';
const prodLogoUrl = `${baseUrl}/logo-full.png`;
const footerIconUrl = '/static/logo-icon-circle.png';
const prodFooterIconUrl = `${baseUrl}/logo-icon-circle.png`;

MembershipWelcome.PreviewProps = {
  plan: 'annual',
  libraryUrl: `${baseUrl}/account/library`,
} satisfies MembershipWelcomeProps;

export default function MembershipWelcome({
  plan = 'annual',
  libraryUrl = `${baseUrl}/account/library`,
}: MembershipWelcomeProps) {
  const logo = typeof window === 'undefined' && process.env.NEXT_PUBLIC_URL ? prodLogoUrl : logoUrl;
  const footerIcon = typeof window === 'undefined' && process.env.NEXT_PUBLIC_URL ? prodFooterIconUrl : footerIconUrl;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        `}</style>
      </Head>
      <Preview>Your membership is active, every guide is now yours to explore</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Brand Header ── */}
          <Section style={header}>
            <Img src={logo} width="220" alt="Anywhere Learning" style={{ display: 'block', margin: '0 auto', maxWidth: '220px' }} />
          </Section>

          {/* ── Welcome Banner ── */}
          <Section style={welcomeBanner}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tr>
                <td style={{ textAlign: 'center' as const }}>
                  <div style={starCircle}>
                    <span style={starIcon}>&#9733;</span>
                  </div>
                </td>
              </tr>
            </table>
            <Heading style={bannerHeading}>Welcome to your membership!</Heading>
            <Text style={bannerSubtext}>Every guide is now yours to explore.</Text>
          </Section>

          {/* ── Main Content ── */}
          <Section style={contentSection}>
            <Text style={text}>Hey there!</Text>

            <Text style={text}>
              Your <strong>{plan}</strong> membership is now active. You have
              instant access to every guide in the library, and anything
              new we add along the way.
            </Text>

            <Section style={buttonContainer}>
              <Link href={libraryUrl} style={button}>
                Open My Library
              </Link>
            </Section>

            <Text style={text}>
              You can manage your subscription anytime from your account page. If
              you ever have questions, just reply to this email, I&apos;d love to hear from you.
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
            <Img src={footerIcon} width="32" alt="" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }} />
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
const welcomeBanner = { backgroundColor: '#588157', padding: '28px 24px 24px', textAlign: 'center' as const };
const starCircle = { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'inline-block' as const, lineHeight: '40px', textAlign: 'center' as const, marginBottom: '12px' };
const starIcon = { color: '#faf9f6', fontSize: '20px' };
const bannerHeading = { fontSize: '22px', fontWeight: '600' as const, color: '#faf9f6', margin: '0 0 6px', lineHeight: '1.3' };
const bannerSubtext = { fontSize: '15px', color: '#faf9f6', margin: '0', opacity: 0.9 };
const contentSection = { padding: '28px 32px 8px' };
const text = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '0 0 16px' };
const buttonContainer = { textAlign: 'center' as const, margin: '28px 0' };
const button = { backgroundColor: '#588157', borderRadius: '12px', color: '#faf9f6', display: 'inline-block', fontSize: '16px', fontWeight: '600' as const, padding: '16px 36px', textDecoration: 'none' };
const signoff = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '24px 0 0' };
const signoffName = { fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#d4a373' };
const hr = { borderColor: '#e5e5e5', margin: '0' };
const footerSection = { padding: '24px 32px', textAlign: 'center' as const };
const footer = { fontSize: '13px', color: '#999999', margin: '0 0 8px', lineHeight: '1.5' };
const footerLinks = { fontSize: '13px', margin: '0' };
const footerLink = { color: '#588157', textDecoration: 'none' };
