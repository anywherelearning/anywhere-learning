import ProductCarousel from './ProductCarousel';
import type { ShopProduct } from '@/lib/types';

export default function BundleCarousel({ products }: { products: ShopProduct[] }) {
  return <ProductCarousel products={products} />;
}
