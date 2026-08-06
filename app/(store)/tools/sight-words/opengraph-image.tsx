import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/components/tools/og-template';

// Share image for /tools/sight-words (og:image + twitter:image).
export const alt = 'Free Sight Words Worksheet Generator by Anywhere Learning.';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return toolOgImage({
    title: 'Sight Words Worksheet Generator',
    subtitle: 'Every Dolch and Fry list, ready to print.',
    sampleRows: ['said', 'come', 'because'],
    style: 'print',
    sampleFontSize: 58,
  });
}
