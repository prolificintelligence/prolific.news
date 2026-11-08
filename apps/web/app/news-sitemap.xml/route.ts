import { createDb, articles, desc, eq } from '@prolific/db';

export const revalidate = 300;

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let rows: Array<{
    slug: string;
    title: string;
    categoryId: string;
    publishedAt: Date | null;
    leadMediaUrl: string | null;
  }> = [];

  try {
    const db = createDb();
    rows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        categoryId: articles.categoryId,
        publishedAt: articles.publishedAt,
        leadMediaUrl: articles.leadMediaUrl,
      })
      .from(articles)
      .where(eq(articles.status, 'PUBLISHED'))
      .orderBy(desc(articles.publishedAt))
      .limit(100);
  } catch (err) {
    console.error('[Google News Sitemap Error]:', err);
  }

  const urlsXml = rows
    .map((art) => {
      const pubDate = (art.publishedAt ? new Date(art.publishedAt) : new Date()).toISOString();
      const cat = art.categoryId.replace('cat-', '').toUpperCase();
      const keywords = `${cat}, Prolific News Network, PNN, Breaking News`;
      return `  <url>
    <loc>https://prolific.news/article/${escapeXml(art.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Prolific News Network</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXml}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
