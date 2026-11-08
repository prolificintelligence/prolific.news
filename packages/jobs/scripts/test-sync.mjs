import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { neon } = require('../../db/node_modules/@neondatabase/serverless');

// Read env file
const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const connStr = match ? match[1].trim() : '';

if (!connStr) {
  console.error('No DATABASE_URL found in .env');
  process.exit(1);
}

const sql = neon(connStr);

const CATEGORY_IMAGES = {
  Politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  ],
  Business: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  ],
  World: [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
  ],
};

function cleanText(raw) {
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function fetchFeed(url, category) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Prolific NewsNewsWire/1.0',
      },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const items = [];
    let match;
    let idx = 0;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
      const block = match[1];
      const titleM = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkM = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const pubM = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const descM = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
      const sourceM = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

      if (titleM && linkM) {
        const title = cleanText(titleM[1]);
        const link = cleanText(linkM[1]);
        const pubDate = pubM ? new Date(cleanText(pubM[1])).toISOString() : new Date().toISOString();
        const summary = descM ? cleanText(descM[1]) : '';
        const source = sourceM ? cleanText(sourceM[1]) : 'Wire Services';
        const imgList = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.General;
        const mediaUrl = imgList[idx % imgList.length];
        const id = 'wire-' + Buffer.from(link).toString('base64url').slice(0, 32);

        items.push({ id, source, title, link, summary, category, mediaUrl, pubDate });
        idx++;
      }
    }
    return items;
  } catch (e) {
    console.error('Error fetching feed ' + url, e.message);
    return [];
  }
}

async function main() {
  console.log('Fetching Google News live feeds across categories...');
  const [top, pol, bus, world] = await Promise.all([
    fetchFeed('https://news.google.com/rss', 'General'),
    fetchFeed('https://news.google.com/rss/headlines/section/topic/POLITICS', 'Politics'),
    fetchFeed('https://news.google.com/rss/headlines/section/topic/BUSINESS', 'Business'),
    fetchFeed('https://news.google.com/rss/headlines/section/topic/WORLD', 'World'),
  ]);

  const allItems = [...top, ...pol, ...bus, ...world];
  console.log(`Fetched ${allItems.length} live articles from wire feeds.`);

  let inserted = 0;
  for (const item of allItems) {
    try {
      await sql`
        INSERT INTO wire_items (id, source, title, link, summary, category, media_url, pub_date, staged_as_draft)
        VALUES (${item.id}, ${item.source}, ${item.title}, ${item.link}, ${item.summary}, ${item.category}, ${item.mediaUrl}, ${item.pubDate}, false)
        ON CONFLICT (id) DO NOTHING;
      `;
      inserted++;
    } catch (err) {
      // conflict or error
    }
  }

  console.log(`Successfully synced ${inserted} items to Neon DB wire_items table.`);

  // Also query count from DB to verify
  const countRes = await sql`SELECT count(*) FROM wire_items;`;
  console.log('Total items in wire_items table in Neon DB:', countRes[0].count);

  const sample = await sql`SELECT id, title, category, source, pub_date FROM wire_items ORDER BY pub_date DESC LIMIT 5;`;
  console.log('Top 5 most recent wire stories in DB:');
  sample.forEach((s, i) => console.log(` ${i + 1}. [${s.category}] [${s.source}] ${s.title}`));
}

main().catch(console.error);
