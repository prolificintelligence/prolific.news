import { NextResponse } from 'next/server';
import {
  getRecentSocialDispatches,
  syndicateArticleToSocials,
  autoSyndicateHighValueArticles,
  OFFICIAL_SOCIAL_HANDLES,
} from '@prolific/jobs';
import { createDb, articles, eq, desc } from '@prolific/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 48), 120);

    const db = createDb();
    const posts = await getRecentSocialDispatches(limit);
    const rows = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        categoryId: articles.categoryId,
        isBreaking: articles.isBreaking,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(20);

    const recentArticles = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.categoryId.replace('cat-', '').toUpperCase(),
      isBreaking: r.isBreaking,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      officialHandles: OFFICIAL_SOCIAL_HANDLES,
      posts,
      recentArticles,
    });
  } catch (error) {
    console.error('[Admin Social API GET Error]:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'auto') {
      const result = await autoSyndicateHighValueArticles(body.maxArticles || 5);
      return NextResponse.json({
        ok: true,
        articlesSyndicated: result.articlesProcessed,
        ...result,
      });
    }

    if (body.articleId) {
      const db = createDb();
      const found = await db
        .select()
        .from(articles)
        .where(eq(articles.id, body.articleId))
        .limit(1);

      const art = found[0];
      if (!art) {
        return NextResponse.json(
          { ok: false, error: 'Article not found' },
          { status: 404 }
        );
      }

      const result = await syndicateArticleToSocials(
        {
          id: art.id,
          slug: art.slug,
          title: art.title,
          subtitle: art.subtitle,
          category: art.categoryId.replace('cat-', ''),
          geoRegion: art.geoRegion,
          valueScore: art.valueScore,
          isBreaking: art.isBreaking,
          leadMediaUrl: art.leadMediaUrl,
          keyDevelopments: (art.keyDevelopments as string[]) || [],
        },
        body.platforms
      );

      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Admin Social API POST Error]:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
