import type { MetadataRoute } from 'next';
import { createDb, articles, desc, eq } from '@prolific/db';

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://prolific.news';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/watch`, lastModified: now, changeFrequency: 'always', priority: 0.95 },
    { url: `${baseUrl}/for-you`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/politics`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/us`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/world`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/africa`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/asia`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/latam`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/business`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/tech`, lastModified: now, changeFrequency: 'hourly', priority: 0.85 },
    { url: `${baseUrl}/category/sports`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/category/entertainment`, lastModified: now, changeFrequency: 'daily', priority: 0.75 },
    { url: `${baseUrl}/category/opinion`, lastModified: now, changeFrequency: 'daily', priority: 0.75 },
    { url: `${baseUrl}/category/lifestyle`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.75 },
    { url: `${baseUrl}/archive`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/plus`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/submit-press-release`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/advertise`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/editorial-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const db = createDb();
    const publishedArticles = await db
      .select({
        slug: articles.slug,
        publishedAt: articles.publishedAt,
        isBreaking: articles.isBreaking,
      })
      .from(articles)
      .where(eq(articles.status, 'PUBLISHED'))
      .orderBy(desc(articles.publishedAt))
      .limit(500);

    const articleEntries: MetadataRoute.Sitemap = publishedArticles.map((art) => ({
      url: `${baseUrl}/article/${art.slug}`,
      lastModified: art.publishedAt || now,
      changeFrequency: 'hourly',
      priority: art.isBreaking ? 0.95 : 0.8,
    }));

    return [...staticRoutes, ...articleEntries];
  } catch (err) {
    console.error('[Sitemap] Fallback to static routes:', err);
    return staticRoutes;
  }
}
