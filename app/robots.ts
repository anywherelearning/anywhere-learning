import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/api/', '/sign-in', '/sign-up', '/checkout/', '/app-login', '/app-account', '/library'],
    },
    sitemap: 'https://anywherelearning.co/sitemap.xml',
  };
}
