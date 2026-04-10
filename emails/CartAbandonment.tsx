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
import type { AbandonedCartUpsell } from '@/lib/cart-abandonment';

interface CartItem {
  name: string;
  imageUrl: string;
  priceCents: number;
}

interface CartAbandonmentProps {
  items: CartItem[];
  upsell: AbandonedCartUpsell | null;
  shopUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

CartAbandonment.PreviewProps = {
  items: [
    { name: 'Spring Outdoor Learning Pack', imageUrl: '/static/spring-outdoor-pack.jpg', priceCents: 1499 },
    { name: 'Summer Outdoor Learning Pack', imageUrl: '/static/summer-outdoor-pack.jpg', priceCents: 1499 },
  ],
  upsell: {
    type: 'category-bundle',
    bundleName: 'Outdoor & Nature Mega Bundle',
    bundleSlug: 'outdoor-mega-bundle',
    bundlePriceCents: 4199,
    individualTotalCents: 2998,
    savingsCents: 1394,
    bundleActivityCount: 7,
  },
  shopUrl: `${baseUrl}/shop?cart=open`,
} satisfies CartAbandonmentProps;

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CartAbandonment({
  items = [],
  upsell = null,
  shopUrl = `${baseUrl}/shop?cart=open`,
}: CartAbandonmentProps) {
  const logoUrl = (items[0]?.imageUrl || '').startsWith('/static/')
    ? '/static/logo-full.png'
    : `${baseUrl}/logo-full.png`;
  const footerIconUrl = (items[0]?.imageUrl || '').startsWith('/static/')
    ? '/static/logo-icon-circle.png'
    : `${baseUrl}/logo-icon-circle.png`;

  const itemCount = items.length;
  const previewText = itemCount === 1
    ? `Your ${items[0].name} is still waiting for you`
    : `Your ${itemCount} guides are still waiting`;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Brand Header ── */}
          <Section style={header}>
            <Img src={logoUrl} width="220" alt="Anywhere Learning" style={{ display: 'block', margin: '0 auto', maxWidth: '220px' }} />
          </Section>

          {/* ── Hero Banner ── */}
          <Section style={heroBanner}>
            <Heading style={heroHeading}>Still thinking it over?</Heading>
            <Text style={heroSubtext}>
              {itemCount === 1
                ? `Your ${items[0].name} is still in your cart.`
                : `Your ${itemCount} guides are still in your cart.`}
            </Text>
          </Section>

          {/* ── Cart Items ── */}
          {items.length > 0 && (
            <Section style={itemsSection}>
              <Text style={sectionLabel}>What you left behind:</Text>
              {items.length === 1 ? (
                <Section style={{ textAlign: 'center' as const }}>
                  <Img src={items[0].imageUrl} width="280" alt={items[0].name} style={singleItemImage} />
                  <Text style={itemName}>{items[0].name}</Text>
                  <Text style={itemPrice}>{formatPrice(items[0].priceCents)}</Text>
                </Section>
              ) : (
                <Section style={itemGrid}>
                  <Row>
                    {items.slice(0, 2).map((item, i) => (
                      <Column key={i} style={itemCol}>
                        <Img src={item.imageUrl} alt={item.name} style={itemThumb} />
                        <Text style={itemThumbName}>{item.name}</Text>
                        <Text style={itemThumbPrice}>{formatPrice(item.priceCents)}</Text>
                      </Column>
                    ))}
                  </Row>
                  {items.length > 2 && (
                    <Row>
                      {items.slice(2, 4).map((item, i) => (
                        <Column key={i} style={itemCol}>
                          <Img src={item.imageUrl} alt={item.name} style={itemThumb} />
                          <Text style={itemThumbName}>{item.name}</Text>
                          <Text style={itemThumbPrice}>{formatPrice(item.priceCents)}</Text>
                        </Column>
                      ))}
                      {items.length === 3 && <Column style={itemCol} />}
                    </Row>
                  )}
                  {items.length > 4 && (
                    <Text style={moreItems}>+ {items.length - 4} more</Text>
                  )}
                </Section>
              )}
            </Section>
          )}

          {/* ── CTA Button ── */}
          <Section style={ctaContainer}>
            <Link href={shopUrl} style={ctaButton}>
              Complete Your Order
            </Link>
          </Section>

          {/* ── Upsell Section ── */}
          {upsell && upsell.type === 'bundle-bonus' && (
            <Section style={upsellSection}>
              <Heading as="h2" style={upsellHeading}>
                Don&apos;t forget your free bonus!
              </Heading>
              <Text style={upsellText}>
                Your <strong>{upsell.bundleName}</strong> comes with a <strong>free copy of The Future-Ready Skills Map</strong>, a 42-page parent guide to the 10 skills that matter most. It&apos;s included at no extra cost when you check out.
              </Text>
            </Section>
          )}

          {upsell && upsell.type === 'category-bundle' && (
            <Section style={upsellSection}>
              <Heading as="h2" style={upsellHeading}>
                Save more with the bundle
              </Heading>
              <Text style={upsellText}>
                Get all {upsell.bundleActivityCount} activities in the <strong>{upsell.bundleName}</strong> for just {formatPrice(upsell.bundlePriceCents!)}, that&apos;s <strong>{formatPrice(upsell.savingsCents!)} off</strong> compared to buying individually. Plus, you&apos;ll get The Future-Ready Skills Map free.
              </Text>
              <Section style={{ textAlign: 'center' as const, marginTop: '16px' }}>
                <Link href={`${baseUrl}/shop/${upsell.bundleSlug}`} style={upsellButton}>
                  View the Bundle
                </Link>
              </Section>
            </Section>
          )}

          {upsell && upsell.type === 'byob' && (
            <Section style={upsellSection}>
              <Heading as="h2" style={upsellHeading}>
                You&apos;re {upsell.itemsNeeded === 1 ? '1 guide' : `${upsell.itemsNeeded} guides`} away from {upsell.discountPercent}% off
              </Heading>
              <Text style={upsellText}>
                Add {upsell.itemsNeeded === 1 ? 'just 1 more guide' : `${upsell.itemsNeeded} more guides`} to your cart and our mix-and-match discount kicks in, <strong>{upsell.discountPercent}% off every individual guide</strong> in your order.
              </Text>
              <Section style={{ textAlign: 'center' as const, marginTop: '16px' }}>
                <Link href={`${baseUrl}/shop`} style={upsellButton}>
                  Browse Activities
                </Link>
              </Section>
            </Section>
          )}

          {/* ── Sign-off ── */}
          <Section style={contentSection}>
            <Text style={text}>
              No pressure, just didn&apos;t want you to lose your picks. If you have any questions, just hit reply.
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

// ── Styles ──────────────────────────────────────────────────────────────

const main = { backgroundColor: '#f5f3ee', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: '0 auto', maxWidth: '560px', backgroundColor: '#faf9f6' };
const header = { padding: '28px 24px 20px', textAlign: 'center' as const };
const footerBrand = { fontSize: '13px', color: '#999999', margin: '0 0 4px' };

// Hero - warm gold/cream instead of green success banner
const heroBanner = { backgroundColor: '#d4a373', padding: '28px 24px 24px', textAlign: 'center' as const };
const heroHeading = { fontSize: '22px', fontWeight: '600' as const, color: '#faf9f6', margin: '0 0 8px', lineHeight: '1.3' };
const heroSubtext = { fontSize: '15px', color: '#faf9f6', margin: '0', lineHeight: '1.5', opacity: '0.9' };

// Cart items
const itemsSection = { padding: '24px 32px 0' };
const sectionLabel = { fontSize: '13px', fontWeight: '600' as const, color: '#888888', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 16px', textAlign: 'center' as const };
const singleItemImage = { width: '100%', maxWidth: '280px', borderRadius: '8px', display: 'block' as const, margin: '0 auto' };
const itemName = { fontSize: '16px', fontWeight: '600' as const, color: '#2d2d2d', margin: '12px 0 4px', textAlign: 'center' as const };
const itemPrice = { fontSize: '15px', color: '#588157', fontWeight: '600' as const, margin: '0', textAlign: 'center' as const };
const itemGrid = { padding: '0' };
const itemCol = { textAlign: 'center' as const, verticalAlign: 'top' as const, padding: '0 6px 12px', width: '50%' };
const itemThumb = { width: '100%', maxWidth: '240px', borderRadius: '8px', display: 'block' as const, margin: '0 auto' };
const itemThumbName = { fontSize: '12px', color: '#555555', margin: '6px 0 2px', lineHeight: '1.3', textAlign: 'center' as const };
const itemThumbPrice = { fontSize: '12px', color: '#588157', fontWeight: '600' as const, margin: '0', textAlign: 'center' as const };
const moreItems = { fontSize: '12px', color: '#888888', margin: '0 0 8px', textAlign: 'center' as const };

// CTA
const ctaContainer = { textAlign: 'center' as const, padding: '24px 32px' };
const ctaButton = { backgroundColor: '#588157', borderRadius: '12px', color: '#faf9f6', display: 'inline-block', fontSize: '16px', fontWeight: '600' as const, padding: '16px 36px', textDecoration: 'none' };

// Upsell
const upsellSection = { backgroundColor: '#f0f7f0', padding: '24px 32px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' };
const upsellHeading = { fontSize: '18px', fontWeight: '600' as const, color: '#588157', margin: '0 0 8px', textAlign: 'center' as const };
const upsellText = { fontSize: '15px', lineHeight: '24px', color: '#2d2d2d', margin: '0', textAlign: 'center' as const };
const upsellButton = { backgroundColor: '#d4a373', borderRadius: '10px', color: '#faf9f6', display: 'inline-block', fontSize: '14px', fontWeight: '600' as const, padding: '12px 28px', textDecoration: 'none' };

// Tips, sign-off, footer - reuse from PurchaseConfirmation
const contentSection = { padding: '28px 32px 8px' };
const text = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '0 0 16px' };
const signoff = { fontSize: '16px', lineHeight: '26px', color: '#2d2d2d', margin: '24px 0 0' };
const signoffName = { fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#d4a373' };
const hr = { borderColor: '#e5e5e5', margin: '0' };
const footerSection = { padding: '24px 32px', textAlign: 'center' as const };
const footer = { fontSize: '13px', color: '#999999', margin: '0 0 8px', lineHeight: '1.5' };
const footerLinks = { fontSize: '13px', margin: '0' };
const footerLink = { color: '#588157', textDecoration: 'none' };
