'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { openExternalBrowser } from '@/lib/capacitor';

interface NativeProductDetailProps {
  product: {
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    priceCents: number;
    imageUrl: string | null;
    category: string;
    isBundle: boolean;
    ageRange: string | null;
    activityCount: number | null;
  };
  relatedProducts: {
    slug: string;
    name: string;
    priceCents: number;
    imageUrl: string | null;
    category: string;
  }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'ai-literacy': 'AI & Digital',
  'creativity-anywhere': 'Creativity Anywhere',
  'communication-writing': 'Communication & Writing',
  'outdoor-learning': 'Outdoor Learning',
  'real-world-math': 'Real-World Math',
  'entrepreneurship': 'Entrepreneurship',
  'planning-problem-solving': 'Planning & Problem-Solving',
  'start-here': 'Start Here',
  bundle: 'Bundle',
};

const CATEGORY_COLORS: Record<string, string> = {
  'ai-literacy': '#6b8e6b',
  'creativity-anywhere': '#c4836a',
  'communication-writing': '#c47a8f',
  'outdoor-learning': '#588157',
  'real-world-math': '#8b7355',
  'entrepreneurship': '#d4a373',
  'planning-problem-solving': '#6b7280',
  'start-here': '#588157',
  bundle: '#d4a373',
};

export default function NativeProductDetail({
  product,
  relatedProducts,
}: NativeProductDetailProps) {
  const router = useRouter();
  const [descExpanded, setDescExpanded] = useState(false);
  const color = CATEGORY_COLORS[product.category] || '#588157';
  const price = `$${(product.priceCents / 100).toFixed(2)}`;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#faf9f6',
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Cover image with back button */}
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#f0ede6' }}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${color}33, ${color}66)`,
            }}
          >
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            top: 'calc(12px + env(safe-area-inset-top, 0px))',
            left: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(250, 249, 246, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Bundle badge */}
        {product.isBundle && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(12px + env(safe-area-inset-top, 0px))',
              right: '12px',
              backgroundColor: '#d4a373',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '5px 10px',
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Best Value
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px' }}>
        {/* Category label */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: color,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1a1a1a',
            lineHeight: 1.25,
            marginBottom: '8px',
          }}
        >
          {product.name}
        </h1>

        {/* Meta info */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          {product.ageRange && (
            <span>Ages {product.ageRange}</span>
          )}
          {product.activityCount && product.activityCount > 1 && (
            <span>{product.activityCount} activities</span>
          )}
          <span>{price}</span>
        </div>

        {/* Short description */}
        <p
          style={{
            fontSize: '15px',
            color: '#4b5563',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}
        >
          {product.shortDescription}
        </p>

        {/* Expandable description */}
        {product.description && product.description !== product.shortDescription && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: 1.6,
                overflow: 'hidden',
                maxHeight: descExpanded ? 'none' : '0px',
                transition: 'max-height 0.3s ease',
              }}
            >
              <p style={{ paddingTop: '4px' }}>{product.description}</p>
            </div>
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#588157',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              {descExpanded ? 'Show less' : 'Read more'}
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#f0ede6', margin: '8px 0 20px' }} />

        {/* Info badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          {[
            { label: 'Instant Download', icon: '↓' },
            { label: 'Any Device', icon: '◻' },
            { label: 'No Prep Needed', icon: '✓' },
          ].map(({ label, icon }) => (
            <div
              key={label}
              style={{
                textAlign: 'center',
                padding: '12px 8px',
                backgroundColor: '#f7f5f0',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Available on website link - Apple-compliant */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f7f5f0',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
            This activity guide is available on our website
          </p>
          <button
            onClick={() => openExternalBrowser(`${baseUrl}/shop/${product.slug}`)}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#588157',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            anywherelearning.co
          </button>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#1a1a1a',
                marginBottom: '12px',
              }}
            >
              You might also like
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '8px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}
            >
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/shop/${rp.slug}`}
                  style={{
                    flexShrink: 0,
                    width: '140px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    border: '1px solid #f0ede6',
                  }}
                >
                  <div style={{ aspectRatio: '3/4', position: 'relative', backgroundColor: '#f0ede6' }}>
                    {rp.imageUrl ? (
                      <Image
                        src={rp.imageUrl}
                        alt={rp.name}
                        fill
                        sizes="140px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(135deg, ${CATEGORY_COLORS[rp.category] || '#588157'}22, ${CATEGORY_COLORS[rp.category] || '#588157'}44)`,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {rp.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
                      ${(rp.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
