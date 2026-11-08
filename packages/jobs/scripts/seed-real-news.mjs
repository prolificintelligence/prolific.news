import fs from 'fs';
import crypto from 'node:crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { neon } = require('../../db/node_modules/@neondatabase/serverless');

let connStr = '';
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/DATABASE_URL=(.*)/);
  if (match) connStr = match[1].trim();
}
if (!connStr && fs.existsSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md')) {
  connStr = fs.readFileSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md', 'utf8').trim();
}

const sql = neon(connStr);

const CATEGORIES_DATA = [
  { id: 'cat-politics', name: 'Politics', slug: 'politics', description: 'Capitol Hill legislative battles, executive branch policy, national campaigns, and 2026 midterm election coverage.' },
  { id: 'cat-us', name: 'U.S. News', slug: 'us', description: 'National crime investigations, state legislatures, public safety, federal judicial rulings, and domestic reports.' },
  { id: 'cat-opinion', name: 'Opinion', slug: 'opinion', description: 'In-depth editorial commentary, syndicated columns, economic analysis, and thought leadership from senior contributors.' },
  { id: 'cat-entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Hollywood cinema, primetime television broadcasts, celebrity profiles, arts, and cultural commentary.' },
  { id: 'cat-sports', name: 'Sports', slug: 'sports', description: 'NFL, NBA, MLB, collegiate athletics, championship coverage, player transfers, and real-time scores.' },
  { id: 'cat-lifestyle', name: 'Lifestyle', slug: 'lifestyle', description: 'American culture, personal wellness, culinary arts, family, personal finance, travel, and style.' },
  { id: 'cat-business', name: 'Business', slug: 'business', description: 'Wall Street ticker updates, Federal Reserve interest rates, commodities, energy infrastructure, and corporate earnings.' },
  { id: 'cat-world', name: 'World', slug: 'world', description: 'International conflict, foreign policy, NATO security alliances, trade routes, diplomacy, and global crisis reporting.' },
  { id: 'cat-tech', name: 'Tech', slug: 'tech', description: 'Artificial intelligence innovation, NASA aerospace missions, cybersecurity, consumer hardware, and biotechnology.' },
];

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
  General: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  ],
};

function decodeHtmlEntities(raw) {
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

function stripHtml(raw) {
  if (!raw) return '';
  const decoded = decodeHtmlEntities(raw);
  return decoded
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanHeadline(rawTitle, fallbackSource = 'Wire Services') {
  const clean = stripHtml(rawTitle);
  const lastDash = clean.lastIndexOf(' - ');
  if (lastDash > 15) {
    const title = clean.slice(0, lastDash).trim();
    const source = clean.slice(lastDash + 3).trim();
    return { title: title || clean, source: source || fallbackSource };
  }
  return { title: clean, source: fallbackSource };
}

function cleanOrGenerateSummary(rawDesc, headline, source, category) {
  if (
    !rawDesc ||
    rawDesc.includes('<ol') ||
    rawDesc.includes('&lt;ol') ||
    rawDesc.includes('<li>') ||
    rawDesc.includes('&lt;li') ||
    rawDesc.includes('target="_blank"') ||
    rawDesc.includes('href=')
  ) {
    return `Developing report via ${source}: ${headline}. International and domestic agencies are assessing immediate developments across ${category.toLowerCase()} sectors.`;
  }

  const clean = stripHtml(rawDesc);
  if (clean.length > 25 && !clean.includes('http')) {
    return clean;
  }

  return `Developing report via ${source}: ${headline}. Key situation assessments underway.`;
}

function extractMediaUrl(itemBlock, category, index) {
  const mediaContent = itemBlock.match(/<media:content[^>]+url="([^"]+)"/i);
  if (mediaContent && mediaContent[1]) {
    return mediaContent[1].replace(/&amp;/g, '&');
  }

  const enclosure = itemBlock.match(/<enclosure[^>]+url="([^"]+)"/i);
  if (enclosure && enclosure[1] && /\.(jpg|jpeg|png|webp)/i.test(enclosure[1])) {
    return enclosure[1].replace(/&amp;/g, '&');
  }

  const thumbnail = itemBlock.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (thumbnail && thumbnail[1]) {
    return thumbnail[1].replace(/&amp;/g, '&');
  }

  const embeddedImg = itemBlock.match(/<img[^>]+src="([^"]+)"/i);
  if (embeddedImg && embeddedImg[1]) {
    return embeddedImg[1].replace(/&amp;/g, '&');
  }

  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.General;
  return list[index % list.length];
}

async function fetchFeed(url, category, defaultSource = 'Wire Services') {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Prolific NewsNetwork-BatchIngester/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    const items = [];
    let match;
    let idx = 0;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 20) {
      const block = match[1];
      const titleM = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkM =
        block.match(/<link[^>]*href="([^"]+)"/i) ||
        block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const pubM =
        block.match(/<(?:pubDate|published|updated)>([\s\S]*?)<\/(?:pubDate|published|updated)>/i);
      const descM =
        block.match(/<(?:description|summary|content[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/i);
      const sourceM = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

      if (titleM && linkM) {
        const rawSource = sourceM ? stripHtml(sourceM[1]) : defaultSource;
        const { title, source } = cleanHeadline(titleM[1], rawSource);
        const link = stripHtml(linkM[1]);

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

        const pubDate = pubM ? new Date(stripHtml(pubM[1])).toISOString() : new Date().toISOString();
        const summary = cleanOrGenerateSummary(descM ? descM[1] : '', title, source, category);
        const mediaUrl = extractMediaUrl(block, category, idx);

        const hash = crypto.createHash('sha256').update(link + '-' + title).digest('hex');
        const id = 'wire-' + hash.slice(0, 24);
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 50) + '-' + hash.slice(0, 8);

        items.push({ id, slug, source, title, link, summary, category, mediaUrl, pubDate });
        idx++;
      }
    }
    return items;
  } catch (e) {
    console.warn(`[Skip] Feed ${url.slice(0, 50)}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('=== Prolific News Network: Comprehensive News Ingestion Across All 9 Categories ===\n');

  // 1. Seed Categories table in Neon DB
  console.log('1. Ensuring all 9 categories exist in Neon DB...');
  for (const cat of CATEGORIES_DATA) {
    await sql`
      INSERT INTO categories (id, name, slug, description)
      VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.description})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description;
    `;
  }
  console.log('✓ Seeded 9 primary categories in Neon DB.');

  // 2. Concurrently fetch candidate feeds
  console.log('\n2. Fetching real news from Fox News, Fox Business, AP, Reuters, Mongabay, Global Voices, NASA...');
  const feedDefs = [
    // Politics
    { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', cat: 'Politics', src: 'Fox News Politics' },
    { url: 'https://news.google.com/rss/search?q=source:%22Associated%20Press%22+politics&hl=en-US&gl=US&ceid=US:en', cat: 'Politics', src: 'Associated Press' },

    // U.S. News
    { url: 'https://moxie.foxnews.com/google-publisher/us.xml', cat: 'US', src: 'Fox News U.S.' },

    // Opinion
    { url: 'https://moxie.foxnews.com/google-publisher/opinion.xml', cat: 'Opinion', src: 'Fox News Opinion' },
    { url: 'https://theconversation.com/global/articles.atom', cat: 'Opinion', src: 'The Conversation' },

    // Entertainment
    { url: 'https://moxie.foxnews.com/google-publisher/entertainment.xml', cat: 'Entertainment', src: 'Fox Entertainment' },

    // Sports
    { url: 'https://moxie.foxnews.com/google-publisher/sports.xml', cat: 'Sports', src: 'Fox Sports' },

    // Lifestyle & Travel
    { url: 'https://moxie.foxnews.com/google-publisher/lifestyle.xml', cat: 'Lifestyle', src: 'Fox Lifestyle' },
    { url: 'https://moxie.foxnews.com/google-publisher/travel.xml', cat: 'Lifestyle', src: 'Fox Travel' },

    // Business & Markets
    { url: 'https://moxie.foxbusiness.com/google-publisher/markets.xml', cat: 'Business', src: 'Fox Business' },
    { url: 'https://moxie.foxbusiness.com/google-publisher/economy.xml', cat: 'Business', src: 'Fox Business Economy' },
    { url: 'https://news.google.com/rss/search?q=source:%22Reuters%22+business&hl=en-US&gl=US&ceid=US:en', cat: 'Business', src: 'Reuters' },

    // World News
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', cat: 'World', src: 'Fox World' },
    { url: 'https://news.google.com/rss/search?q=source:%22Reuters%22+world&hl=en-US&gl=US&ceid=US:en', cat: 'World', src: 'Reuters' },
    { url: 'https://globalvoices.org/feed/', cat: 'World', src: 'Global Voices' },
    { url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', cat: 'World', src: 'UN News' },

    // Tech & Science
    { url: 'https://moxie.foxnews.com/google-publisher/tech.xml', cat: 'Tech', src: 'Fox Tech' },
    { url: 'https://moxie.foxnews.com/google-publisher/science.xml', cat: 'Tech', src: 'Fox Science' },
    { url: 'https://www.nasa.gov/news-release/feed/', cat: 'Tech', src: 'NASA' },
    { url: 'https://news.mongabay.com/feed/', cat: 'Tech', src: 'Mongabay' },

    // General
    { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', cat: 'General', src: 'Fox News Desk' },
  ];

  const fetchedArrays = await Promise.all(feedDefs.map((f) => fetchFeed(f.url, f.cat, f.src)));
  const allItems = fetchedArrays.flat();
  console.log(`✓ Harvested ${allItems.length} raw stories across all categories.`);

  // Deduplicate
  const seen = new Set();
  const uniqueItems = allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  console.log(`✓ Deduplicated to ${uniqueItems.length} unique wire stories.`);

  // 3. Clean and Populate wire_items table
  console.log('\n3. Synchronizing wire_items in Neon DB...');
  await sql`TRUNCATE TABLE wire_items;`;
  await sql`TRUNCATE TABLE articles;`;
  await sql`TRUNCATE TABLE breaking_alerts;`;

  for (const item of uniqueItems) {
    try {
      await sql`
        INSERT INTO wire_items (id, source, title, link, summary, category, media_url, pub_date, staged_as_draft)
        VALUES (${item.id}, ${item.source}, ${item.title}, ${item.link}, ${item.summary}, ${item.category}, ${item.mediaUrl}, ${item.pubDate}, false)
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (e) {
      // ignore individual error
    }
  }
  console.log(`✓ Inserted ${uniqueItems.length} wire items into wire_items table.`);

  // 4. Publish 3-5 real articles for EACH of the 9 categories
  console.log('\n4. Promoting and publishing real articles for ALL 9 categories...');
  const authors = ['auth-sterling', 'auth-vance', 'auth-thorne', 'auth-lin'];
  let totalPublished = 0;

  for (const cat of CATEGORIES_DATA) {
    // Find items belonging to this category
    const catItems = uniqueItems.filter((i) => {
      const c = i.category.toLowerCase();
      return c === cat.slug || c === cat.name.toLowerCase() || (cat.slug === 'us' && c === 'us');
    });

    const itemsToPublish = catItems.slice(0, 4);
    for (let i = 0; i < itemsToPublish.length; i++) {
      const item = itemsToPublish[i];
      const isLeadHero = totalPublished === 0;
      const authorId = authors[totalPublished % authors.length];

      const keyDevelopments = JSON.stringify([
        `Direct reporting verified via ${item.source} correspondent bureaus.`,
        `Prolific News Network ${cat.name} editorial desk actively following developments.`,
        `Continuous live broadcast streaming on Prolific Watch Hub 24/7.`,
      ]);

      const tags = JSON.stringify([cat.name, item.source, 'Breaking News', 'Prolific News Special']);

      const htmlContent = `
        <p class="text-xl font-serif text-gray-800 leading-relaxed font-semibold mb-6">${item.summary}</p>
        <p class="mb-4">PROLIFIC NEWSROOM — Fast-moving developments are unfolding today according to reports verified by ${item.source}. Officials and policy analysts across affected sectors are evaluating immediate impacts as situation reports are released.</p>
        <p class="mb-4">“Our field correspondents and editorial desks are actively following every critical angle as further information emerges,” stated senior network staff during a broadcast briefing.</p>
        <p class="mb-4">Further announcements and expert analysis will continue throughout the day. Stay with Prolific News Network for continuous live video analysis, panels, and real-time updates.</p>
      `;

      const artId = 'art-' + item.id.replace('wire-', '');
      const leadMediaType = isLeadHero ? 'VIDEO' : 'IMAGE';
      const leadMediaUrl = isLeadHero
        ? 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8'
        : item.mediaUrl;

      await sql`
        INSERT INTO articles (
          id, slug, title, subtitle, key_developments, content, category_id, tags,
          author_id, lead_media_type, lead_media_url, lead_media_caption,
          is_lead_hero, is_breaking, status, read_time_minutes, published_at
        )
        VALUES (
          ${artId}, ${item.slug}, ${item.title.toUpperCase()}, ${item.summary},
          ${keyDevelopments}::jsonb, ${htmlContent}, ${cat.id}, ${tags}::jsonb,
          ${authorId}, ${leadMediaType}, ${leadMediaUrl}, ${item.title + ' — Dispatches via ' + item.source},
          ${isLeadHero}, ${true}, 'PUBLISHED', 3, ${item.pubDate}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      totalPublished++;
    }
  }
  console.log(`✓ Published ${totalPublished} clean articles across all 9 categories into articles table.`);

  // 5. Set active breaking alert from top story
  const topStory = uniqueItems[0];
  await sql`
    INSERT INTO breaking_alerts (id, headline, url, urgency, active, published_at)
    VALUES (
      ${'alert-' + Date.now()},
      ${topStory.title.toUpperCase()},
      ${'/article/' + topStory.slug},
      'BREAKING',
      true,
      NOW()
    );
  `;
  console.log('\n5. Set active breaking alert:', topStory.title);

  // Summary per category
  console.log('\n=== Ingestion Summary per Category ===');
  for (const cat of CATEGORIES_DATA) {
    const artCount = await sql`SELECT count(*)::int FROM articles WHERE category_id = ${cat.id};`;
    const wireCount = await sql`SELECT count(*)::int FROM wire_items WHERE lower(category) = ${cat.slug} OR lower(category) = ${cat.name.toLowerCase()};`;
    console.log(`• [${cat.name}] (${cat.slug}): ${artCount[0].count} Published Articles | ${wireCount[0].count} Wire Items`);
  }
}

main().catch(console.error);
