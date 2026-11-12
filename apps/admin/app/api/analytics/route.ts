import { NextResponse } from 'next/server';
import { createDb, sql } from '@prolific/db';
import { requireAdmin } from '../../../lib/auth/server';

export const dynamic = 'force-dynamic';

type AnalyticsRange = 'today' | '24h' | '7d' | '30d' | 'all';

function resolveWindow(rangeParam: string | null): {
  range: AnalyticsRange;
  since: Date;
  prevSince: Date | null;
  granularity: 'hour' | 'day';
} {
  const now = new Date();
  const range: AnalyticsRange =
    rangeParam === 'today' ||
    rangeParam === '24h' ||
    rangeParam === '7d' ||
    rangeParam === '30d' ||
    rangeParam === 'all'
      ? rangeParam
      : '24h';

  if (range === 'today') {
    const startOfTodayUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
    );
    const prevStart = new Date(startOfTodayUtc.getTime() - 24 * 60 * 60 * 1000);
    return { range, since: startOfTodayUtc, prevSince: prevStart, granularity: 'hour' };
  }

  if (range === '24h') {
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prevSince = new Date(since.getTime() - 24 * 60 * 60 * 1000);
    return { range, since, prevSince, granularity: 'hour' };
  }

  if (range === '7d') {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevSince = new Date(since.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { range, since, prevSince, granularity: 'day' };
  }

  if (range === '30d') {
    const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prevSince = new Date(since.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { range, since, prevSince, granularity: 'day' };
  }

  return {
    range: 'all',
    since: new Date('2020-01-01T00:00:00.000Z'),
    prevSince: null,
    granularity: 'day',
  };
}

function pctDelta(current: number, previous: number): number | null {
  if (!Number.isFinite(previous) || previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const { range, since, prevSince, granularity } = resolveWindow(searchParams.get('range'));
    const includeBots = searchParams.get('includeBots') === '1';

    const now = new Date();
    const sinceIso = since.toISOString();
    const prevSinceIso = prevSince ? prevSince.toISOString() : null;
    const botFilter = includeBots ? sql`TRUE` : sql`is_bot = false`;
    const pvBotFilter = includeBots ? sql`TRUE` : sql`pv.is_bot = false`;

    const db = createDb();

    const [
      overviewQuery,
      prevOverviewQuery,
      activeQuery,
      timeSeriesQuery,
      channelsQuery,
      internalQuery,
      utmQuery,
      articlesQuery,
      topPagesQuery,
      categoriesQuery,
      countriesQuery,
      citiesQuery,
      eventsQuery,
      sharePlatformsQuery,
      devicesQuery,
      browsersQuery,
      osesQuery,
      subscribersQuery,
      socialQuery,
    ] = await Promise.all([
      // 1. High-level aggregates (separated human vs bot & engaged vs bounced)
      db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE ${botFilter})::int AS total_views,
          COUNT(*) FILTER (WHERE is_bot = false)::int AS human_views,
          COUNT(*) FILTER (WHERE is_bot = true)::int AS bot_views,
          COUNT(DISTINCT session_id) FILTER (WHERE ${botFilter})::int AS total_sessions,
          COUNT(DISTINCT visitor_hash) FILTER (WHERE ${botFilter})::int AS unique_visitors,
          COUNT(*) FILTER (WHERE ${botFilter} AND dwell_time_seconds >= 2)::int AS engaged_views,
          COUNT(*) FILTER (WHERE ${botFilter} AND dwell_time_seconds < 2)::int AS bounced_views,
          COALESCE(ROUND(AVG(CASE WHEN ${botFilter} AND dwell_time_seconds >= 2 THEN dwell_time_seconds END)), 0)::int AS avg_dwell_seconds,
          COALESCE(ROUND(AVG(CASE WHEN ${botFilter} AND scroll_depth_percent > 0 THEN scroll_depth_percent END)), 0)::int AS avg_scroll_percent
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
      `),
      // 2. Previous comparison window
      prevSinceIso
        ? db.execute(sql`
            SELECT
              COUNT(*) FILTER (WHERE ${botFilter})::int AS prev_views,
              COUNT(DISTINCT session_id) FILTER (WHERE ${botFilter})::int AS prev_sessions,
              COUNT(DISTINCT visitor_hash) FILTER (WHERE ${botFilter})::int AS prev_uniques,
              COALESCE(ROUND(AVG(CASE WHEN ${botFilter} AND dwell_time_seconds >= 2 THEN dwell_time_seconds END)), 0)::int AS prev_dwell
            FROM page_views
            WHERE created_at >= CAST(${prevSinceIso} AS timestamptz)
              AND created_at < CAST(${sinceIso} AS timestamptz)
          `)
        : Promise.resolve({ rows: [] } as any),
      // 3. Real-time active readers (visible/unclosed sessions active in past 5 mins)
      db.execute(sql`
        SELECT COUNT(DISTINCT visitor_hash)::int AS active_readers
        FROM page_views
        WHERE is_bot = false
          AND is_active = true
          AND updated_at >= NOW() - INTERVAL '5 minutes'
      `),
      // 4. Time-series bucketed trend (hourly for today/24h, daily for 7d/30d/all)
      db.execute(sql`
        SELECT
          date_trunc(${granularity}, created_at) AS bucket,
          COUNT(*)::int AS views,
          COUNT(DISTINCT visitor_hash)::int AS uniques,
          COUNT(*) FILTER (WHERE dwell_time_seconds >= 2)::int AS engaged
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${botFilter}
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      // 5. External Acquisition Channels (first-touch attribution, excluding internal SPA hops)
      db.execute(sql`
        SELECT
          COALESCE(NULLIF(first_channel_group, 'INTERNAL'), channel_group) AS channel_group,
          COUNT(*)::int AS views,
          COUNT(DISTINCT visitor_hash)::int AS unique_visitors,
          COALESCE(ROUND(AVG(CASE WHEN dwell_time_seconds >= 2 THEN dwell_time_seconds END)), 0)::int AS avg_dwell
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${botFilter}
          AND COALESCE(NULLIF(first_channel_group, 'INTERNAL'), channel_group) != 'INTERNAL'
        GROUP BY 1
        ORDER BY views DESC
      `),
      // 5b. Internal page transition count (multi-page depth)
      db.execute(sql`
        SELECT COUNT(*)::int AS internal_views
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${botFilter}
          AND channel_group = 'INTERNAL'
      `),
      // 6. UTM Sources (fine-grained social attribution)
      db.execute(sql`
        SELECT
          COALESCE(utm_source, 'none') AS source,
          COALESCE(utm_medium, 'none') AS medium,
          COALESCE(utm_campaign, 'none') AS campaign,
          COUNT(*)::int AS views,
          COUNT(DISTINCT visitor_hash)::int AS unique_visitors
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${botFilter}
          AND utm_source IS NOT NULL
        GROUP BY utm_source, utm_medium, utm_campaign
        ORDER BY views DESC
        LIMIT 12
      `),
      // 7. Top Articles Performance
      db.execute(sql`
        SELECT
          pv.article_slug,
          a.title,
          COALESCE(NULLIF(REPLACE(a.category_id, 'cat-', ''), ''), pv.article_category, 'General') AS category,
          COUNT(*)::int AS views,
          COUNT(DISTINCT pv.visitor_hash)::int AS unique_readers,
          COALESCE(ROUND(AVG(CASE WHEN pv.dwell_time_seconds >= 2 THEN pv.dwell_time_seconds END)), 0)::int AS avg_dwell,
          COALESCE(ROUND(AVG(CASE WHEN pv.scroll_depth_percent > 0 THEN pv.scroll_depth_percent END)), 0)::int AS avg_scroll
        FROM page_views pv
        LEFT JOIN articles a ON a.slug = pv.article_slug
        WHERE pv.created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${pvBotFilter}
          AND pv.article_slug IS NOT NULL
        GROUP BY pv.article_slug, a.title, a.category_id, pv.article_category
        ORDER BY views DESC
        LIMIT 15
      `),
      // 8. Top Pages / Routes (including homepage, /watch, /category/*, /advertise)
      db.execute(sql`
        SELECT
          pathname,
          COUNT(*)::int AS views,
          COUNT(DISTINCT visitor_hash)::int AS unique_visitors,
          COALESCE(ROUND(AVG(CASE WHEN dwell_time_seconds >= 2 THEN dwell_time_seconds END)), 0)::int AS avg_dwell
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${botFilter}
        GROUP BY pathname
        ORDER BY views DESC
        LIMIT 12
      `),
      // 9. Category Performance
      db.execute(sql`
        SELECT
          INITCAP(COALESCE(NULLIF(REPLACE(a.category_id, 'cat-', ''), ''), pv.article_category, 'Uncategorized')) AS category,
          COUNT(*)::int AS views,
          COUNT(DISTINCT pv.visitor_hash)::int AS unique_readers,
          COALESCE(ROUND(AVG(CASE WHEN pv.dwell_time_seconds >= 2 THEN pv.dwell_time_seconds END)), 0)::int AS avg_dwell
        FROM page_views pv
        LEFT JOIN articles a ON a.slug = pv.article_slug
        WHERE pv.created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${pvBotFilter}
          AND (pv.article_category IS NOT NULL OR a.category_id IS NOT NULL)
        GROUP BY 1
        ORDER BY views DESC
        LIMIT 12
      `),
      // 10. Geolocation Breakdown (Country & City)
      db.execute(sql`
        SELECT
          COALESCE(country, 'Unknown') AS country,
          COUNT(*)::int AS views,
          COUNT(DISTINCT visitor_hash)::int AS unique_visitors
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${botFilter}
        GROUP BY country
        ORDER BY views DESC
        LIMIT 10
      `),
      db.execute(sql`
        SELECT
          COALESCE(city, 'Unknown') AS city,
          COALESCE(country, 'Unknown') AS country,
          COUNT(*)::int AS views
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
          AND ${botFilter}
          AND city IS NOT NULL AND city != 'Unknown'
        GROUP BY city, country
        ORDER BY views DESC
        LIMIT 10
      `),
      // 11. Engagement Events
      db.execute(sql`
        SELECT
          event_name,
          COUNT(*)::int AS count,
          COUNT(DISTINCT visitor_hash)::int AS unique_users
        FROM telemetry_events
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
        GROUP BY event_name
        ORDER BY count DESC
      `),
      // 11b. Share platform & interactive metadata drilldown
      db.execute(sql`
        SELECT
          COALESCE(metadata->>'platform', metadata->>'placement', metadata->>'mode', 'other') AS detail,
          event_name,
          COUNT(*)::int AS count
        FROM telemetry_events
        WHERE created_at >= CAST(${sinceIso} AS timestamptz)
        GROUP BY 1, 2
        ORDER BY count DESC
        LIMIT 12
      `),
      // 12. Device, Browser & OS breakdown
      db.execute(sql`
        SELECT device_type, COUNT(*)::int AS views
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz) AND ${botFilter}
        GROUP BY device_type
        ORDER BY views DESC
      `),
      db.execute(sql`
        SELECT COALESCE(browser, 'Unknown') AS browser, COUNT(*)::int AS views
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz) AND ${botFilter}
        GROUP BY 1
        ORDER BY views DESC
        LIMIT 6
      `),
      db.execute(sql`
        SELECT COALESCE(os, 'Unknown') AS os, COUNT(*)::int AS views
        FROM page_views
        WHERE created_at >= CAST(${sinceIso} AS timestamptz) AND ${botFilter}
        GROUP BY 1
        ORDER BY views DESC
        LIMIT 6
      `),
      // 13. Newsletter subscribers & syndicated social dispatches
      db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE is_active = true)::int AS active_subscribers,
          COUNT(*) FILTER (WHERE created_at >= CAST(${sinceIso} AS timestamptz))::int AS new_subscribers
        FROM newsletter_subscribers
      `),
      db.execute(sql`
        SELECT COUNT(*)::int AS dispatched_posts
        FROM social_posts
        WHERE status = 'DISPATCHED'
          AND published_at >= CAST(${sinceIso} AS timestamptz)
      `),
    ]);

    const overview: any = (overviewQuery as any).rows?.[0] || {};
    const prev: any = (prevOverviewQuery as any).rows?.[0] || {};
    const totalViews = Number(overview.total_views || 0);
    const totalSessions = Number(overview.total_sessions || 0);
    const uniqueVisitors = Number(overview.unique_visitors || 0);
    const engagedViews = Number(overview.engaged_views || 0);
    const bouncedViews = Number(overview.bounced_views || 0);
    const avgDwellSeconds = Number(overview.avg_dwell_seconds || 0);
    const pagesPerSession =
      totalSessions > 0 ? Number((totalViews / totalSessions).toFixed(2)) : 0;
    const bounceRatePercent =
      totalViews > 0 ? Math.round((bouncedViews / totalViews) * 100) : 0;

    return NextResponse.json({
      ok: true,
      range,
      includeBots,
      window: {
        start: sinceIso,
        end: now.toISOString(),
        granularity,
      },
      overview: {
        totalViews,
        humanViews: Number(overview.human_views || 0),
        botViews: Number(overview.bot_views || 0),
        totalSessions,
        pagesPerSession,
        uniqueVisitors,
        engagedViews,
        bounceRatePercent,
        avgDwellSeconds,
        avgScrollPercent: Number(overview.avg_scroll_percent || 0),
        activeReaders: Number((activeQuery as any).rows?.[0]?.active_readers || 0),
        internalViews: Number((internalQuery as any).rows?.[0]?.internal_views || 0),
        activeSubscribers: Number((subscribersQuery as any).rows?.[0]?.active_subscribers || 0),
        newSubscribers: Number((subscribersQuery as any).rows?.[0]?.new_subscribers || 0),
        dispatchedSocialPosts: Number((socialQuery as any).rows?.[0]?.dispatched_posts || 0),
        deltas: prevSinceIso
          ? {
              viewsPct: pctDelta(totalViews, Number(prev.prev_views || 0)),
              uniquesPct: pctDelta(uniqueVisitors, Number(prev.prev_uniques || 0)),
              sessionsPct: pctDelta(totalSessions, Number(prev.prev_sessions || 0)),
              dwellPct: pctDelta(avgDwellSeconds, Number(prev.prev_dwell || 0)),
            }
          : null,
      },
      timeSeries: (timeSeriesQuery as any).rows || [],
      channels: (channelsQuery as any).rows || [],
      utmSources: (utmQuery as any).rows || [],
      topArticles: (articlesQuery as any).rows || [],
      topPages: (topPagesQuery as any).rows || [],
      categories: (categoriesQuery as any).rows || [],
      countries: (countriesQuery as any).rows || [],
      cities: (citiesQuery as any).rows || [],
      events: (eventsQuery as any).rows || [],
      eventDetails: (sharePlatformsQuery as any).rows || [],
      devices: (devicesQuery as any).rows || [],
      browsers: (browsersQuery as any).rows || [],
      oses: (osesQuery as any).rows || [],
    });
  } catch (error) {
    console.error('[Admin Analytics API Error]:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
