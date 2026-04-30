import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Anywhere Learning',
    short_name: 'Anywhere Learning',
    description:
      'Low-prep activity guides for homeschool and worldschool families. Real-world learning for ages 6-14.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: '#588157',
    icons: [
      {
        src: '/logo-icon-transparent.png',
        sizes: '1200x867',
        type: 'image/png',
      },
    ],
  };
}
