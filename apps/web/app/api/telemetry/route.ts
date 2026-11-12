import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createDb, pageViews, telemetryEvents, eq, sql } from '@prolific/db';

export const dynamic = 'force-dynamic';

const BOT_UA_REGEX =
  /bot|crawl|spider|slurp|headless|webdriver|phantom|playwright|puppeteer|selenium|lighthouse|pagespeed|pingdom|uptime|statuscake|curl|wget|python-requests|python-urllib|httpx|aiohttp|axios|node-fetch|undici|go-http-client|scrapy|gptbot|oai-searchbot|chatgpt-user|claudebot|anthropic|perplexitybot|bytespider|ccbot|facebookexternalhit|facebot|twitterbot|telegrambot|slackbot|discordbot|whatsapp|applebot|ahrefs|semrush|mj12bot|dotbot|petalbot|yandex|baiduspider|bingpreview|googleother/i;

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Some privacy browsers omit Origin on same-origin beacons
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return (
      host === 'prolific.news' ||
      host.endsWith('.prolific.news') ||
      host.endsWith('.vercel.app') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

function safeDecodeHeader(val: string | null, maxLen = 128): string | null {
  if (!val) return null;
  try {
    const decoded = decodeURIComponent(val).trim();
    return decoded ? decoded.slice(0, maxLen) : null;
  } catch {
    return val.trim().slice(0, maxLen) || null;
  }
}

function sanitizeStr(val: unknown, maxLen: number): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed ? trimmed.slice(0, maxLen) : null;
}

function clampInt(val: unknown, min: number, max: number): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function sanitizeMetadata(raw: unknown): Record<string, any> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  try {
    const serialized = JSON.stringify(raw);
    if (serialized.length <= 2048) return raw as Record<string, any>;
    return { truncated: true };
  } catch {
    return {};
  }
}

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
      domain = new URL(referrer).hostname.slice(0, 128);
    } catch {
      domain = referrer.slice(0, 64);
    }
  }

  // 1. Explicit UTM sources
  if (source === 'copy_link' || source === 'reader_share') return { channel: 'READER_SHARE', domain };
  if (source.includes('telegram')) return { channel: 'TELEGRAM', domain };
  if (source.includes('bluesky')) return { channel: 'BLUESKY', domain };
  if (source.includes('mastodon')) return { channel: 'MASTODON', domain };
  if (source.includes('twitter') || source === 'x') return { channel: 'X', domain };
  if (source.includes('linkedin')) return { channel: 'LINKEDIN', domain };
  if (source.includes('facebook') || source.includes('fb')) return { channel: 'FACEBOOK', domain };
  if (source.includes('instagram') || source === 'ig') return { channel: 'INSTAGRAM', domain };
  if (source.includes('threads')) return { channel: 'THREADS', domain };
  if (source.includes('reddit')) return { channel: 'REDDIT', domain };
  if (source.includes('whatsapp')) return { channel: 'WHATSAPP', domain };
  if (source.includes('youtube')) return { channel: 'YOUTUBE', domain };
  if (source.includes('tiktok')) return { channel: 'TIKTOK', domain };
  if (source.includes('substack')) return { channel: 'SUBSTACK', domain };
  if (source.includes('newsletter') || source.includes('email')) return { channel: 'NEWSLETTER', domain };
  if (source.includes('chatgpt') || source.includes('perplexity') || source.includes('claude')) {
    return { channel: 'AI_SEARCH', domain };
  }

  // 2. Referrer detection
  if (ref) {
    if (ref.includes('t.me') || ref.includes('telegram.')) return { channel: 'TELEGRAM', domain };
    if (ref.includes('bsky.app') || ref.includes('bluesky.')) return { channel: 'BLUESKY', domain };
    if (ref.includes('mastodon.') || ref.includes('social.vivaldi')) return { channel: 'MASTODON', domain };
    if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return { channel: 'X', domain };
    if (ref.includes('news.google.')) return { channel: 'GOOGLE_NEWS', domain };
    if (ref.includes('google.')) return { channel: 'GOOGLE_SEARCH', domain };
    if (ref.includes('bing.')) return { channel: 'BING_SEARCH', domain };
    if (ref.includes('duckduckgo.')) return { channel: 'DUCKDUCKGO', domain };
    if (
      ref.includes('chatgpt.com') ||
      ref.includes('perplexity.ai') ||
      ref.includes('claude.ai') ||
      ref.includes('gemini.google.com') ||
      ref.includes('copilot.microsoft.com')
    ) {
      return { channel: 'AI_SEARCH', domain };
    }
    if (ref.includes('news.ycombinator.com')) return { channel: 'HACKERNEWS', domain };
    if (ref.includes('linkedin.') || ref.includes('lnkd.in')) return { channel: 'LINKEDIN', domain };
    if (ref.includes('facebook.') || ref.includes('fb.com') || ref.includes('l.facebook.')) return { channel: 'FACEBOOK', domain };
    if (ref.includes('instagram.') || ref.includes('l.instagram.')) return { channel: 'INSTAGRAM', domain };
    if (ref.includes('threads.net')) return { channel: 'THREADS', domain };
    if (ref.includes('reddit.')) return { channel: 'REDDIT', domain };
    if (ref.includes('whatsapp.')) return { channel: 'WHATSAPP', domain };
    if (ref.includes('youtube.') || ref.includes('youtu.be')) return { channel: 'YOUTUBE', domain };
    if (ref.includes('substack.')) return { channel: 'SUBSTACK', domain };
    if (ref.includes('prolific.news') || ref.includes('localhost')) return { channel: 'INTERNAL', domain };
    return { channel: 'REFERRAL', domain };
  }

  return { channel: 'DIRECT', domain };
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ ok: true, ignored: 'origin' });
    }

    // Drop bots & headless crawlers server-side before hitting DB
    const userAgent = request.headers.get('user-agent') || '';
    if (!userAgent || BOT_UA_REGEX.test(userAgent)) {
      return NextResponse.json({ ok: true, ignored: 'bot' });
    }

    let payload: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const text = await request.text();
      if (text.length > 16384) {
        return NextResponse.json({ ok: false, error: 'Payload too large' }, { status: 400 });
      }
      try {
        payload = JSON.parse(text);
      } catch {
        payload = {};
      }
    }

    const type = typeof payload?.type === 'string' ? payload.type : 'pageview';
    const sessionId = sanitizeStr(payload?.sessionId, 64);
    const pageViewId = sanitizeStr(payload?.pageViewId, 64);

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'sessionId required' }, { status: 400 });
    }

    const rawPath = sanitizeStr(payload?.pathname, 512) || '/';
    const pathname = rawPath.startsWith('/') ? rawPath : '/';
    const articleSlug = sanitizeStr(payload?.articleSlug, 255);
    const articleCategory = sanitizeStr(payload?.articleCategory, 64);
    const referrer = sanitizeStr(payload?.referrer, 1024);
    const utmSource = sanitizeStr(payload?.utmSource, 64);
    const utmMedium = sanitizeStr(payload?.utmMedium, 64);
    const utmCampaign = sanitizeStr(payload?.utmCampaign, 128);
    const dwellTimeSeconds = clampInt(payload?.dwellTimeSeconds, 0, 14400);
    const scrollDepthPercent = clampInt(payload?.scrollDepthPercent, 0, 100);
    const isLanding = Boolean(payload?.isLanding);
    const isClosing = Boolean(payload?.isClosing);
    const clientFirstChannel = sanitizeStr(payload?.firstChannelGroup, 32);

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

    // 2. Extract and decode edge geolocation (Cloudflare & Vercel headers)
    const country = sanitizeStr(
      request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country'),
      8
    );
    const city = safeDecodeHeader(
      request.headers.get('cf-ipcity') || request.headers.get('x-vercel-ip-city'),
      128
    );
    const region = safeDecodeHeader(
      request.headers.get('cf-region') || request.headers.get('x-vercel-ip-country-region'),
      64
    );
    const timezone = safeDecodeHeader(
      request.headers.get('cf-timezone') || request.headers.get('x-vercel-ip-timezone'),
      64
    );

    // 3. Device & Browser info
    const secChUaMobile = request.headers.get('sec-ch-ua-mobile');
    const isMobile =
      secChUaMobile === '?1' || /mobile|android|iphone|ipod/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const { browser, os } = parseUserAgent(userAgent);

    // Drop unrecognized scripted UAs that survived header checks
    if (browser === 'Unknown' && os === 'Unknown') {
      return NextResponse.json({ ok: true, ignored: 'unknown-ua' });
    }

    // 4. Acquisition Attribution
    const { channel: channelGroup, domain: referrerDomain } = resolveChannel(
      utmSource,
      referrer
    );
    const resolvedFirstChannel =
      clientFirstChannel && clientFirstChannel !== 'INTERNAL'
        ? clientFirstChannel
        : channelGroup !== 'INTERNAL'
        ? channelGroup
        : null;

    const db = createDb();

    if (type === 'pageview') {
      const targetId = pageViewId || crypto.randomUUID();
      const now = new Date();

      await db
        .insert(pageViews)
        .values({
          id: targetId,
          visitorHash,
          sessionId,
          pathname,
          articleSlug,
          articleCategory,
          referrer,
          referrerDomain,
          utmSource,
          utmMedium,
          utmCampaign,
          channelGroup,
          firstChannelGroup: resolvedFirstChannel,
          isLanding,
          country,
          city,
          region,
          timezone,
          deviceType,
          browser,
          os,
          isBot: false,
          dwellTimeSeconds,
          scrollDepthPercent,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: pageViews.id,
          set: {
            dwellTimeSeconds: sql`GREATEST(${pageViews.dwellTimeSeconds}, ${dwellTimeSeconds})`,
            scrollDepthPercent: sql`GREATEST(${pageViews.scrollDepthPercent}, ${scrollDepthPercent})`,
            updatedAt: now,
          },
        });

      return NextResponse.json({ ok: true, id: targetId, channelGroup });
    }

    if (type === 'heartbeat' && pageViewId) {
      await db
        .update(pageViews)
        .set({
          dwellTimeSeconds: sql`GREATEST(${pageViews.dwellTimeSeconds}, ${dwellTimeSeconds})`,
          scrollDepthPercent: sql`GREATEST(${pageViews.scrollDepthPercent}, ${scrollDepthPercent})`,
          isActive: isClosing ? false : true,
          updatedAt: new Date(),
        })
        .where(eq(pageViews.id, pageViewId));

      return NextResponse.json({ ok: true });
    }

    if (type === 'event') {
      const eventName = sanitizeStr(payload?.eventName, 48);
      if (!eventName || !/^[a-z0-9_]{2,48}$/.test(eventName)) {
        return NextResponse.json({ ok: false, error: 'Invalid eventName' }, { status: 400 });
      }

      await db.insert(telemetryEvents).values({
        id: crypto.randomUUID(),
        sessionId,
        visitorHash,
        eventName,
        targetSlug: articleSlug,
        metadata: sanitizeMetadata(payload?.metadata),
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
