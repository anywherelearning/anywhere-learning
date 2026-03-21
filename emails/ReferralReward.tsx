import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ReferralRewardProps {
  rewardCode: string;
}

ReferralReward.PreviewProps = {
  rewardCode: 'REWARD-AMELIE-7X',
} satisfies ReferralRewardProps;

export default function ReferralReward({ rewardCode = 'REWARD-AMELIE-7X' }: ReferralRewardProps) {
  return (
    <Html>
      <Head />
      <Preview>Your friend just saved 15% — here&apos;s yours!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your friend used your code!</Heading>

          <Text style={text}>Hey there!</Text>

          <Text style={text}>
            Someone you shared your referral code with just made a purchase — and saved 15%. Nice one!
          </Text>

          <Text style={text}>
            As a thank you, here&apos;s <strong>15% off</strong> your next order:
          </Text>

          <Section style={codeBox}>
            <Text style={codeText}>{rewardCode}</Text>
          </Section>

          <Text style={textSmall}>
            This is a one-time code — use it on any activity pack or bundle in the shop.
          </Text>

          <Section style={buttonContainer}>
            <Link href="https://anywherelearning.co/shop" style={button}>
              Browse the Shop
            </Link>
          </Section>

          <Text style={text}>
            Keep sharing your referral code — every time a friend uses it, you&apos;ll both save.
          </Text>

          <Text style={text}>
            Happy learning,
            <br />
            Amelie
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Anywhere Learning · Meaningful Learning, Wherever You Are
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#faf9f6',
  fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '560px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#588157',
  marginBottom: '24px',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#1a1a1a',
};

const textSmall = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#666666',
  textAlign: 'center' as const,
};

const codeBox = {
  backgroundColor: '#f0f7f0',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px dashed #588157',
};

const codeText = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#588157',
  letterSpacing: '2px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#588157',
  borderRadius: '8px',
  color: '#faf9f6',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '14px 32px',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
};

const footer = {
  fontSize: '13px',
  color: '#999999',
  textAlign: 'center' as const,
};
