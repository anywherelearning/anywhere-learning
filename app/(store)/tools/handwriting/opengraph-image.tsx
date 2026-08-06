import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/components/tools/og-template';

// Share image for /tools/handwriting (og:image + twitter:image).
export const alt = 'Free Handwriting Practice Generator by Anywhere Learning.';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return toolOgImage({
    title: 'Handwriting Practice Generator',
    subtitle: 'Type any words. Print in seconds.',
    sampleRows: ['Practice', 'Practice', 'Practice'],
    style: 'print',
    sampleFontSize: 56,
  });
}
