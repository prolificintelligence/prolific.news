import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createDb, pageViews, telemetryEvents, eq } from '@prolific/db';

export const dynamic = 'force-dynamic';

function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { browser, os };
}

function resolveChannel(utmSource?: string | null, referrer?: string | null): { channel: string; domain: string | null } {
  const source = (utmSource || '').toLowerCase().trim();
  const ref = (referrer || '').toLowerCase().trim();

  let domain: string | null = null;
  if (referrer) {
    try {
      domain = new URL(referrer).hostname;
    } catch {
      domain = referrer.slice(0, 64);
    }
  }

  // 1. Explicit UTM sources
  if (source.includes('telegram')) return { channel: 'TELEGRAM', domain };
  if (source.includes('bluesky')) return { channel: 'BLUESKY', domain };
  if (source.includes('mastodon')) return { channel: 'MASTODON', domain };
  if (source.includes('twitter') || source === 'x') return { channel: 'X', domain };
  if (source.includes('linkedin')) return { channel: 'LINKEDIN', domain };
  if (source.includes('facebook') || source.includes('fb')) return { channel: 'FACEBOOK', domain };
  if (source.includes('reddit')) return { channel: 'REDDIT', domain };
  if (source.includes('whatsapp')) return { channel: 'WHATSAPP', domain };
  if (source.includes('newsletter') || source.includes('email')) return { channel: 'NEWSLETTER', domain };

  // 2. Referrer detection
  if (ref) {
    if (ref.includes('t.me') || ref.includes('telegram.')) return { channel: 'TELEGRAM', domain };
    if (ref.includes('bsky.app') || ref.includes('bluesky.')) return { channel: 'BLUESKY', domain };
    if (ref.includes('mastodon.') || ref.includes('social.vivaldi')) return { channel: 'MASTODON', domain };
    if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return { channel: 'X', domain };
    if (ref.includes('google.')) return { channel: 'GOOGLE_SEARCH', domain };
    if (ref.includes('bing.')) return { channel: 'BING_SEARCH', domain };
    if (ref.includes('duckduckgo.')) return { channel: 'DUCKDUCKGO', domain };
    if (ref.includes('news.ycombinator.com')) return { channel: 'HACKERNEWS', domain };
    if (ref.includes('linkedin.')) return { channel: 'LINKEDIN', domain };
    if (ref.includes('facebook.')) return { channel: 'FACEBOOK', domain };
    if (ref.includes('reddit.')) return { channel: 'REDDIT', domain };
    if (ref.includes('whatsapp.')) return { channel: 'WHATSAPP', domain };
    if (ref.includes('prolific.news') || ref.includes('localhost')) return { channel: 'INTERNAL', domain };
    return { channel: 'REFERRAL', domain };
  }

  return { channel: 'DIRECT', domain };
}

export async function POST(request: NextRequest) {
  try {
    let payload: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const text = await request.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = {};
      }
    }

    const {
      type = 'pageview',
      pageViewId,
      sessionId,
      pathname = '/',
      articleSlug,
      articleCategory,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      dwellTimeSeconds = 0,
      scrollDepthPercent = 0,
      eventName,
      metadata = {},
    } = payload;

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'sessionId required' }, { status: 400 });
    }

    // 1. Resolve client IP and daily pseudonymized hash
    const clientIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      '127.0.0.1';

    const dateStr = new Date().toISOString().slice(0, 10);
    const salt = process.env.TELEMETRY_SALT || 'prolific-salt-2026';
    const visitorHash = crypto
      .createHash('sha256')
      .update(`${clientIp}:${salt}:${dateStr}`)
      .digest('hex')
      .slice(0, 32);

    // 2. Extract edge geolocation (Cloudflare & Vercel headers)
    const country =
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-vercel-ip-country') ||
      null;
    const city =
      request.headers.get('cf-ipcity') ||
      request.headers.get('x-vercel-ip-city') ||
      null;
    const region =
      request.headers.get('cf-region') ||
      request.headers.get('x-vercel-ip-country-region') ||
      null;
    const timezone =
      request.headers.get('cf-timezone') ||
      request.headers.get('x-vercel-ip-timezone') ||
      null;

    // 3. Device & Browser info
    const userAgent = request.headers.get('user-agent') || '';
    const secChUaMobile = request.headers.get('sec-ch-ua-mobile');
    const isMobile =
      secChUaMobile === '?1' || /mobile|android|iphone|ipod/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const { browser, os } = parseUserAgent(userAgent);

    // 4. Acquisition Attribution
    const { channel: channelGroup, domain: referrerDomain } = resolveChannel(
      utmSource,
      referrer
    );

    const db = createDb();

    if (type === 'pageview') {
      const targetId = pageViewId || crypto.randomUUID();

      await db
        .insert(pageViews)
        .values({
          id: targetId,
          visitorHash,
          sessionId,
          pathname,
          articleSlug: articleSlug || null,
          articleCategory: articleCategory || null,
          referrer: referrer || null,
          referrerDomain,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          channelGroup,
          country,
          city,
          region,
          timezone,
          deviceType,
          browser,
          os,
          dwellTimeSeconds: Number(dwellTimeSeconds) || 0,
          scrollDepthPercent: Number(scrollDepthPercent) || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: pageViews.id,
          set: {
            dwellTimeSeconds: Number(dwellTimeSeconds) || 0,
            scrollDepthPercent: Number(scrollDepthPercent) || 0,
            updatedAt: new Date(),
          },
        });

      return NextResponse.json({ ok: true, id: targetId });
    }

    if (type === 'heartbeat' && pageViewId) {
      await db
        .update(pageViews)
        .set({
          dwellTimeSeconds: Number(dwellTimeSeconds) || 0,
          scrollDepthPercent: Number(scrollDepthPercent) || 0,
          updatedAt: new Date(),
        })
        .where(eq(pageViews.id, pageViewId));

      return NextResponse.json({ ok: true });
    }

    if (type === 'event' && eventName) {
      await db.insert(telemetryEvents).values({
        id: crypto.randomUUID(),
        sessionId,
        visitorHash,
        eventName,
        targetSlug: articleSlug || null,
        metadata,
        createdAt: new Date(),
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (error) {
    console.error('[Telemetry API Ingestion Error]:', error);
    // Never fail hard or throw 500 to the browser
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 200 }
    );
  }
}
