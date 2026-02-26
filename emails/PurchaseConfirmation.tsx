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

interface PurchaseConfirmationProps {
  productName: string;
  downloadUrl: string;
}

export default function PurchaseConfirmation({
  productName,
  downloadUrl,
}: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {productName} is ready to download</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your {productName} is ready!</Heading>

          <Text style={text}>Hey there!</Text>

          <Text style={text}>
            Your <strong>{productName}</strong> is ready to download.
          </Text>

          <Section style={buttonContainer}>
            <Link href={downloadUrl} style={button}>
              Download Your Pack
            </Link>
          </Section>

          <Text style={text}>
            Print it out. Pick an activity. Start today.
          </Text>

          <Text style={text}>
            If you have any questions, just hit reply — I&apos;m a real person.
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
