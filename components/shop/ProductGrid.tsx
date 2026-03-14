import ProductCard from './ProductCard';
import AnimateOnScroll from './AnimateOnScroll';

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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
      {products.map((product, i) => (
        <AnimateOnScroll key={product.slug} delay={i * 80}>
          <ProductCard {...product} />
        </AnimateOnScroll>
      ))}
    </div>
  );
}
