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

interface ReferralRewardProps {
  rewardCode: string;
}

const baseUrl = 'https://anywherelearning.co';

ReferralReward.PreviewProps = {
  rewardCode: 'REWARD-AMELIE-7X',
} satisfies ReferralRewardProps;

export default function ReferralReward({ rewardCode = 'REWARD-AMELIE-7X' }: ReferralRewardProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        `}</style>
      </Head>
      <Preview>Your friend just saved 15% — here&apos;s yours!</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Brand Header ── */}
          <Section style={header}>
            <Row>
              <Column style={{ textAlign: 'center' as const }}>
                <Img
                  src={`${baseUrl}/logo-icon.png`}
                  width="44"
                  height="44"
                  alt="Anywhere Learning"
                  style={{ display: 'inline-block', marginBottom: '8px' }}
                />
                <Text style={brandName}>Anywhere Learning</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Celebration Banner ── */}
          <Section style={celebrationBanner}>
            <Text style={celebrationEmoji}>&#127881;</Text>
            <Heading style={bannerHeading}>Your friend used your code!</Heading>
            <Text style={bannerSubtext}>
              They just saved 15% — and now it&apos;s your turn.
            </Text>
          </Section>

          {/* ── Main Content ── */}
          <Section style={contentSection}>
            <Text style={text}>Hey there!</Text>

            <Text style={text}>
              Someone you shared your referral code with just made a purchase. That&apos;s real-world learning spreading to another family — pretty awesome.
            </Text>

            <Text style={text}>
              As a thank you, here&apos;s <strong>15% off</strong> your next order:
            </Text>
          </Section>

          {/* ── Reward Code ── */}
          <Section style={rewardSection}>
            <Text style={rewardLabel}>Your reward code</Text>
            <Section style={codeBox}>
              <Text style={codeText}>{rewardCode}</Text>
            </Section>
            <Text style={rewardSmall}>
              One-time use — works on any activity pack or bundle.
            </Text>
          </Section>

          {/* ── CTA ── */}
          <Section style={contentSection}>
            <Section style={buttonContainer}>
              <Link href={`${baseUrl}/shop`} style={button}>
                Browse the Shop
              </Link>
            </Section>

            <Text style={textMuted}>
              Keep sharing your referral code — every time a friend uses it, you&apos;ll both save.
            </Text>
          </Section>

          {/* ── Sign-off ── */}
          <Section style={contentSection}>
            <Text style={signoff}>
              Happy learning,
              <br />
              <span style={signoffName}>Amelie</span>
            </Text>
          </Section>

          {/* ── Footer ── */}
          <Hr style={hr} />

          <Section style={footerSection}>
            <Img
              src={`${baseUrl}/logo-icon.png`}
              width="28"
              height="28"
              alt=""
              style={{ display: 'inline-block', marginBottom: '8px', opacity: 0.4 }}
            />
            <Text style={footer}>
              Anywhere Learning
              <br />
              Meaningful Learning, Wherever You Are
            </Text>
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

// ─── Styles ──────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f5f3ee',
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  margin: '0 auto',
  maxWidth: '560px',
  backgroundColor: '#faf9f6',
};

const header = {
  padding: '32px 24px 16px',
  textAlign: 'center' as const,
};

const brandName = {
  fontFamily: "'Dancing Script', cursive",
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#588157',
  margin: '0',
};

const celebrationBanner = {
  backgroundColor: '#d4a373',
  padding: '32px 24px 28px',
  textAlign: 'center' as const,
};

const celebrationEmoji = {
  fontSize: '36px',
  margin: '0 0 8px',
  lineHeight: '1',
};

const bannerHeading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#faf9f6',
  margin: '0 0 6px',
  lineHeight: '1.3',
};

const bannerSubtext = {
  fontSize: '15px',
  color: '#faf9f6',
  margin: '0',
  opacity: 0.9,
};

const contentSection = {
  padding: '28px 32px 8px',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#2d2d2d',
  margin: '0 0 16px',
};

const textMuted = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#888888',
  textAlign: 'center' as const,
  margin: '0 0 16px',
};

const rewardSection = {
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const rewardLabel = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#888888',
  textTransform: 'uppercase' as const,
  letterSpacing: '1.5px',
  margin: '0 0 12px',
};

const codeBox = {
  backgroundColor: '#f0f7f0',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '0 0 12px',
  border: '2px dashed #588157',
};

const codeText = {
  fontSize: '26px',
  fontWeight: '700' as const,
  color: '#588157',
  letterSpacing: '3px',
  margin: '0',
};

const rewardSmall = {
  fontSize: '13px',
  color: '#888888',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0 24px',
};

const button = {
  backgroundColor: '#588157',
  borderRadius: '12px',
  color: '#faf9f6',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '16px 36px',
  textDecoration: 'none',
};

const signoff = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#2d2d2d',
  margin: '8px 0 0',
};

const signoffName = {
  fontFamily: "'Dancing Script', cursive",
  fontSize: '22px',
  color: '#588157',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '0',
};

const footerSection = {
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const footer = {
  fontSize: '13px',
  color: '#999999',
  margin: '0 0 8px',
  lineHeight: '1.5',
};

const footerLinks = {
  fontSize: '13px',
  margin: '0',
};

const footerLink = {
  color: '#588157',
  textDecoration: 'none',
};
