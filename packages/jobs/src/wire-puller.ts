import crypto from 'node:crypto';
import { createDb, wireItems, articles, breakingAlerts, lt, eq, sql, desc, and, or, ilike } from '@prolific/db';

export interface WireArticle {
  id: string;
  slug: string;
  source: string;
  title: string;
  link: string;
  summary: string;
  category: string;
  mediaUrl: string;
  pubDate: string;
  timeAgo?: string;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  Politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  ],
  US: [
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80',
  ],
  Opinion: [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
  ],
  Entertainment: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  ],
  Lifestyle: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
  ],
  Business: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  ],
  World: [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
  ],
  Tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  ],
};

function getRandomImage(category: string, seed: number): string {
  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.General;
  return list[seed % list.length];
}

function calculateTimeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Decode HTML entities and thoroughly strip ALL HTML tags, style, script, and link elements
 */
export function decodeHtmlEntities(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function stripHtml(raw: string): string {
  if (!raw) return '';
  const decoded = decodeHtmlEntities(raw);
  return decoded
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Separate clean headline from source suffix (e.g., "Headline - BBC" -> { title: "Headline", source: "BBC" })
 */
export function cleanHeadline(rawTitle: string, fallbackSource: string = 'Wire Services'): {
  title: string;
  source: string;
} {
  const clean = stripHtml(rawTitle);
  const lastDash = clean.lastIndexOf(' - ');
  if (lastDash > 15) {
    const title = clean.slice(0, lastDash).trim();
    const source = clean.slice(lastDash + 3).trim();
    return { title: title || clean, source: source || fallbackSource };
  }
  return { title: clean, source: fallbackSource };
}

/**
 * Clean or generate an authoritative journalistic subtitle / summary.
 * Avoids Google News <ol><li> lists of duplicate headlines.
 */
export function cleanOrGenerateSummary(
  rawDesc: string,
  headline: string,
  source: string,
  category: string
): string {
  if (
    rawDesc.includes('<ol') ||
    rawDesc.includes('&lt;ol') ||
    rawDesc.includes('<li>') ||
    rawDesc.includes('&lt;li') ||
    rawDesc.includes('href="https://news.google')
  ) {
    return `Developing report via ${source}: ${headline}. International and domestic agencies are assessing immediate developments across ${category.toLowerCase()} sectors.`;
  }

  const clean = stripHtml(rawDesc);
  if (clean.length > 25 && !clean.includes('http') && !clean.includes('target="_blank"')) {
    return clean;
  }

  return `Developing report via ${source}: ${headline}. International and domestic agencies are assessing immediate developments across ${category.toLowerCase()} sectors.`;
}

function slugify(title: string, hash: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
  return `${base}-${hash.slice(0, 8)}`;
}

/**
 * Extract best available media URL from feed block
 */
function extractMediaUrl(itemBlock: string, category: string, index: number): string {
  // 1. Check <media:content url="...">
  const mediaContent = itemBlock.match(/<media:content[^>]+url="([^"]+)"/i);
  if (mediaContent && mediaContent[1]) {
    return mediaContent[1].replace(/&amp;/g, '&');
  }

  // 2. Check <enclosure url="..." />
  const enclosure = itemBlock.match(/<enclosure[^>]+url="([^"]+)"/i);
  if (enclosure && enclosure[1] && /\.(jpg|jpeg|png|webp)/i.test(enclosure[1])) {
    return enclosure[1].replace(/&amp;/g, '&');
  }

  // 3. Check <media:thumbnail url="..." />
  const thumbnail = itemBlock.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (thumbnail && thumbnail[1]) {
    return thumbnail[1].replace(/&amp;/g, '&');
  }

  // 4. Check embedded <img src="..." />
  const embeddedImg = itemBlock.match(/<img[^>]+src="([^"]+)"/i);
  if (embeddedImg && embeddedImg[1]) {
    return embeddedImg[1].replace(/&amp;/g, '&');
  }

  // 5. Fall back to curated category photography
  return getRandomImage(category, index);
}

/**
 * Strip tracking and referral query parameters for clean canonical URLs and stable hashing
 */
export function cleanTrackingParams(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const keysToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (
        key.startsWith('utm_') ||
        key === 'oc' ||
        key === 'fbclid' ||
        key === 'gclid' ||
        key === 'ref' ||
        key === 'source' ||
        key === 'cmpid'
      ) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((k) => parsed.searchParams.delete(k));
    return parsed.toString();
  } catch {
    return rawUrl.split('?')[0];
  }
}

/**
 * Fetch and parse raw RSS/Atom XML feeds with rich media extraction
 */
export async function fetchLiveRssFeed(
  feedUrl: string,
  category: string,
  defaultSource: string = 'Wire Services'
): Promise<WireArticle[]> {
  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(6500),
      headers: {
        'User-Agent': 'ProlificNews-WireHarvester/2.0 (+https://prolific.news)',
      },
      next: { revalidate: 60 },
    } as any);

    if (!res.ok) {
      console.warn(`[Wire] Feed returned HTTP ${res.status}: ${feedUrl}`);
      return [];
    }

    const xml = await res.text();
    // Handle both standard RSS <item> and Atom <entry>
    const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    const items: WireArticle[] = [];
    let match;
    let index = 0;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 25) {
      const itemBlock = match[1];

      const titleMatch = itemBlock.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch =
        itemBlock.match(/<link[^>]*href="([^"]+)"/i) ||
        itemBlock.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const pubDateMatch =
        itemBlock.match(/<(?:pubDate|published|updated)>([\s\S]*?)<\/(?:pubDate|published|updated)>/i);
      const descMatch =
        itemBlock.match(/<(?:description|summary|content[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/i);
      const sourceMatch = itemBlock.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

      if (titleMatch && linkMatch) {
        const rawSource = sourceMatch ? stripHtml(sourceMatch[1]) : defaultSource;
        const { title, source } = cleanHeadline(titleMatch[1], rawSource);
        const rawLink = stripHtml(linkMatch[1]);
        const link = cleanTrackingParams(rawLink);

        // STRICT EXCLUSION: Discard CNN and BBC stories
        if (
          /\bcnn\b/i.test(source) ||
          /\bbbc\b/i.test(source) ||
          /\bcnn\b/i.test(link) ||
          /\bbbc\b/i.test(link) ||
          /\bcnn\b/i.test(title) ||
          /\bbbc\b/i.test(title)
        ) {
          continue;
        }

        const rawPubDate = pubDateMatch ? stripHtml(pubDateMatch[1]) : '';
        const parsedPub = rawPubDate ? new Date(rawPubDate).getTime() : NaN;
        // Clamp missing, invalid, or future-dated timestamps to "now" so feeds can never pin stale or bogus items on top
        const pubDate =
          Number.isNaN(parsedPub) || parsedPub > Date.now() ? new Date().toISOString() : new Date(parsedPub).toISOString();
        const summary = cleanOrGenerateSummary(descMatch ? descMatch[1] : '', title, source, category);
        const mediaUrl = extractMediaUrl(itemBlock, category, index);

        // Derive truly unique ID via SHA-256 hash of canonical link + title
        const hash = crypto.createHash('sha256').update(`${link}-${title}`).digest('hex');
        const id = `wire-${hash.slice(0, 24)}`;
        const slug = slugify(title, hash);

        items.push({
          id,
          slug,
          source,
          title,
          link,
          summary,
          category,
          mediaUrl,
          pubDate,
          timeAgo: calculateTimeAgo(pubDate),
        });
        index++;
      }
    }

    return items;
  } catch (err) {
    console.error(`[Wire] Error fetching feed from ${feedUrl}:`, err);
    return [];
  }
}

export interface FeedConfig {
  url: string;
  category: string;
  source: string;
  tier: 1 | 2 | 3;
}

export const FEED_REGISTRY: FeedConfig[] = [
  // Tier 1: High Velocity (Cadence: 1-2 min) - Politics, Markets, Breaking Desk
  { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', category: 'Politics', source: 'Fox News Politics', tier: 1 },
  { url: 'https://news.google.com/rss/search?q=source:%22Associated%20Press%22+politics&hl=en-US&gl=US&ceid=US:en', category: 'Politics', source: 'Associated Press', tier: 1 },
  { url: 'https://moxie.foxbusiness.com/google-publisher/markets.xml', category: 'Business', source: 'Fox Business', tier: 1 },
  { url: 'https://moxie.foxbusiness.com/google-publisher/economy.xml', category: 'Business', source: 'Fox Business Economy', tier: 1 },
  { url: 'https://news.google.com/rss/search?q=source:%22Reuters%22+business&hl=en-US&gl=US&ceid=US:en', category: 'Business', source: 'Reuters', tier: 1 },
  { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'General', source: 'Fox News Desk', tier: 1 },

  // Tier 2: Global & Core (Cadence: 5 min) - U.S., World, Sports, Entertainment
  { url: 'https://moxie.foxnews.com/google-publisher/us.xml', category: 'US', source: 'Fox News U.S.', tier: 2 },
  { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'World', source: 'Fox World', tier: 2 },
  { url: 'https://news.google.com/rss/search?q=source:%22Reuters%22+world&hl=en-US&gl=US&ceid=US:en', category: 'World', source: 'Reuters', tier: 2 },
  { url: 'https://globalvoices.org/feed/', category: 'World', source: 'Global Voices', tier: 2 },
  { url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', category: 'World', source: 'UN News', tier: 2 },
  { url: 'https://moxie.foxnews.com/google-publisher/sports.xml', category: 'Sports', source: 'Fox Sports', tier: 2 },
  { url: 'https://www.espn.com/espn/rss/news', category: 'Sports', source: 'ESPN', tier: 2 },
  { url: 'https://moxie.foxnews.com/google-publisher/entertainment.xml', category: 'Entertainment', source: 'Fox Entertainment', tier: 2 },

  // Tier 3: In-Depth & Thought Leadership (Cadence: 15 min) - Tech, Science, Opinion, Lifestyle
  { url: 'https://moxie.foxnews.com/google-publisher/opinion.xml', category: 'Opinion', source: 'Fox News Opinion', tier: 3 },
  { url: 'https://theconversation.com/global/articles.atom', category: 'Opinion', source: 'The Conversation', tier: 3 },
  { url: 'https://moxie.foxnews.com/google-publisher/tech.xml', category: 'Tech', source: 'Fox Tech', tier: 3 },
  { url: 'https://moxie.foxnews.com/google-publisher/science.xml', category: 'Tech', source: 'Fox Science', tier: 3 },
  { url: 'https://www.nasa.gov/news-release/feed/', category: 'Tech', source: 'NASA', tier: 3 },
  { url: 'https://news.mongabay.com/feed/', category: 'Tech', source: 'Mongabay', tier: 3 },
  { url: 'https://moxie.foxnews.com/google-publisher/lifestyle.xml', category: 'Lifestyle', source: 'Fox Lifestyle', tier: 3 },
  { url: 'https://moxie.foxnews.com/google-publisher/travel.xml', category: 'Lifestyle', source: 'Fox Travel', tier: 3 },
];

async function fetchAndDeduplicateFeeds(configs: FeedConfig[]): Promise<WireArticle[]> {
  const promises = configs.map((f) => fetchLiveRssFeed(f.url, f.category, f.source));
  const results = await Promise.allSettled(promises);
  const allArticles: WireArticle[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      allArticles.push(...r.value);
    }
  }

  const seen = new Set<string>();
  return allArticles.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function pullTieredNewsFeed(tier: 1 | 2 | 3): Promise<WireArticle[]> {
  const configs = FEED_REGISTRY.filter((f) => f.tier === tier);
  return await fetchAndDeduplicateFeeds(configs);
}

export async function pullCategoryNewsFeed(category: string): Promise<WireArticle[]> {
  const normalized = category.toLowerCase();
  const configs = FEED_REGISTRY.filter((f) => f.category.toLowerCase() === normalized);
  return await fetchAndDeduplicateFeeds(configs.length > 0 ? configs : FEED_REGISTRY.filter((f) => f.tier === 1));
}

export async function pullRealNewsFeed(): Promise<WireArticle[]> {
  return await fetchAndDeduplicateFeeds(FEED_REGISTRY);
}

async function insertWireArticles(wireNews: WireArticle[]): Promise<number> {
  if (wireNews.length === 0) return 0;
  const db = createDb();
  let insertedCount = 0;

  const valuesToInsert = wireNews.map((item) => ({
    id: item.id,
    slug: item.slug,
    source: item.source,
    title: item.title,
    link: item.link,
    summary: item.summary,
    category: item.category,
    mediaUrl: item.mediaUrl,
    pubDate: new Date(item.pubDate),
    stagedAsDraft: false,
    isArchived: false,
  }));

  try {
    await db.insert(wireItems).values(valuesToInsert).onConflictDoNothing();
    insertedCount = valuesToInsert.length;
  } catch (err) {
    console.warn('[Wire] Bulk insert fallback to individual insert:', err);
    for (const item of valuesToInsert) {
      try {
        await db.insert(wireItems).values(item).onConflictDoNothing();
        insertedCount++;
      } catch {
        // continue
      }
    }
  }

  return insertedCount;
}

const CATEGORY_ID_MAP: Record<string, string> = {
  politics: 'cat-politics',
  us: 'cat-us',
  'u.s.': 'cat-us',
  general: 'cat-us',
  opinion: 'cat-opinion',
  entertainment: 'cat-entertainment',
  sports: 'cat-sports',
  lifestyle: 'cat-lifestyle',
  business: 'cat-business',
  world: 'cat-world',
  tech: 'cat-tech',
};

const CATEGORY_SLUGS = ['politics', 'us', 'opinion', 'entertainment', 'sports', 'lifestyle', 'business', 'world', 'tech'];

/**
 * Purge Vercel edge/ISR caches for the homepage and every category hub so fresh news is visible immediately.
 */
export async function revalidateEdge(paths?: string[]): Promise<void> {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://prolific.news';
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    console.warn('[Revalidate] REVALIDATION_SECRET not set; skipping edge purge');
    return;
  }
  const targets = paths && paths.length ? paths : ['/', '/archive', ...CATEGORY_SLUGS.map((s) => `/category/${s}`)];
  await Promise.allSettled(
    targets.map((path) =>
      fetch(`${webUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, secret }),
        signal: AbortSignal.timeout(5000),
      })
    )
  );
}

/**
 * Auto-publish: promote the freshest non-archived wire items of every category into the published
 * `articles` table (idempotent via deterministic ids) so homepage and category hubs never go stale.
 */
export async function autoPromoteFreshWireItems(
  perCategory = 3
): Promise<{ promoted: number; byCategory: Record<string, number> }> {
  const db = createDb();
  const rows = await db
    .select()
    .from(wireItems)
    .where(eq(wireItems.isArchived, false))
    .orderBy(desc(wireItems.pubDate))
    .limit(200);

  const taken: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let promoted = 0;
  const now = Date.now();

  for (const r of rows) {
    const categoryId = CATEGORY_ID_MAP[(r.category || '').toLowerCase()];
    if (!categoryId) continue;
    if ((taken[categoryId] || 0) >= perCategory) continue;
    if (r.pubDate && r.pubDate.getTime() > now + 60 * 60 * 1000) continue; // skip bogus future dates
    taken[categoryId] = (taken[categoryId] || 0) + 1;

    const title = stripHtml(r.title);
    const summary = stripHtml(r.summary || '') || cleanOrGenerateSummary('', title, r.source, r.category);
    const slug = r.slug || slugify(title, r.id.replace('wire-', ''));
    const label = categoryId.replace('cat-', '').toUpperCase();

    try {
      const inserted = await db
        .insert(articles)
        .values({
          id: `art-${r.id.replace('wire-', '')}`,
          slug,
          title: title.toUpperCase(),
          subtitle: summary,
          keyDevelopments: [
            `Dispatch filed via ${r.source}.`,
            `Prolific News Network ${label} desk is tracking developments.`,
            `Rolling analysis streaming live on Prolific Watch Hub.`,
          ],
          content: `<p class="text-xl font-serif text-gray-800 leading-relaxed font-semibold mb-6">${summary}</p><p class="mb-4">Source: <a href="${r.link}" target="_blank" rel="noopener noreferrer">${r.source}</a>. Prolific Newsroom is monitoring this story and will update as more information is verified.</p>`,
          categoryId,
          tags: [r.category, r.source],
          authorId: 'auth-sterling',
          leadMediaType: 'IMAGE',
          leadMediaUrl: r.mediaUrl,
          leadMediaCaption: `${title} — via ${r.source}.`,
          isLeadHero: false,
          isBreaking: false,
          status: 'PUBLISHED',
          readTimeMinutes: 3,
          publishedAt: r.pubDate || new Date(),
        })
        .onConflictDoNothing()
        .returning({ id: articles.id });
      if (inserted.length > 0) {
        promoted++;
        byCategory[categoryId] = (byCategory[categoryId] || 0) + 1;
      }
    } catch (err) {
      console.warn('[AutoPromote] insert failed for', r.id, err);
    }
  }

  // Freshness guard: breaking alerts auto-expire after 6 hours so the banner never shows stale news
  try {
    await db
      .update(breakingAlerts)
      .set({ active: false })
      .where(and(eq(breakingAlerts.active, true), lt(breakingAlerts.publishedAt, new Date(now - 6 * 60 * 60 * 1000))));
  } catch (err) {
    console.warn('[AutoPromote] alert expiry failed:', err);
  }

  return { promoted, byCategory };
}

export async function syncTieredFeedsToNeonDb(tier: 1 | 2 | 3): Promise<{ inserted: number; total: number; tier: number; promoted: number }> {
  const wireNews = await pullTieredNewsFeed(tier);
  const inserted = await insertWireArticles(wireNews);
  let promoted = 0;
  try {
    ({ promoted } = await autoPromoteFreshWireItems(tier === 1 ? 3 : 2));
    if (promoted > 0) await revalidateEdge();
  } catch (err) {
    console.error('[AutoPromote] failed:', err);
  }
  return { inserted, total: wireNews.length, tier, promoted };
}

export async function syncCategoryFeedToNeonDb(category: string): Promise<{ inserted: number; total: number; category: string }> {
  const wireNews = await pullCategoryNewsFeed(category);
  const inserted = await insertWireArticles(wireNews);
  return { inserted, total: wireNews.length, category };
}

export async function syncWireFeedsToNeonDb(): Promise<{ inserted: number; total: number; promoted: number }> {
  const wireNews = await pullRealNewsFeed();
  const inserted = await insertWireArticles(wireNews);
  let promoted = 0;
  try {
    ({ promoted } = await autoPromoteFreshWireItems(4));
    await revalidateEdge();
  } catch (err) {
    console.error('[AutoPromote] failed:', err);
  }
  return { inserted, total: wireNews.length, promoted };
}

/**
 * Content Lifecycle & Archival Engine
 * 1. Archives wire items older than retentionDays (default: 14 days)
 * 2. Archives published articles older than retentionDays (default: 30 days)
 */
export async function archiveOldContent(options?: {
  wireRetentionDays?: number;
  articleRetentionDays?: number;
}): Promise<{ archivedWires: number; archivedArticles: number }> {
  const db = createDb();
  const wireDays = options?.wireRetentionDays ?? 14;
  const articleDays = options?.articleRetentionDays ?? 30;

  const wireCutoff = new Date(Date.now() - wireDays * 24 * 60 * 60 * 1000);
  const articleCutoff = new Date(Date.now() - articleDays * 24 * 60 * 60 * 1000);

  let archivedWires = 0;
  let archivedArticles = 0;

  try {
    const wireRes = await db
      .update(wireItems)
      .set({ isArchived: true, archivedAt: new Date() })
      .where(lt(wireItems.pubDate, wireCutoff));
    archivedWires = (wireRes as any)?.rowCount ?? 0;
  } catch (err) {
    console.error('[Archival] Error archiving old wire items:', err);
  }

  try {
    const articleRes = await db
      .update(articles)
      .set({ status: 'ARCHIVED', updatedAt: new Date(), archivedAt: new Date() })
      .where(lt(articles.publishedAt, articleCutoff));
    archivedArticles = (articleRes as any)?.rowCount ?? 0;
  } catch (err) {
    console.error('[Archival] Error archiving old articles:', err);
  }

  return { archivedWires, archivedArticles };
}

/**
 * Promote a wire item to a full published article in Neon DB
 */
export async function promoteWireItemToArticle(
  item: WireArticle,
  options: { isLeadHero?: boolean; isBreaking?: boolean; authorId?: string } = {}
) {
  const db = createDb();
  const authorId = options.authorId || 'auth-sterling';
  const categoryId = `cat-${item.category.toLowerCase()}`;

  const cleanTitle = stripHtml(item.title);
  const cleanSummary = stripHtml(item.summary) || cleanOrGenerateSummary('', cleanTitle, item.source, item.category);

  const keyDevelopments = [
    `Direct wire dispatches verified through ${item.source} reporting bureaus.`,
    `Prolific News Network national and global security desks are tracking ongoing developments.`,
    `Rolling broadcast analysis and panel discussions streaming live on Prolific Watch Hub.`,
  ];

  const htmlContent = `
    <p class="text-xl font-serif text-gray-800 leading-relaxed font-semibold mb-6">${cleanSummary}</p>
    <p class="mb-4">PROLIFIC NEWSROOM — Breaking reports confirmed by ${item.source} indicate fast-moving developments across critical sectors. Government, market, and international monitors are coordinating responses as situation updates are issued.</p>
    <p class="mb-4">“Our editorial desks are continuously verifying incoming information from correspondents in the field,” stated senior network producers during an emergency broadcast update.</p>
    <p class="mb-4">Stay with Prolific News Network for continuous live video analysis, expert panel commentary, and minute-by-minute updates streaming 24/7 on Prolific Watch Hub.</p>
  `;

  await db
    .insert(articles)
    .values({
      id: `art-${item.id.replace('wire-', '')}`,
      slug: item.slug,
      title: cleanTitle.toUpperCase(),
      subtitle: cleanSummary,
      keyDevelopments,
      content: htmlContent,
      categoryId,
      tags: [item.category, item.source, 'Breaking News'],
      authorId,
      leadMediaType: options.isLeadHero ? 'VIDEO' : 'IMAGE',
      leadMediaUrl: options.isLeadHero
        ? 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8'
        : item.mediaUrl,
      leadMediaCaption: `${cleanTitle} — Reporting via ${item.source} and Prolific Newsroom.`,
      isLeadHero: options.isLeadHero || false,
      isBreaking: options.isBreaking ?? true,
      status: 'PUBLISHED',
      readTimeMinutes: 3,
      publishedAt: new Date(item.pubDate),
    })
    .onConflictDoNothing();

  if (options.isLeadHero || options.isBreaking) {
    await db
      .insert(breakingAlerts)
      .values({
        id: `alert-${Date.now()}`,
        headline: cleanTitle.toUpperCase(),
        url: `/article/${item.slug}`,
        urgency: 'BREAKING',
        active: true,
        publishedAt: new Date(),
      })
      .onConflictDoNothing();
  }
}
