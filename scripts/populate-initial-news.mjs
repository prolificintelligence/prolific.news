import { neon } from '../packages/db/node_modules/@neondatabase/serverless/index.mjs';
import crypto from 'node:crypto';

const DB_URL = process.env.DATABASE_URL;
const sql = neon(DB_URL);

const CATEGORY_IMAGES = {
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
  Africa: [
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
  ],
  Asia: [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=1200&q=80',
  ],
  LatAm: [
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1200&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  ],
};

function getRandomImage(category, seed) {
  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.General;
  return list[seed % list.length];
}

function cleanHeadline(raw, defaultSource) {
  if (!raw) return { title: '', source: defaultSource };
  let title = raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();

  let source = defaultSource;
  const dashMatch = title.match(/^(.*?)\s+[-–—]\s+([^–—]+)$/);
  if (dashMatch) {
    const candidateSource = dashMatch[2].trim();
    if (candidateSource.length < 35) {
      title = dashMatch[1].trim();
      source = candidateSource;
    }
  }
  return { title, source };
}

function computeScore(title, summary, source, category) {
  let score = 70;
  const combined = `${title} ${summary}`.toUpperCase();
  const highImpactKeywords = [
    'BREAKING', 'URGENT', 'CRISIS', 'SUMMIT', 'CEASEFIRE', 'RATE CUT', 'INFLATION',
    'SANCTIONS', 'PRESIDENTIAL', 'ELECTION', 'HISTORIC', 'SURGE', 'INVESTIGATION',
    'DISASTER', 'MERGER', 'TREATY', 'PENTAGON', 'SECURITY COUNCIL', 'ACCORD',
    'TREASURY', 'STIMULUS', 'WAR', 'TRADE DEAL', 'ALLIANCE', 'SUMMIT', 'ECONOMY'
  ];
  for (const kw of highImpactKeywords) {
    if (combined.includes(kw)) {
      score += 15;
      break;
    }
  }
  const topSources = ['Reuters', 'Associated Press', 'Nikkei Asia', 'AllAfrica', 'UN News', 'SCMP', 'Bloomberg', 'BBC', 'MercoPress'];
  if (topSources.some(s => source.includes(s))) {
    score += 10;
  }

  let geoRegion = 'Global';
  const c = category.toLowerCase();
  if (c.includes('africa')) geoRegion = 'Africa';
  else if (c.includes('asia')) geoRegion = 'Asia';
  else if (c.includes('latam') || c.includes('latin')) geoRegion = 'LatinAmerica';
  else if (c.includes('us')) geoRegion = 'US';

  return { valueScore: Math.min(99, score), priorityTier: score >= 85 ? 1 : 2, geoRegion };
}

const FEEDS = [
  // Tier 1 Primary
  { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', category: 'Politics', source: 'Fox News Politics' },
  { url: 'https://news.google.com/rss/search?q=source:%22Associated%20Press%22+politics&hl=en-US&gl=US&ceid=US:en', category: 'Politics', source: 'Associated Press' },
  { url: 'https://moxie.foxbusiness.com/google-publisher/markets.xml', category: 'Business', source: 'Fox Business' },
  { url: 'https://news.google.com/rss/search?q=source:%22Reuters%22+business&hl=en-US&gl=US&ceid=US:en', category: 'Business', source: 'Reuters' },
  { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'General', source: 'Prolific Wire Desk' },

  // Regional Focus: Africa, Asia, LatAm
  { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', category: 'Africa', source: 'AllAfrica' },
  { url: 'https://news.google.com/rss/search?q=when:24h+Africa+economy+OR+politics&hl=en&gl=US&ceid=US:en', category: 'Africa', source: 'Pan-Africa Wire' },
  { url: 'https://asia.nikkei.com/rss/feed/nar', category: 'Asia', source: 'Nikkei Asia' },
  { url: 'https://www.scmp.com/rss/91/feed', category: 'Asia', source: 'South China Morning Post' },
  { url: 'https://news.google.com/rss/search?q=when:24h+Asia+markets+OR+diplomacy&hl=en&gl=US&ceid=US:en', category: 'Asia', source: 'Asia-Pacific Bureau' },
  { url: 'https://en.mercopress.com/rss', category: 'LatAm', source: 'MercoPress' },
  { url: 'https://news.google.com/rss/search?q=when:24h+Latin+America+economy+OR+trade&hl=en&gl=US&ceid=US:en', category: 'LatAm', source: 'Latin America Bureau' },

  // World, Tech, Sports, Opinion, Lifestyle
  { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'World', source: 'Fox World' },
  { url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', category: 'World', source: 'UN News' },
  { url: 'https://moxie.foxnews.com/google-publisher/tech.xml', category: 'Tech', source: 'Fox Tech' },
  { url: 'https://www.nasa.gov/news-release/feed/', category: 'Tech', source: 'NASA' },
  { url: 'https://moxie.foxnews.com/google-publisher/sports.xml', category: 'Sports', source: 'Fox Sports' },
  { url: 'https://moxie.foxnews.com/google-publisher/opinion.xml', category: 'Opinion', source: 'Fox Opinion' },
  { url: 'https://moxie.foxnews.com/google-publisher/lifestyle.xml', category: 'Lifestyle', source: 'Fox Lifestyle' },
];

const CATEGORY_MAP = {
  politics: 'cat-politics',
  us: 'cat-us',
  opinion: 'cat-opinion',
  entertainment: 'cat-entertainment',
  sports: 'cat-sports',
  lifestyle: 'cat-lifestyle',
  business: 'cat-business',
  world: 'cat-world',
  tech: 'cat-tech',
  africa: 'cat-africa',
  asia: 'cat-asia',
  latam: 'cat-latam',
  general: 'cat-world',
};

async function fetchFeed(config) {
  try {
    const res = await fetch(config.url, {
      headers: {
        'User-Agent': 'ProlificNews-WireHarvester/2.0 (+https://prolific.news)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return [];
    const text = await res.text();
    const itemRegex = /<(?:item|entry)(?:[\s>][\s\S]*?<\/(?:item|entry)>|[\s\S]*?$)/gi;
    const matches = text.match(itemRegex) || [];
    const articles = [];

    for (let i = 0; i < Math.min(matches.length, 12); i++) {
      const block = matches[i];
      const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch =
        block.match(/<link[^>]*href=["']([^"']+)["']/i) ||
        block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch =
        block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
        block.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);
      const pubDateMatch =
        block.match(/<pubDate[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i) ||
        block.match(/<dc:date[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/dc:date>/i);

      const rawTitle = titleMatch ? titleMatch[1].trim() : '';
      if (!rawTitle) continue;

      const { title, source } = cleanHeadline(rawTitle, config.source);
      let link = linkMatch ? linkMatch[1].trim() : '';
      if (link.startsWith('<![CDATA[')) {
        link = link.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      }
      if (!link) continue;

      let summary = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      if (summary.length > 250) summary = summary.slice(0, 240) + '...';
      if (!summary) {
        summary = `Verified dispatch filed via ${source}. Prolific News Network correspondents are tracking live developments.`;
      }

      let pubDate = new Date();
      if (pubDateMatch && pubDateMatch[1]) {
        const parsed = new Date(pubDateMatch[1].trim());
        if (!isNaN(parsed.getTime())) pubDate = parsed;
      }

      const idHash = crypto.createHash('md5').update(`${title}|${link}`).digest('hex').slice(0, 16);
      const id = `wire-${idHash}`;
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 50) + '-' + idHash.slice(0, 6);

      const seed = Math.abs(title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
      const mediaUrl = getRandomImage(config.category, seed);

      const { valueScore, priorityTier, geoRegion } = computeScore(title, summary, source, config.category);

      articles.push({
        id,
        slug,
        title,
        link,
        summary,
        category: config.category,
        mediaUrl,
        pubDate,
        source,
        valueScore,
        priorityTier,
        geoRegion,
      });
    }

    return articles;
  } catch (err) {
    console.warn(`[Ingest] Feed failed: ${config.url}`, err.message);
    return [];
  }
}

async function run() {
  console.log('--- INGESTING LIVE NEWS INTO ISOLATED PROLIFIC NEON DB ---');
  let allItems = [];

  for (const f of FEEDS) {
    const items = await fetchFeed(f);
    console.log(`Fetched ${items.length} items from ${f.source} [${f.category}]`);
    allItems.push(...items);
  }

  // Deduplicate
  const seen = new Set();
  allItems = allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  console.log(`Total unique items gathered: ${allItems.length}`);

  // Insert into wire_items
  let wireInserted = 0;
  for (const item of allItems) {
    try {
      await sql`
        INSERT INTO wire_items (id, slug, source, title, link, summary, category, media_url, value_score, geo_region, pub_date, staged_as_draft, is_archived)
        VALUES (${item.id}, ${item.slug}, ${item.source}, ${item.title}, ${item.link}, ${item.summary}, ${item.category}, ${item.mediaUrl}, ${item.valueScore}, ${item.geoRegion}, ${item.pubDate}, false, false)
        ON CONFLICT (id) DO UPDATE SET value_score = EXCLUDED.value_score, geo_region = EXCLUDED.geo_region;
      `;
      wireInserted++;
    } catch (err) {
      console.warn(`Wire insert error for ${item.id}:`, err.message);
    }
  }
  console.log(`✓ Inserted/updated ${wireInserted} wire items.`);

  // Auto-promote top stories per category
  console.log('\n--- AUTO-PROMOTING STORIES TO ARTICLES TABLE ---');
  const catBuckets = {};
  for (const item of allItems) {
    const cat = item.category.toLowerCase();
    if (!catBuckets[cat]) catBuckets[cat] = [];
    catBuckets[cat].push(item);
  }

  let promotedTotal = 0;
  let topOverallItem = null;
  let topOverallScore = 0;

  for (const [cat, items] of Object.entries(catBuckets)) {
    const categoryId = CATEGORY_MAP[cat] || 'cat-world';
    // Sort items by valueScore desc
    items.sort((a, b) => b.valueScore - a.valueScore);
    const toPromote = items.slice(0, 4);

    for (const item of toPromote) {
      if (item.valueScore > topOverallScore) {
        topOverallScore = item.valueScore;
        topOverallItem = item;
      }

      const artId = `art-${item.id.replace('wire-', '')}`;
      const subtitle = item.summary;
      const keyDevs = JSON.stringify([
        `Dispatch confirmed via ${item.source}.`,
        `Prolific News Network ${item.category} desk actively tracking developments.`,
        `Continuous updates streaming live on Prolific Watch Hub.`,
      ]);
      const tags = JSON.stringify([item.category, item.source, item.geoRegion]);
      const content = `<p class="text-xl font-serif text-gray-800 leading-relaxed font-semibold mb-6">${subtitle}</p><p class="mb-4">PROLIFIC NEWSROOM (${item.geoRegion.toUpperCase()}) — Fast-moving developments are unfolding according to reports confirmed by ${item.source}. Regional authorities and market analysts are monitoring immediate impacts.</p><p class="mb-4">“Our correspondents in the field are following the situation closely as further details emerge,” said senior newsroom editors during a special network briefing.</p><p class="mb-4">Stay with Prolific News Network for continuous updates and live broadcast analysis streaming 24/7 on Prolific Watch Hub.</p>`;

      try {
        await sql`
          INSERT INTO articles (
            id, slug, title, subtitle, key_developments, content, category_id, tags,
            author_id, lead_media_type, lead_media_url, lead_media_caption,
            is_lead_hero, is_breaking, status, read_time_minutes, value_score,
            priority_tier, geo_region, published_at
          ) VALUES (
            ${artId}, ${item.slug}, ${item.title.toUpperCase()}, ${subtitle}, ${keyDevs}::jsonb,
            ${content}, ${categoryId}, ${tags}::jsonb, 'auth-ed-board', 'IMAGE',
            ${item.mediaUrl}, ${item.title + ' — via ' + item.source}, false,
            ${item.valueScore >= 85}, 'PUBLISHED', 3, ${item.valueScore},
            ${item.priorityTier}, ${item.geoRegion}, ${item.pubDate}
          )
          ON CONFLICT (slug) DO UPDATE SET
            value_score = EXCLUDED.value_score,
            priority_tier = EXCLUDED.priority_tier,
            geo_region = EXCLUDED.geo_region;
        `;
        promotedTotal++;
      } catch (err) {
        console.warn(`Article promote error for ${item.slug}:`, err.message);
      }
    }
  }

  // Set lead hero
  if (topOverallItem) {
    const topArtId = `art-${topOverallItem.id.replace('wire-', '')}`;
    await sql`UPDATE articles SET is_lead_hero = false;`;
    await sql`UPDATE articles SET is_lead_hero = true WHERE id = ${topArtId};`;
    console.log(`✓ Set Lead Hero to: [${topOverallItem.category}] ${topOverallItem.title} (Score: ${topOverallScore})`);
  }

  // Seed video_clips with autonomous broadcast loops
  console.log('\n--- SEEDING AUTONOMOUS BROADCAST VIDEO CLIPS ---');
  const clips = [
    {
      id: 'clip-01',
      title: 'Prolific World Dispatch: Geopolitical Accords & Global Trade Corridors',
      durationSeconds: '284',
      streamId: 'prolific-clip-01',
      hlsPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      category: 'World',
      isLiveBroadcast: false
    },
    {
      id: 'clip-02',
      title: 'Prolific Markets Roundup: Central Bank Rates, Tech Valuation & Commodity Shifts',
      durationSeconds: '340',
      streamId: 'prolific-clip-02',
      hlsPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
      category: 'Business',
      isLiveBroadcast: false
    },
    {
      id: 'clip-03',
      title: 'Prolific Africa & Asia Nexus: Infrastructure Corridors and Emerging Tech',
      durationSeconds: '310',
      streamId: 'prolific-clip-03',
      hlsPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      category: 'Africa',
      isLiveBroadcast: false
    }
  ];

  for (const c of clips) {
    try {
      await sql`
        INSERT INTO video_clips (id, title, duration_seconds, stream_id, hls_playback_url, thumbnail_url, category, is_live_broadcast)
        VALUES (${c.id}, ${c.title}, ${c.durationSeconds}, ${c.streamId}, ${c.hlsPlaybackUrl}, ${c.thumbnailUrl}, ${c.category}, ${c.isLiveBroadcast})
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (e) {
      console.warn('Clip seed error:', e.message);
    }
  }

  // Count current database totals
  const [{ count: totalArticles }] = await sql`SELECT count(*)::int FROM articles;`;
  const [{ count: totalWires }] = await sql`SELECT count(*)::int FROM wire_items;`;
  console.log(`\n========================================`);
  console.log(`🎉 DB POPULATION COMPLETE!`);
  console.log(`   Total Articles in DB: ${totalArticles}`);
  console.log(`   Total Wire Items in DB: ${totalWires}`);
  console.log(`========================================`);
}

run().catch(console.error);
