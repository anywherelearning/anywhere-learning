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

interface MembershipWelcomeProps {
  plan: string;
  libraryUrl: string;
}

MembershipWelcome.PreviewProps = {
  plan: 'annual',
  libraryUrl: 'https://anywherelearning.co/account/library',
} satisfies MembershipWelcomeProps;

export default function MembershipWelcome({
  plan = 'annual',
  libraryUrl = 'https://anywherelearning.co/account/library',
}: MembershipWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Your membership is active — every pack is now yours to explore</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to your membership!</Heading>

          <Text style={text}>Hey there!</Text>

          <Text style={text}>
            Your <strong>{plan}</strong> membership is now active. You have
            instant access to every activity pack in the library — and anything
            new we add along the way.
          </Text>

          <Section style={buttonContainer}>
            <Link href={libraryUrl} style={button}>
              Open My Library
            </Link>
          </Section>

          <Text style={text}>
            Pick a pack. Open it up. Start exploring with your kids today.
          </Text>

          <Text style={text}>
            You can manage your subscription anytime from your account page. If
            you ever have questions, just reply to this email — I&apos;m a real
            person and I&apos;d love to hear from you.
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
