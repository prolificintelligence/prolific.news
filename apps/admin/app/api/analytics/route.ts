import { NextResponse } from 'next/server';
import { createDb, sql } from '@prolific/db';
import { requireAdmin } from '../../../lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';

    let intervalSql = '24 hours';
    if (range === '7d') intervalSql = '7 days';
    else if (range === '30d') intervalSql = '30 days';
    else if (range === 'all') intervalSql = '3650 days';

    const db = createDb();

    // 1. High-level aggregates
    const overviewQuery: any = await db.execute(sql`
      SELECT 
        COUNT(*)::int as total_views,
        COUNT(DISTINCT visitor_hash)::int as unique_visitors,
        COALESCE(ROUND(AVG(CASE WHEN dwell_time_seconds > 0 THEN dwell_time_seconds END)), 0)::int as avg_dwell_seconds,
        COALESCE(ROUND(AVG(CASE WHEN scroll_depth_percent > 0 THEN scroll_depth_percent END)), 0)::int as avg_scroll_percent
      FROM page_views
      WHERE created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
    `);
    const overview = overviewQuery.rows?.[0] || {};

    // 2. Real-time active readers (past 5 minutes)
    const activeQuery: any = await db.execute(sql`
      SELECT COUNT(DISTINCT visitor_hash)::int as active_readers
      FROM page_views
      WHERE updated_at >= NOW() - INTERVAL '5 minutes'
    `);
    const activeReaders = Number(activeQuery.rows?.[0]?.active_readers || 0);

    // 3. Acquisition Channels (Telegram, Bluesky, Mastodon, X, Search, Direct)
    const channelsQuery: any = await db.execute(sql`
      SELECT 
        channel_group,
        COUNT(*)::int as views,
        COUNT(DISTINCT visitor_hash)::int as unique_visitors,
        COALESCE(ROUND(AVG(CASE WHEN dwell_time_seconds > 0 THEN dwell_time_seconds END)), 0)::int as avg_dwell
      FROM page_views
      WHERE created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
      GROUP BY channel_group
      ORDER BY views DESC
    `);
    const channels = channelsQuery.rows || [];

    // 4. UTM Sources (fine-grained social attribution)
    const utmQuery: any = await db.execute(sql`
      SELECT 
        COALESCE(utm_source, 'none') as source,
        COALESCE(utm_medium, 'none') as medium,
        COALESCE(utm_campaign, 'none') as campaign,
        COUNT(*)::int as views,
        COUNT(DISTINCT visitor_hash)::int as unique_visitors
      FROM page_views
      WHERE created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
        AND utm_source IS NOT NULL
      GROUP BY utm_source, utm_medium, utm_campaign
      ORDER BY views DESC
      LIMIT 12
    `);
    const utmSources = utmQuery.rows || [];

    // 5. Top Articles Performance
    const articlesQuery: any = await db.execute(sql`
      SELECT 
        pv.article_slug,
        a.title,
        COALESCE(a.category_id, 'General') as category,
        COUNT(*)::int as views,
        COUNT(DISTINCT pv.visitor_hash)::int as unique_readers,
        COALESCE(ROUND(AVG(CASE WHEN pv.dwell_time_seconds > 0 THEN pv.dwell_time_seconds END)), 0)::int as avg_dwell,
        COALESCE(ROUND(AVG(CASE WHEN pv.scroll_depth_percent > 0 THEN pv.scroll_depth_percent END)), 0)::int as avg_scroll
      FROM page_views pv
      LEFT JOIN articles a ON a.slug = pv.article_slug
      WHERE pv.created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
        AND pv.article_slug IS NOT NULL
      GROUP BY pv.article_slug, a.title, a.category_id
      ORDER BY views DESC
      LIMIT 15
    `);
    const topArticles = articlesQuery.rows || [];

    // 6. Geolocation Breakdown (Country & City)
    const countriesQuery: any = await db.execute(sql`
      SELECT 
        COALESCE(country, 'Unknown') as country,
        COUNT(*)::int as views,
        COUNT(DISTINCT visitor_hash)::int as unique_visitors
      FROM page_views
      WHERE created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
      GROUP BY country
      ORDER BY views DESC
      LIMIT 10
    `);
    const countries = countriesQuery.rows || [];

    const citiesQuery: any = await db.execute(sql`
      SELECT 
        COALESCE(city, 'Unknown') as city,
        COALESCE(country, 'Unknown') as country,
        COUNT(*)::int as views
      FROM page_views
      WHERE created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
        AND city IS NOT NULL AND city != 'Unknown'
      GROUP BY city, country
      ORDER BY views DESC
      LIMIT 10
    `);
    const cities = citiesQuery.rows || [];

    // 7. Engagement Events (Audio briefing, shares, bookmarks, newsletter)
    const eventsQuery: any = await db.execute(sql`
      SELECT 
        event_name,
        COUNT(*)::int as count,
        COUNT(DISTINCT visitor_hash)::int as unique_users
      FROM telemetry_events
      WHERE created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
      GROUP BY event_name
      ORDER BY count DESC
    `);
    const events = eventsQuery.rows || [];

    // 8. Device & Tech breakdown
    const devicesQuery: any = await db.execute(sql`
      SELECT 
        device_type,
        COUNT(*)::int as views
      FROM page_views
      WHERE created_at >= NOW() - ${sql.raw(`INTERVAL '${intervalSql}'`)}
      GROUP BY device_type
      ORDER BY views DESC
    `);
    const devices = devicesQuery.rows || [];

    return NextResponse.json({
      ok: true,
      range,
      overview: {
        totalViews: Number(overview.total_views || 0),
        uniqueVisitors: Number(overview.unique_visitors || 0),
        avgDwellSeconds: Number(overview.avg_dwell_seconds || 0),
        avgScrollPercent: Number(overview.avg_scroll_percent || 0),
        activeReaders,
      },
      channels,
      utmSources,
      topArticles,
      countries,
      cities,
      events,
      devices,
    });
  } catch (error) {
    console.error('[Admin Analytics API Error]:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
