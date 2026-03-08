/**
 * Maps product slugs to their preview PDF filenames.
 * Reads from fallback product data so the mapping stays in sync.
 */

import { fallbackProducts } from './fallback-products';

const previewMap: Map<string, string> = new Map();

for (const p of fallbackProducts) {
  if (p.previewFile) {
    previewMap.set(p.slug, p.previewFile);
  }
}

/** Get the preview PDF filename for a product slug, or null if none exists. */
export function getPreviewFileName(slug: string): string | null {
  return previewMap.get(slug) ?? null;
}

/** Check whether a product has a preview available. */
export function hasPreview(slug: string): boolean {
  return previewMap.has(slug);
}
