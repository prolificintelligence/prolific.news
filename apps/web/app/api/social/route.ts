import { NextResponse } from 'next/server';
import { getRecentSocialDispatches, configuredPlatforms } from '@prolific/jobs';

export const dynamic = 'force-dynamic';

/**
 * Public, read-only view of what has actually been dispatched.
 * Publishing is performed only by the scheduled Inngest job and the authenticated admin app.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 36), 100);
    const platform = searchParams.get('platform')?.toUpperCase();

    let posts = (await getRecentSocialDispatches(limit)).filter((p) => p.status === 'posted');
    if (platform && platform !== 'ALL') {
      posts = posts.filter((p) => p.platform === platform);
    }

    return NextResponse.json({
      ok: true,
      network: 'Prolific News Network',
      activeChannels: configuredPlatforms(),
      posts: posts.map(({ id, platform, articleSlug, targetUrl, externalPostId, postedAt }) => ({
        id,
        platform,
        articleSlug,
        targetUrl,
        postUrl: externalPostId?.startsWith('http') ? externalPostId : null,
        postedAt,
      })),
    });
  } catch (error) {
    console.error('[Social API GET Error]:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load dispatches' }, { status: 500 });
  }
}
