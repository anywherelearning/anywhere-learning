'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LibraryProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  isBundle: boolean;
}

interface NativeLibraryViewProps {
  products: LibraryProduct[];
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
  bundle: 'Bundles',
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

export default function NativeLibraryView({ products }: NativeLibraryViewProps) {
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

  if (products.length === 0) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: 'rgba(88, 129, 87, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#588157"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
        </div>
        <h2
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: '22px',
            fontWeight: 700,
            color: '#588157',
            marginBottom: '8px',
          }}
        >
          No guides yet
        </h2>
        <p
          style={{
            color: '#6b7280',
            fontSize: '14px',
            maxWidth: '260px',
            lineHeight: 1.5,
            marginBottom: '20px',
          }}
        >
          Your activity guides will appear here after purchase. Browse the shop to find your family&apos;s next adventure.
        </p>
        <Link
          href="/shop"
          style={{
            color: '#588157',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Browse the Shop &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '16px 16px',
        paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        backgroundColor: '#faf9f6',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: '26px',
            fontWeight: 700,
            color: '#588157',
            marginBottom: '2px',
          }}
        >
          Your Library
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>
          {products.length} activity guide{products.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Category filter pills */}
      {categories.length > 2 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '8px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                flexShrink: 0,
                fontSize: '13px',
                fontWeight: filter === cat ? 600 : 500,
                padding: '8px 16px',
                borderRadius: '20px',
                border: filter === cat ? 'none' : '1px solid #e5e2dc',
                backgroundColor: filter === cat ? '#588157' : '#fff',
                color: filter === cat ? '#faf9f6' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/account/downloads`}
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
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
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
                    background: `linear-gradient(135deg, ${CATEGORY_COLORS[product.category] || '#588157'}22, ${CATEGORY_COLORS[product.category] || '#588157'}44)`,
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={CATEGORY_COLORS[product.category] || '#588157'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                  </svg>
                </div>
              )}
              {/* Category accent */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: CATEGORY_COLORS[product.category] || '#588157',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  opacity: 0.9,
                }}
              >
                {CATEGORY_LABELS[product.category] || product.category}
              </div>
            </div>

            {/* Name */}
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
                }}
              >
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>No guides in this category.</p>
        </div>
      )}
    </div>
  );
}
