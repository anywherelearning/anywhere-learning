'use client';

import Image from 'next/image';
import Link from 'next/link';

interface NativeProductCardProps {
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  category: string;
  isBundle: boolean;
  activityCount: number | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  'ai-literacy': 'AI & Digital',
  'creativity-anywhere': 'Creativity',
  'communication-writing': 'Writing',
  'outdoor-learning': 'Outdoor',
  'real-world-math': 'Math',
  'entrepreneurship': 'Business',
  'planning-problem-solving': 'Problem-Solving',
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

export default function NativeProductCard({
  slug,
  name,
  priceCents,
  imageUrl,
  category,
  isBundle,
  activityCount,
}: NativeProductCardProps) {
  const color = CATEGORY_COLORS[category] || '#588157';
  const price = `$${(priceCents / 100).toFixed(2)}`;

  return (
    <Link
      href={`/shop/${slug}`}
      style={{
        display: 'block',
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        textDecoration: 'none',
        border: '1px solid #f0ede6',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Cover image */}
      <div
        style={{
          aspectRatio: '3/4',
          position: 'relative',
          backgroundColor: '#f0ede6',
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${color}22, ${color}44)`,
            }}
          >
            <span
              style={{
                color: color,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {CATEGORY_LABELS[category] || category}
            </span>
          </div>
        )}

        {/* Category pill */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: color,
            color: '#fff',
            fontSize: '10px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '6px',
            opacity: 0.9,
          }}
        >
          {CATEGORY_LABELS[category] || category}
        </div>

        {/* Bundle badge */}
        {isBundle && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: '#d4a373',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700,
              padding: '3px 6px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Best Value
          </div>
        )}

        {/* Activity count */}
        {activityCount && activityCount > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '6px',
            }}
          >
            {activityCount} packs
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '4px',
          }}
        >
          {name}
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            fontWeight: 500,
          }}
        >
          {price}
        </p>
      </div>
    </Link>
  );
}
