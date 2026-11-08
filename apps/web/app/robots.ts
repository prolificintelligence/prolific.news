import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/inngest', '/private/'],
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      },
    ],
    sitemap: [
      'https://prolific.news/sitemap.xml',
      'https://prolific.news/news-sitemap.xml',
    ],
    host: 'https://prolific.news',
  };
}
