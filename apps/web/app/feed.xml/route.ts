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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get('category')?.toLowerCase();

  let rows: Array<{
    slug: string;
    title: string;
    subtitle: string | null;
    categoryId: string;
    leadMediaUrl: string | null;
    publishedAt: Date | null;
  }> = [];

  try {
    const db = createDb();
    const allRows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        subtitle: articles.subtitle,
        categoryId: articles.categoryId,
        leadMediaUrl: articles.leadMediaUrl,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(eq(articles.status, 'PUBLISHED'))
      .orderBy(desc(articles.publishedAt))
      .limit(80);

    rows = categoryFilter
      ? allRows.filter(
          (r) => r.categoryId.replace('cat-', '').toLowerCase() === categoryFilter
        )
      : allRows;
  } catch (err) {
    console.error('[RSS Feed Error]:', err);
  }

  const itemsXml = rows
    .map((art) => {
      const link = `https://prolific.news/article/${escapeXml(art.slug)}`;
      const pubDate = (art.publishedAt ? new Date(art.publishedAt) : new Date()).toUTCString();
      const cat = art.categoryId.replace('cat-', '').toUpperCase();
      const imageUrl =
        art.leadMediaUrl ||
        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
      return `    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(cat)}</category>
      <dc:creator>Prolific News Network</dc:creator>
      <description>${escapeXml(art.subtitle || art.title)}</description>
      <media:content url="${escapeXml(imageUrl)}" medium="image" />
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Prolific News Network (PNN) — Global Breaking News &amp; Market Intelligence</title>
    <link>https://prolific.news</link>
    <atom:link href="https://prolific.news/feed.xml" rel="self" type="application/rss+xml" />
    <description>24/7 global broadcast dispatches, geopolitical intelligence, Africa, Asia, LatAm, and Wall Street coverage from Prolific News Network.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>15</ttl>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
