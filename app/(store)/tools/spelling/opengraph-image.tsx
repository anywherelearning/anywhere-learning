import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/components/tools/og-template';

// Share image for /tools/spelling (og:image + twitter:image).
export const alt = 'Free Spelling Worksheet Maker by Anywhere Learning.';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return toolOgImage({
    title: 'Spelling Worksheet Maker',
    subtitle: 'Practice sheets and blank tests from one list.',
    sampleRows: ['because', 'friend', 'enough'],
    style: 'print',
    sampleFontSize: 56,
  });
}
