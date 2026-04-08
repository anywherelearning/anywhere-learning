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

interface MembershipWelcomeProps {
  plan: string;
  libraryUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';
const logoUrl = '/static/logo-icon.png';
const prodLogoUrl = `${baseUrl}/logo-icon.png`;

MembershipWelcome.PreviewProps = {
  plan: 'annual',
  libraryUrl: `${baseUrl}/account/library`,
} satisfies MembershipWelcomeProps;

export default function MembershipWelcome({
  plan = 'annual',
  libraryUrl = `${baseUrl}/account/library`,
}: MembershipWelcomeProps) {
  const logo = typeof window === 'undefined' && process.env.NEXT_PUBLIC_URL ? prodLogoUrl : logoUrl;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        `}</style>
      </Head>
      <Preview>Your membership is active. Every pack is now yours to explore</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Brand Header ── */}
          <Section style={header}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tr>
                <td style={{ verticalAlign: 'middle', paddingRight: '10px' }}>
                  <Img src={logo} width="36" height="26" alt="" style={{ display: 'block' }} />
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <Text style={brandName}>Anywhere Learning</Text>
                </td>
              </tr>
            </table>
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
            <Text style={bannerSubtext}>Every activity pack is now yours to explore.</Text>
          </Section>

          {/* ── Main Content ── */}
          <Section style={contentSection}>
            <Text style={text}>Hey there!</Text>

            <Text style={text}>
              Your <strong>{plan}</strong> membership is now active. You have
              instant access to every activity pack in the library, and anything
              new we add along the way.
            </Text>

            <Section style={buttonContainer}>
              <Link href={libraryUrl} style={button}>
                Open My Library
              </Link>
            </Section>

            {/* ── Quick Start Tips ── */}
            <Section style={tipsContainer}>
              <Row>
                <Column style={tipColumn}>
                  <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 6px' }}>
                    <tr><td style={tipIcon}>
                      <span style={{ color: '#faf9f6', fontSize: '14px' }}>&#128218;</span>
                    </td></tr>
                  </table>
                  <Text style={tipLabel}>Pick any pack</Text>
                </Column>
                <Column style={tipColumn}>
                  <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 6px' }}>
                    <tr><td style={tipIcon}>
                      <span style={{ color: '#faf9f6', fontSize: '14px' }}>&#9742;</span>
                    </td></tr>
                  </table>
                  <Text style={tipLabel}>Open on any device</Text>
                </Column>
                <Column style={tipColumn}>
                  <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 6px' }}>
                    <tr><td style={tipIcon}>
                      <span style={{ color: '#faf9f6', fontSize: '14px' }}>&#127793;</span>
                    </td></tr>
                  </table>
                  <Text style={tipLabel}>Start exploring today</Text>
                </Column>
              </Row>
            </Section>

            <Text style={text}>
              You can manage your subscription anytime from your account page. If
              you ever have questions, just reply to this email. I&apos;m a real
              person and I&apos;d love to hear from you.
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
                  <Img src={logo} width="20" height="14" alt="" style={{ display: 'block', opacity: 0.4 }} />
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
const brandName = { fontFamily: "'Dancing Script', cursive", fontSize: '22px', fontWeight: '700' as const, color: '#588157', margin: '0', lineHeight: '1' };
const welcomeBanner = { backgroundColor: '#588157', padding: '28px 24px 24px', textAlign: 'center' as const };
const starCircle = { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'inline-block' as const, lineHeight: '40px', textAlign: 'center' as const, marginBottom: '12px' };
const starIcon = { color: '#faf9f6', fontSize: '20px' };
const bannerHeading = { fontSize: '22px', fontWeight: '600' as const, color: '#faf9f6', margin: '0 0 6px', lineHeight: '1.3' };
const bannerSubtext = { fontSize: '15px', color: '#faf9f6', margin: '0', opacity: 0.9 };
const contentSection = { padding: '28px 32px 8px' };
const text = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '0 0 16px' };
const buttonContainer = { textAlign: 'center' as const, margin: '28px 0' };
const button = { backgroundColor: '#588157', borderRadius: '12px', color: '#faf9f6', display: 'inline-block', fontSize: '16px', fontWeight: '600' as const, padding: '16px 36px', textDecoration: 'none' };
const tipsContainer = { backgroundColor: '#f7f5f0', borderRadius: '12px', padding: '20px 8px', margin: '8px 0 24px' };
const tipColumn = { textAlign: 'center' as const, width: '33.33%' };
const tipIcon = { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#588157', textAlign: 'center' as const, lineHeight: '32px' };
const tipLabel = { fontSize: '12px', color: '#555555', margin: '0', lineHeight: '1.4', fontWeight: '500' as const };
const signoff = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '24px 0 0' };
const signoffName = { fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#588157' };
const hr = { borderColor: '#e5e5e5', margin: '0' };
const footerSection = { padding: '24px 32px', textAlign: 'center' as const };
const footer = { fontSize: '13px', color: '#999999', margin: '0 0 8px', lineHeight: '1.5' };
const footerLinks = { fontSize: '13px', margin: '0' };
const footerLink = { color: '#588157', textDecoration: 'none' };
