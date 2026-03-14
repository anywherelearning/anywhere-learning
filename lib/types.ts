export interface ShopProduct {
  name: string;
  slug: string;
  shortDescription: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  stripePriceId?: string;
  imageUrl?: string | null;
  category: string;
  isBundle: boolean;
  activityCount?: number | null;
  ageRange?: string | null;
}
