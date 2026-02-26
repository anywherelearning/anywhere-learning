'use client';

import { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

interface Product {
  name: string;
  slug: string;
  shortDescription: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  imageUrl: string | null;
  category: string;
  isBundle: boolean;
  activityCount?: number | null;
  ageRange?: string | null;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    const cards = gridRef.current?.querySelectorAll('[data-animate]');
    cards?.forEach((card, i) => {
      (card as HTMLElement).style.animationDelay = `${i * 80}ms`;
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-gray-500">
          No products found in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8"
    >
      {products.map((product) => (
        <div key={product.slug} data-animate className="opacity-0">
          <ProductCard {...product} />
        </div>
      ))}
    </div>
  );
}
