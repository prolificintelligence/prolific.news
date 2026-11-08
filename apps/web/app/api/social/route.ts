import { NextResponse } from 'next/server';
import {
  getRecentSocialDispatches,
  syndicateArticleToSocials,
  autoSyndicateHighValueArticles,
  OFFICIAL_SOCIAL_HANDLES,
} from '@prolific/jobs';
import { createDb, articles, eq } from '@prolific/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 36), 100);
    const platform = searchParams.get('platform')?.toUpperCase();

    let posts = await getRecentSocialDispatches(limit);
    if (platform && platform !== 'ALL') {
      posts = posts.filter((p) => p.platform === platform);
    }

    const platformBreakdown = Object.keys(OFFICIAL_SOCIAL_HANDLES).map((key) => {
      const handleInfo =
        OFFICIAL_SOCIAL_HANDLES[key as keyof typeof OFFICIAL_SOCIAL_HANDLES];
      const count = posts.filter((p) => p.platform === key).length;
      const totalImpressions = posts
        .filter((p) => p.platform === key)
        .reduce((acc, p) => acc + (p.impressions || 0), 0);
      return {
        platform: key,
        ...handleInfo,
        recentPosts: count,
        impressions: totalImpressions,
      };
    });

    return NextResponse.json({
      ok: true,
      network: 'Prolific News Network',
      officialHandles: OFFICIAL_SOCIAL_HANDLES,
      platformBreakdown,
      posts,
    });
  } catch (error) {
    console.error('[Social API GET Error]:', error);
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
        mode: 'auto-syndicate',
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

      return NextResponse.json({
        ok: true,
        mode: 'single-article',
        articleSlug: art.slug,
        ...result,
      });
    }

    return NextResponse.json(
      { ok: false, error: 'Provide { action: "auto" } or { articleId }' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Social API POST Error]:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
