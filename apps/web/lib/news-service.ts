import { createDb, articles, authors, categories, wireItems, breakingAlerts, eq, desc, and, gte, lte, or, ilike, sql } from '@prolific/db';
import { Article, BreakingAlert } from '@prolific/types';

function calculateTimeAgo(date: Date | string | null): string {
  if (!date) return 'Just now';
  try {
    const diffMs = Date.now() - new Date(date).getTime();
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
 * Defensive sanitization to strip ANY residual HTML tags, entities, or <ol><li> links
 */
export function cleanTextSafely(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanSubtitleSafely(
  subtitle: string | null | undefined,
  title: string,
  category: string
): string {
  if (!subtitle) {
    return `Developing report: ${cleanTextSafely(title)}. International and domestic agencies are monitoring key developments.`;
  }
  if (
    subtitle.includes('<ol') ||
    subtitle.includes('&lt;ol') ||
    subtitle.includes('<li>') ||
    subtitle.includes('&lt;li') ||
    subtitle.includes('target="_blank"') ||
    subtitle.includes('href=')
  ) {
    return `Developing report: ${cleanTextSafely(title)}. International and domestic agencies are assessing immediate developments across ${category.toLowerCase()} sectors.`;
  }
  const cleaned = cleanTextSafely(subtitle);
  return cleaned || `Developing report: ${cleanTextSafely(title)}. Key updates developing.`;
}

export function cleanContentSafely(content: string, cleanTitle: string, cleanSub: string): string {
  if (!content) {
    return `<p class="text-xl font-serif text-gray-800 leading-relaxed mb-6 font-semibold">${cleanSub}</p><p>PROLIFIC NEWSROOM — Fast-moving developments are unfolding. Stay with Prolific News Network for continuous updates and live broadcast analysis.</p>`;
  }
  if (content.includes('<ol') || content.includes('&lt;ol') || content.includes('href="https://news.google')) {
    return `
      <p class="text-xl font-serif text-gray-800 leading-relaxed mb-6 font-semibold">${cleanSub}</p>
      <p class="mb-4">PROLIFIC NEWSROOM — Fast-moving developments are unfolding according to reports confirmed by wire correspondents. Government, regulatory, and market monitors are assessing impacts as emergency advisories are issued.</p>
      <p class="mb-4">“Our correspondents in the field are tracking each development as new reports are confirmed,” noted senior network editors during a special broadcast briefing.</p>
      <p class="mb-4">Stay with Prolific News Network for continuous updates and live broadcast analysis streaming 24/7 on Prolific Watch Hub.</p>
    `;
  }
  return content;
}

export async function getLeadAndFeaturedArticles(): Promise<{
  leadArticle: Article;
  centerArticles: Article[];
}> {
  try {
    const db = createDb();
    const dbArticles = await db
      .select({
        article: articles,
        author: authors,
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .where(eq(articles.status, 'PUBLISHED'))
      .orderBy(desc(articles.publishedAt))
      .limit(10);

    if (dbArticles.length > 0) {
      const mapped: Article[] = dbArticles.map(({ article, author }) => {
        const cleanTitle = cleanTextSafely(article.title);
        const category = article.categoryId.replace('cat-', '').replace(/^\w/, (c) => c.toUpperCase());
        const cleanSub = cleanSubtitleSafely(article.subtitle, cleanTitle, category);
        const cleanContent = cleanContentSafely(article.content, cleanTitle, cleanSub);

        return {
          id: article.id,
          slug: article.slug,
          title: cleanTitle,
          subtitle: cleanSub,
          keyDevelopments: (article.keyDevelopments as string[]).map((k) => cleanTextSafely(k)) || [],
          content: cleanContent,
          category,
          tags: (article.tags as string[]) || [],
          author: {
            id: author?.id || 'auth-sterling',
            name: author?.name || 'Jonathan Sterling',
            role: author?.role || 'Senior Newsroom Correspondent',
            avatarUrl: author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          },
          leadMedia: {
            type: (article.leadMediaType as any) || 'IMAGE',
            url: article.leadMediaUrl || '',
            thumbnailUrl: article.leadMediaUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
            caption: cleanTextSafely(article.leadMediaCaption) || '',
          },
          isLeadHero: article.isLeadHero,
          isBreaking: article.isBreaking,
          status: 'PUBLISHED',
          publishedAt: article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString(),
          updatedAt: article.updatedAt ? article.updatedAt.toISOString() : new Date().toISOString(),
          readTimeMinutes: article.readTimeMinutes || 3,
        };
      });

      const heroIndex = mapped.findIndex((a) => a.isLeadHero);
      const leadArticle = heroIndex >= 0 ? mapped[heroIndex] : mapped[0];
      const centerArticles = mapped.filter((a) => a.id !== leadArticle.id);

      return { leadArticle, centerArticles };
    }
  } catch (err) {
    console.error('[NewsService] Error fetching articles from Neon DB:', err);
  }

  // Fallback defaults
  const fallbackLead: Article = {
    id: 'lead-fallback',
    slug: 'allies-reach-historic-consensus-supply-chains',
    title: 'HIGH STAKES ACCORD: ALLIES REACH HISTORIC CONSENSUS ON CRITICAL SUPPLY CHAINS & DEFENSE PACT',
    subtitle: 'Decisive agreement reached during intense overnight marathon session in Geneva, resetting strategic trade terms and security commitments across two hemispheres.',
    keyDevelopments: [
      'Bilateral defense protocol establishes immediate joint logistics command center in Central Europe.',
      'Binding tariff exemptions ratified for strategic semiconductor and rare earth mineral supply lines.',
      'Congressional leaders signal rapid fast-track ratification vote scheduled for Wednesday morning.',
    ],
    content: '<p>Full reporting body goes here...</p>',
    category: 'Politics',
    tags: ['Geneva Summit', 'National Security', 'Defense', 'Congress'],
    author: {
      id: 'auth-sterling',
      name: 'Jonathan Sterling',
      role: 'Chief Washington Correspondent',
    },
    leadMedia: {
      type: 'VIDEO',
      url: 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      caption: 'Jonathan Sterling reports live from the international convention center.',
    },
    isLeadHero: true,
    isBreaking: true,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readTimeMinutes: 4,
  };

  return { leadArticle: fallbackLead, centerArticles: [] };
}

export async function getLatestWireBulletins(limit = 12): Promise<
  Array<{ id: string; title: string; category: string; timeAgo: string; slug: string }>
> {
  try {
    const db = createDb();
    const rows = await db
      .select()
      .from(wireItems)
      .where(eq(wireItems.isArchived, false))
      .orderBy(desc(wireItems.pubDate))
      .limit(limit);

    if (rows.length > 0) {
      return rows.map((r) => {
        const cleanTitle = cleanTextSafely(r.title);
        const slug = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 50) + '-' + r.id.replace('wire-', '').slice(0, 8);

        return {
          id: r.id,
          title: cleanTitle,
          category: r.category,
          timeAgo: calculateTimeAgo(r.pubDate),
          slug,
        };
      });
    }
  } catch (err) {
    console.error('[NewsService] Error fetching wire items from Neon DB:', err);
  }

  return [
    { id: 'w1', title: 'Senate panel greenlights emergency disaster relief appropriations with unanimous vote', category: 'U.S.', timeAgo: '8m ago', slug: 'senate-panel-disaster-relief' },
    { id: 'w2', title: 'Crude benchmarks edge higher as maritime shipping corridors implement new convoy rules', category: 'Markets', timeAgo: '16m ago', slug: 'crude-benchmarks-shipping-rules' },
    { id: 'w3', title: 'Supreme Court agrees to hear landmark commercial patent case on neural computing chips', category: 'Legal', timeAgo: '28m ago', slug: 'supreme-court-neural-patent' },
    { id: 'w4', title: 'Space agency confirms heavy-lift rocket rollout ahead of moon orbital launch window', category: 'Tech', timeAgo: '41m ago', slug: 'heavy-lift-rocket-rollout' },
  ];
}

export async function getActiveBreakingAlert(): Promise<BreakingAlert | null> {
  try {
    const db = createDb();
    const [row] = await db
      .select()
      .from(breakingAlerts)
      .where(eq(breakingAlerts.active, true))
      .orderBy(desc(breakingAlerts.publishedAt))
      .limit(1);

    if (row) {
      return {
        id: row.id,
        headline: cleanTextSafely(row.headline),
        url: row.url,
        urgency: row.urgency as any,
        active: row.active,
        publishedAt: row.publishedAt.toISOString(),
      };
    }
  } catch (err) {
    console.error('[NewsService] Error fetching breaking alert from Neon DB:', err);
  }

  return null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const db = createDb();
    // 1. Check articles table
    const [row] = await db
      .select({
        article: articles,
        author: authors,
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .where(eq(articles.slug, slug))
      .limit(1);

    if (row) {
      const { article, author } = row;
      const cleanTitle = cleanTextSafely(article.title);
      const category = article.categoryId.replace('cat-', '').replace(/^\w/, (c) => c.toUpperCase());
      const cleanSub = cleanSubtitleSafely(article.subtitle, cleanTitle, category);
      const cleanContent = cleanContentSafely(article.content, cleanTitle, cleanSub);

      return {
        id: article.id,
        slug: article.slug,
        title: cleanTitle,
        subtitle: cleanSub,
        keyDevelopments: (article.keyDevelopments as string[]).map((k) => cleanTextSafely(k)) || [],
        content: cleanContent,
        category,
        tags: (article.tags as string[]) || [],
        author: {
          id: author?.id || 'auth-sterling',
          name: author?.name || 'Jonathan Sterling',
          role: author?.role || 'Senior Newsroom Correspondent',
          avatarUrl: author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        },
        leadMedia: {
          type: (article.leadMediaType as any) || 'IMAGE',
          url: article.leadMediaUrl || '',
          thumbnailUrl: article.leadMediaUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
          caption: cleanTextSafely(article.leadMediaCaption) || '',
        },
        isLeadHero: article.isLeadHero,
        isBreaking: article.isBreaking,
        status: 'PUBLISHED',
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString(),
        updatedAt: article.updatedAt ? article.updatedAt.toISOString() : new Date().toISOString(),
        readTimeMinutes: article.readTimeMinutes || 3,
      };
    }

    // 2. Direct indexed lookup on wire_items table by slug or ID
    let [matchedWire] = await db
      .select()
      .from(wireItems)
      .where(eq(wireItems.slug, slug))
      .limit(1);

    if (!matchedWire && slug.startsWith('wire-')) {
      const [byId] = await db
        .select()
        .from(wireItems)
        .where(eq(wireItems.id, slug))
        .limit(1);
      matchedWire = byId;
    }

    if (matchedWire) {
      const cleanTitle = cleanTextSafely(matchedWire.title);
      const cleanSub = cleanSubtitleSafely(matchedWire.summary, cleanTitle, matchedWire.category);
      const cleanContent = cleanContentSafely('', cleanTitle, cleanSub);

      return {
        id: matchedWire.id,
        slug,
        title: cleanTitle.toUpperCase(),
        subtitle: cleanSub,
        keyDevelopments: [
          `Real-time wire dispatch filed by ${matchedWire.source}.`,
          `Verified and monitored by Prolific News Network editorial desks.`,
          `Live video coverage streaming 24/7 on the network’s digital watch platform.`,
        ],
        content: cleanContent,
        category: matchedWire.category,
        tags: [matchedWire.category, matchedWire.source, 'Live Wire'],
        author: {
          id: 'auth-sterling',
          name: `${matchedWire.source} News Service`,
          role: 'Wire Correspondent',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        },
        leadMedia: {
          type: 'IMAGE',
          url: matchedWire.mediaUrl || '',
          thumbnailUrl: matchedWire.mediaUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
          caption: `${cleanTitle} — Dispatches via ${matchedWire.source}.`,
        },
        isLeadHero: false,
        isBreaking: true,
        status: 'PUBLISHED',
        publishedAt: matchedWire.pubDate ? matchedWire.pubDate.toISOString() : new Date().toISOString(),
        updatedAt: matchedWire.createdAt ? matchedWire.createdAt.toISOString() : new Date().toISOString(),
        readTimeMinutes: 3,
      };
    }
  } catch (err) {
    console.error('[NewsService] Error fetching article by slug:', err);
  }

  return null;
}

export interface CategoryPageData {
  categoryInfo: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  leadArticle: Article;
  secondaryArticles: Article[];
  wireBulletins: Array<{ id: string; title: string; category: string; timeAgo: string; slug: string }>;
}

export const CATEGORY_METADATA: Record<string, { id: string; name: string; description: string; dbCategory: string }> = {
  politics: {
    id: 'cat-politics',
    name: 'Politics',
    description: 'Capitol Hill legislative battles, executive branch decisions, federal policy, and 2026 midterm election coverage.',
    dbCategory: 'Politics',
  },
  us: {
    id: 'cat-us',
    name: 'U.S. News',
    description: 'National crime investigations, state legislatures, public safety, federal judicial rulings, and domestic reports.',
    dbCategory: 'US',
  },
  opinion: {
    id: 'cat-opinion',
    name: 'Opinion',
    description: 'In-depth editorial commentary, syndicated columns, economic analysis, and thought leadership from senior contributors.',
    dbCategory: 'Opinion',
  },
  entertainment: {
    id: 'cat-entertainment',
    name: 'Entertainment',
    description: 'Hollywood cinema, primetime television broadcasts, celebrity profiles, arts, and cultural commentary.',
    dbCategory: 'Entertainment',
  },
  sports: {
    id: 'cat-sports',
    name: 'Sports',
    description: 'NFL, NBA, MLB, collegiate athletics, championship coverage, player transfers, and real-time scores.',
    dbCategory: 'Sports',
  },
  lifestyle: {
    id: 'cat-lifestyle',
    name: 'Lifestyle',
    description: 'American culture, personal wellness, culinary arts, family, personal finance, travel, and style.',
    dbCategory: 'Lifestyle',
  },
  business: {
    id: 'cat-business',
    name: 'Business & Markets',
    description: 'Wall Street ticker updates, Federal Reserve interest rates, commodities, energy infrastructure, and corporate earnings.',
    dbCategory: 'Business',
  },
  world: {
    id: 'cat-world',
    name: 'World News',
    description: 'International conflict, foreign policy, NATO security alliances, trade routes, diplomacy, and global crisis reporting.',
    dbCategory: 'World',
  },
  tech: {
    id: 'cat-tech',
    name: 'Tech & Science',
    description: 'Artificial intelligence innovation, NASA aerospace missions, cybersecurity, consumer hardware, and biotechnology.',
    dbCategory: 'Tech',
  },
};

export async function getArticlesByCategory(categorySlug: string): Promise<CategoryPageData> {
  const normalizedSlug = categorySlug.toLowerCase().trim();
  const meta = CATEGORY_METADATA[normalizedSlug] || {
    id: `cat-${normalizedSlug}`,
    name: normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1),
    description: `Comprehensive news, live reporting, and analysis across ${normalizedSlug}.`,
    dbCategory: normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1),
  };

  const categoryInfo = {
    id: meta.id,
    name: meta.name,
    slug: normalizedSlug,
    description: meta.description,
  };

  try {
    const db = createDb();
    // 1. Query published articles for this category
    const articleRows = await db
      .select({
        article: articles,
        author: authors,
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .where(and(eq(articles.status, 'PUBLISHED'), eq(articles.categoryId, meta.id)))
      .orderBy(desc(articles.publishedAt))
      .limit(30);

    // Filter by category ID or matching category
    const matchingArticles = articleRows
      .filter(({ article }) => {
        const catId = (article.categoryId || '').toLowerCase();
        return (
          catId === meta.id ||
          catId.includes(normalizedSlug) ||
          (article.tags as string[] || []).some((t) => t.toLowerCase() === meta.name.toLowerCase() || t.toLowerCase() === normalizedSlug)
        );
      })
      .map(({ article, author }) => {
        const cleanTitle = cleanTextSafely(article.title);
        const cleanSub = cleanSubtitleSafely(article.subtitle, cleanTitle, meta.name);
        const cleanContent = cleanContentSafely(article.content, cleanTitle, cleanSub);

        return {
          id: article.id,
          slug: article.slug,
          title: cleanTitle,
          subtitle: cleanSub,
          keyDevelopments: (article.keyDevelopments as string[] || []).map((k) => cleanTextSafely(k)),
          content: cleanContent,
          category: meta.name,
          tags: (article.tags as string[]) || [meta.name],
          author: {
            id: author?.id || 'auth-sterling',
            name: author?.name || 'Jonathan Sterling',
            role: author?.role || 'Senior Newsroom Correspondent',
            avatarUrl: author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          },
          leadMedia: {
            type: (article.leadMediaType as any) || 'IMAGE',
            url: article.leadMediaUrl || '',
            thumbnailUrl: article.leadMediaUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
            caption: cleanTextSafely(article.leadMediaCaption) || '',
          },
          isLeadHero: article.isLeadHero,
          isBreaking: article.isBreaking,
          status: 'PUBLISHED' as const,
          publishedAt: article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString(),
          updatedAt: article.updatedAt ? article.updatedAt.toISOString() : new Date().toISOString(),
          readTimeMinutes: article.readTimeMinutes || 3,
        };
      });

    // 2. Query wire items for this category to ensure zero empty states
    const wireRows = await db
      .select()
      .from(wireItems)
      .where(eq(wireItems.isArchived, false))
      .orderBy(desc(wireItems.pubDate))
      .limit(60);

    const categoryWireRows = wireRows.filter((w) => {
      const c = (w.category || '').toLowerCase();
      return c === normalizedSlug || c === meta.dbCategory.toLowerCase() || c === meta.name.toLowerCase();
    });

    const wireBulletins = (categoryWireRows.length > 0 ? categoryWireRows : wireRows.slice(0, 8)).map((r) => {
      const cleanTitle = cleanTextSafely(r.title);
      const slug = cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 50) + '-' + r.id.replace('wire-', '').slice(0, 8);

      return {
        id: r.id,
        title: cleanTitle,
        category: r.category || meta.name,
        timeAgo: calculateTimeAgo(r.pubDate),
        slug,
      };
    });

    // If matching published articles exist
    if (matchingArticles.length > 0) {
      return {
        categoryInfo,
        leadArticle: matchingArticles[0],
        secondaryArticles: matchingArticles.slice(1, 9),
        wireBulletins,
      };
    }

    // Fallback: If no articles exist in this category yet, promote wire items seamlessly into articles
    if (categoryWireRows.length > 0) {
      const promoted: Article[] = categoryWireRows.map((wire, idx) => {
        const cleanTitle = cleanTextSafely(wire.title);
        const cleanSub = cleanSubtitleSafely(wire.summary, cleanTitle, meta.name);
        const cleanContent = cleanContentSafely('', cleanTitle, cleanSub);
        const slug = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 50) + '-' + wire.id.replace('wire-', '').slice(0, 8);

        return {
          id: wire.id,
          slug,
          title: cleanTitle.toUpperCase(),
          subtitle: cleanSub,
          keyDevelopments: [
            `Direct wire dispatches verified through ${wire.source}.`,
            `Prolific News Network ${meta.name} desk actively tracking developments.`,
            `Rolling broadcast analysis available on the 24/7 digital live stream.`,
          ],
          content: cleanContent,
          category: meta.name,
          tags: [meta.name, wire.source, 'Live Coverage'],
          author: {
            id: 'auth-sterling',
            name: `${wire.source} Reporting Desk`,
            role: `${meta.name} Correspondent`,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          },
          leadMedia: {
            type: idx === 0 ? 'VIDEO' : 'IMAGE',
            url: idx === 0
              ? 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8'
              : wire.mediaUrl || '',
            thumbnailUrl: wire.mediaUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
            caption: `${cleanTitle} — Verified via ${wire.source}.`,
          },
          isLeadHero: idx === 0,
          isBreaking: true,
          status: 'PUBLISHED' as const,
          publishedAt: wire.pubDate ? wire.pubDate.toISOString() : new Date().toISOString(),
          updatedAt: wire.createdAt ? wire.createdAt.toISOString() : new Date().toISOString(),
          readTimeMinutes: 3,
        };
      });

      return {
        categoryInfo,
        leadArticle: promoted[0],
        secondaryArticles: promoted.slice(1, 9),
        wireBulletins,
      };
    }
  } catch (err) {
    console.error(`[NewsService] Error loading category ${categorySlug}:`, err);
  }

  // Pure fallback to guarantee zero empty states even if DB is offline
  const fallbackLead: Article = {
    id: `lead-fallback-${normalizedSlug}`,
    slug: `${normalizedSlug}-developing-coverage-special-report`,
    title: `${meta.name.toUpperCase()}: SPECIAL IN-DEPTH REPORT AND DEVELOPING WIRE DISPATCHES`,
    subtitle: `Continuous monitoring and expert panel analysis across all critical ${meta.name.toLowerCase()} sectors, policy updates, and emerging breaking developments.`,
    keyDevelopments: [
      `Prolific News Network ${meta.name} editorial desk actively following new dispatches.`,
      `Situation updates confirmed through verified correspondent bureaus.`,
      `Live continuous video streaming 24/7 on the network’s Watch Hub.`,
    ],
    content: `<p class="text-xl font-serif text-gray-800 leading-relaxed font-semibold mb-6">Stay with Prolific News Network for continuous, real-time coverage of ${meta.name} developing stories and live broadcasts.</p>`,
    category: meta.name,
    tags: [meta.name, 'Developing Story'],
    author: {
      id: 'auth-sterling',
      name: 'Prolific Editorial Board',
      role: 'Senior Newsroom Staff',
    },
    leadMedia: {
      type: 'VIDEO',
      url: 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      caption: `Prolific News Network live stream covering ${meta.name} developments.`,
    },
    isLeadHero: true,
    isBreaking: true,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readTimeMinutes: 3,
  };

  return {
    categoryInfo,
    leadArticle: fallbackLead,
    secondaryArticles: [],
    wireBulletins: [],
  };
}

export interface ArchiveQueryOptions {
  category?: string;
  year?: number;
  month?: number;
  day?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getArchivedArticles(options: ArchiveQueryOptions = {}): Promise<{
  articles: Article[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const db = createDb();
    const limit = options.limit || 18;
    const page = Math.max(1, options.page || 1);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.category && options.category.toLowerCase() !== 'all') {
      const catId = `cat-${options.category.toLowerCase()}`;
      conditions.push(eq(articles.categoryId, catId));
    }

    if (options.year) {
      const startMonth = options.month ? options.month - 1 : 0;
      const startDay = options.day || 1;
      const startDate = new Date(options.year, startMonth, startDay);
      let endDate: Date;
      if (options.day && options.month) {
        endDate = new Date(options.year, options.month - 1, options.day, 23, 59, 59, 999);
      } else if (options.month) {
        endDate = new Date(options.year, options.month, 0, 23, 59, 59, 999);
      } else {
        endDate = new Date(options.year, 11, 31, 23, 59, 59, 999);
      }
      conditions.push(gte(articles.publishedAt, startDate));
      conditions.push(lte(articles.publishedAt, endDate));
    }

    // Push search directly into SQL query
    if (options.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      conditions.push(or(ilike(articles.title, term), ilike(articles.subtitle, term)));
    }

    // Accurate SQL total count
    let countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(articles);

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const [countRow] = await countQuery;
    const total = countRow?.count ?? 0;

    let query = db
      .select({
        article: articles,
        author: authors,
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    let mapped: Article[] = rows.map(({ article, author }) => {
      const cleanTitle = cleanTextSafely(article.title);
      const category = article.categoryId.replace('cat-', '').replace(/^\w/, (c) => c.toUpperCase());
      const cleanSub = cleanSubtitleSafely(article.subtitle, cleanTitle, category);
      const cleanContent = cleanContentSafely(article.content, cleanTitle, cleanSub);

      return {
        id: article.id,
        slug: article.slug,
        title: cleanTitle,
        subtitle: cleanSub,
        keyDevelopments: (article.keyDevelopments as string[]).map((k) => cleanTextSafely(k)) || [],
        content: cleanContent,
        category,
        tags: (article.tags as string[]) || [],
        author: {
          id: author?.id || 'auth-sterling',
          name: author?.name || 'Prolific Editorial Archive',
          role: author?.role || 'Senior Newsroom Staff',
          avatarUrl: author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        },
        leadMedia: {
          type: (article.leadMediaType as any) || 'IMAGE',
          url: article.leadMediaUrl || '',
          thumbnailUrl: article.leadMediaUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
          caption: cleanTextSafely(article.leadMediaCaption) || '',
        },
        isLeadHero: false,
        isBreaking: false,
        status: (article.status as any) || 'ARCHIVED',
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString(),
        updatedAt: article.updatedAt ? article.updatedAt.toISOString() : new Date().toISOString(),
        readTimeMinutes: article.readTimeMinutes || 3,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;
    return { articles: mapped, total, totalPages, currentPage: page };
  } catch (err) {
    console.error('[NewsService] Error fetching archived articles:', err);
    return { articles: [], total: 0, totalPages: 1, currentPage: 1 };
  }
}
