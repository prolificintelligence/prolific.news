import crypto from 'node:crypto';
import { createDb, articles, socialPosts, eq, desc, and, gte, inArray } from '@prolific/db';
import { SocialPlatform, OFFICIAL_SOCIAL_HANDLES } from '@prolific/types';
import { configuredPlatforms, dispatchToPlatform } from './social-channels';

export { OFFICIAL_SOCIAL_HANDLES };
export { configuredPlatforms };

export interface ArticleSocialInput {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  category: string;
  geoRegion?: string | null;
  valueScore?: number | null;
  isBreaking?: boolean | null;
  leadMediaUrl?: string | null;
  keyDevelopments?: string[];
}

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  politics: ['#Politics', '#Policy', '#Geopolitics'],
  us: ['#USNews', '#America'],
  business: ['#Markets', '#Economy', '#Finance'],
  world: ['#WorldNews', '#GlobalAffairs', '#Diplomacy'],
  tech: ['#TechNews', '#AI', '#Innovation'],
  africa: ['#Africa', '#AfricaBusiness', '#PanAfrica'],
  asia: ['#AsiaPacific', '#AsianMarkets', '#ASEAN'],
  latam: ['#LatinAmerica', '#EmergingMarkets', '#Americas'],
  sports: ['#SportsNews', '#Sports'],
  opinion: ['#Analysis', '#Perspective'],
  entertainment: ['#Entertainment', '#Culture'],
  lifestyle: ['#Lifestyle', '#Wellness'],
};

export function generateHashtags(category: string, geoRegion?: string | null, isBreaking?: boolean | null): string[] {
  const base = ['#ProlificNews'];
  if (isBreaking) base.push('#BreakingNews');
  const catClean = category.replace('cat-', '').toLowerCase();
  const catTags = CATEGORY_HASHTAGS[catClean] || ['#News'];
  const combined = [...base, ...catTags.slice(0, 2)];
  if (geoRegion && geoRegion !== 'Global' && !combined.some((t) => t.toLowerCase().includes(geoRegion.toLowerCase()))) {
    combined.push(`#${geoRegion.replace(/\s+/g, '')}`);
  }
  return Array.from(new Set(combined));
}

function webBase(): string {
  return (process.env.NEXT_PUBLIC_WEB_URL || 'https://prolific.news').replace(/\/$/, '');
}

export function craftPlatformCopy(
  article: ArticleSocialInput,
  platform: SocialPlatform
): { postText: string; hashtags: string[]; targetUrl: string } {
  const targetUrl = `${webBase()}/article/${article.slug}?utm_source=${platform.toLowerCase()}&utm_medium=social&utm_campaign=auto_syndication`;
  const hashtags = generateHashtags(article.category, article.geoRegion, article.isBreaking);
  const tagString = hashtags.join(' ');
  const headline = article.title;
  const sub = article.subtitle ? article.subtitle.slice(0, 200) : '';
  // "Breaking" is only used when an editor/pipeline explicitly flagged the story as breaking.
  const prefix = article.isBreaking ? '🚨 BREAKING' : '📰 Prolific News';

  switch (platform) {
    case 'TELEGRAM':
      return {
        postText: `${prefix}\n\n${headline}${sub ? `\n\n${sub}` : ''}\n\nRead: ${targetUrl}\n\n${tagString}`,
        hashtags,
        targetUrl,
      };
    case 'MASTODON':
    case 'BLUESKY':
      return { postText: `${headline}\n\n${targetUrl}\n\n${hashtags.slice(0, 3).join(' ')}`, hashtags: hashtags.slice(0, 3), targetUrl };
    case 'LINKEDIN':
    case 'FACEBOOK':
    case 'THREADS':
    case 'X':
    default:
      return { postText: `${prefix}: ${headline}\n\n${sub}\n\n${targetUrl}\n\n${tagString}`, hashtags, targetUrl };
  }
}

function ogCardUrl(article: ArticleSocialInput): string {
  return `${webBase()}/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(
    article.category.replace('cat-', '').toUpperCase()
  )}`;
}

export interface SyndicationOutcome {
  created: number;
  skipped: number;
  failed: Array<{ platform: SocialPlatform; error: string }>;
  posts: Array<{ id: string; platform: SocialPlatform; handle: string; externalUrl?: string }>;
}

/**
 * Posts one article to each requested platform that is actually configured.
 * A row is claimed (QUEUED) before sending so concurrent/repeated runs can never double-post.
 * Status is DISPATCHED only when the platform API returned a real post id; otherwise FAILED.
 */
export async function syndicateArticleToSocials(
  article: ArticleSocialInput,
  platforms?: SocialPlatform[]
): Promise<SyndicationOutcome> {
  const db = createDb();
  const live = configuredPlatforms();
  const targets = (platforms && platforms.length ? platforms : live).filter((p) => live.includes(p));
  const outcome: SyndicationOutcome = { created: 0, skipped: 0, failed: [], posts: [] };

  for (const platform of targets) {
    const idHash = crypto.createHash('md5').update(`${article.id}|${platform}`).digest('hex').slice(0, 16);
    const postId = `soc-${platform.toLowerCase()}-${idHash}`;
    const handleInfo = OFFICIAL_SOCIAL_HANDLES[platform];
    const { postText, hashtags, targetUrl } = craftPlatformCopy(article, platform);

    // Claim the slot; if it already exists, only retry rows that previously FAILED.
    const claimed = await db
      .insert(socialPosts)
      .values({
        id: postId,
        articleId: article.id,
        articleSlug: article.slug,
        platform,
        handle: handleInfo.handle,
        postText,
        hashtags,
        mediaUrl: ogCardUrl(article),
        targetUrl,
        status: 'QUEUED',
        impressionsEstimate: 0,
      })
      .onConflictDoNothing()
      .returning({ id: socialPosts.id });

    if (claimed.length === 0) {
      const existing = await db.select().from(socialPosts).where(eq(socialPosts.id, postId)).limit(1);
      if (!existing[0] || existing[0].status !== 'FAILED') {
        outcome.skipped++;
        continue;
      }
      await db.update(socialPosts).set({ status: 'QUEUED' }).where(eq(socialPosts.id, postId));
    }

    const result = await dispatchToPlatform(platform, {
      idempotencyKey: postId,
      headline: article.title,
      description: article.subtitle || article.title,
      url: targetUrl,
      text: postText,
      imageUrl: ogCardUrl(article),
    });

    if (result.ok) {
      await db
        .update(socialPosts)
        .set({
          status: 'DISPATCHED',
          externalPostId: result.externalUrl || result.externalId,
          errorMessage: null,
          publishedAt: new Date(),
        })
        .where(eq(socialPosts.id, postId));
      outcome.created++;
      outcome.posts.push({ id: postId, platform, handle: handleInfo.handle, externalUrl: result.externalUrl });
    } else {
      await db
        .update(socialPosts)
        .set({ status: 'FAILED', errorMessage: result.error.slice(0, 500) })
        .where(eq(socialPosts.id, postId));
      outcome.failed.push({ platform, error: result.error });
      console.warn(`[SocialDistributor] ${platform} failed for ${article.slug}: ${result.error}`);
    }
  }

  return outcome;
}

/**
 * Picks the best recent stories that have not yet been posted to every configured channel
 * and posts at most `limit` of them.
 */
export async function autoSyndicateHighValueArticles(
  limit = 3
): Promise<{ articlesProcessed: number; postsCreated: number; failed: number; configured: SocialPlatform[] }> {
  const configured = configuredPlatforms();
  if (configured.length === 0) {
    return { articlesProcessed: 0, postsCreated: 0, failed: 0, configured };
  }

  const db = createDb();
  const since = new Date(Date.now() - 48 * 3600 * 1000);
  const candidates = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, 'PUBLISHED'), gte(articles.publishedAt, since)))
    .orderBy(desc(articles.isBreaking), desc(articles.valueScore), desc(articles.publishedAt))
    .limit(40);

  if (candidates.length === 0) return { articlesProcessed: 0, postsCreated: 0, failed: 0, configured };

  const existing = await db
    .select({ articleId: socialPosts.articleId, platform: socialPosts.platform, status: socialPosts.status })
    .from(socialPosts)
    .where(inArray(socialPosts.articleId, candidates.map((c) => c.id)));

  const done = new Map<string, Set<string>>();
  for (const e of existing) {
    if (e.status === 'FAILED') continue; // failed rows are eligible for retry
    if (!done.has(e.articleId)) done.set(e.articleId, new Set());
    done.get(e.articleId)!.add(e.platform);
  }

  let articlesProcessed = 0;
  let postsCreated = 0;
  let failed = 0;

  for (const art of candidates) {
    if (articlesProcessed >= limit) break;
    const posted = done.get(art.id);
    if (posted && configured.every((p) => posted.has(p))) continue;

    const res = await syndicateArticleToSocials(
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
      configured.filter((p) => !posted?.has(p))
    );
    articlesProcessed++;
    postsCreated += res.created;
    failed += res.failed.length;
  }

  return { articlesProcessed, postsCreated, failed, configured };
}

export async function getRecentSocialDispatches(limit = 36) {
  const db = createDb();
  const rows = await db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt)).limit(limit);

  return rows.map((r) => ({
    id: r.id,
    articleId: r.articleId,
    articleSlug: r.articleSlug,
    platform: r.platform,
    handle: r.handle,
    postCopy: r.postText,
    hashtags: r.hashtags || [],
    mediaUrl: r.mediaUrl,
    targetUrl: r.targetUrl,
    status: r.status === 'DISPATCHED' ? 'posted' : r.status.toLowerCase(),
    externalPostId: r.externalPostId,
    errorMessage: r.errorMessage,
    postedAt: r.status === 'DISPATCHED' && r.publishedAt ? r.publishedAt.toISOString() : null,
    createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
  }));
}
