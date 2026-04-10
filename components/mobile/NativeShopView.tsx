'use client';

import { useState, useMemo } from 'react';
import NativeProductCard from './NativeProductCard';

interface Product {
  slug: string;
  name: string;
  shortDescription: string;
  priceCents: number;
  imageUrl: string | null;
  category: string;
  isBundle: boolean;
  activityCount: number | null;
  sortOrder: number;
}

interface NativeShopViewProps {
  products: Product[];
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'bundle', label: 'Bundles' },
  { value: 'start-here', label: 'Start Here' },
  { value: 'outdoor-learning', label: 'Outdoor' },
  { value: 'creativity-anywhere', label: 'Creativity' },
  { value: 'real-world-math', label: 'Math' },
  { value: 'ai-literacy', label: 'AI & Digital' },
  { value: 'communication-writing', label: 'Writing' },
  { value: 'entrepreneurship', label: 'Business' },
  { value: 'planning-problem-solving', label: 'Problem-Solving' },
];

export default function NativeShopView({ products }: NativeShopViewProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = products;

    // Category filter
    if (filter === 'bundle') {
      result = result.filter((p) => p.isBundle);
    } else if (filter !== 'all') {
      result = result.filter((p) => p.category === filter && !p.isBundle);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, filter, search]);

  // Available categories (only show categories that have products)
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    const hasBundles = products.some((p) => p.isBundle);
    return CATEGORIES.filter(
      (c) => c.value === 'all' || (c.value === 'bundle' && hasBundles) || cats.has(c.value),
    );
  }, [products]);

  return (
    <div
      style={{
        padding: '16px',
        paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        backgroundColor: '#faf9f6',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: '22px',
            fontWeight: 700,
            color: '#588157',
            marginBottom: '2px',
          }}
        >
          Anywhere Learning
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
          Activity guides for curious families
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search activity guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #e5e2dc',
            backgroundColor: '#fff',
            outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            color: '#1a1a1a',
            WebkitAppearance: 'none',
          }}
        />
      </div>

      {/* Category pills */}
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
        {availableCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setFilter(cat.value);
              setSearch('');
            }}
            style={{
              flexShrink: 0,
              fontSize: '13px',
              fontWeight: filter === cat.value ? 600 : 500,
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === cat.value ? 'none' : '1px solid #e5e2dc',
              backgroundColor: filter === cat.value ? '#588157' : '#fff',
              color: filter === cat.value ? '#faf9f6' : '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {filtered.map((product) => (
          <NativeProductCard
            key={product.slug}
            slug={product.slug}
            name={product.name}
            priceCents={product.priceCents}
            imageUrl={product.imageUrl}
            category={product.category}
            isBundle={product.isBundle}
            activityCount={product.activityCount}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
            {search ? 'No guides match your search.' : 'No guides in this category.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                color: '#588157',
                fontWeight: 600,
                fontSize: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
