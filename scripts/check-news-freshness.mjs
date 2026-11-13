import { neon } from '../node_modules/.pnpm/@neondatabase+serverless@0.10.4/node_modules/@neondatabase/serverless/index.mjs';
import fs from 'node:fs';

let envContent = '';
if (fs.existsSync('.env')) {
  envContent = fs.readFileSync('.env', 'utf8');
} else if (fs.existsSync('apps/web/.env.local')) {
  envContent = fs.readFileSync('apps/web/.env.local', 'utf8');
}

const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const DB_URL = process.env.DATABASE_URL || (match ? match[1] : null);

if (!DB_URL) {
  console.error('DATABASE_URL not found!');
  process.exit(1);
}

const sql = neon(DB_URL);

async function main() {
  console.log('=== ARTICLES STATUS ===');
  const latestArticles = await sql`
    SELECT id, title, category_id, status, published_at, created_at
    FROM articles
    ORDER BY published_at DESC NULLS LAST
    LIMIT 10
  `;

  for (const a of latestArticles) {
    console.log(`- [Published: ${a.published_at}] (Created: ${a.created_at}) [${a.category_id}] status=${a.status} : ${a.title.slice(0, 60)}...`);
  }

  const [articlesCount] = await sql`SELECT count(*)::int as count FROM articles`;
  console.log('Total articles:', articlesCount.count);

  const [latestArticleDates] = await sql`
    SELECT max(created_at) as max_created, max(published_at) as max_published, min(published_at) as min_published
    FROM articles
  `;
  console.log('Most recent article created_at:', latestArticleDates.max_created);
  console.log('Most recent article published_at:', latestArticleDates.max_published);

  console.log('\n=== WIRE ITEMS STATUS ===');
  const [wireCount] = await sql`SELECT count(*)::int as count FROM wire_items`;
  console.log('Total wire items:', wireCount.count);

  const [latestWireDates] = await sql`
    SELECT max(created_at) as max_created, max(pub_date) as max_pub_date
    FROM wire_items
  `;
  console.log('Most recent wire item created_at:', latestWireDates.max_created);
  console.log('Most recent wire item pub_date:', latestWireDates.max_pub_date);

  const latestWire = await sql`
    SELECT id, title, source, category, pub_date, created_at, staged_as_draft
    FROM wire_items
    ORDER BY created_at DESC
    LIMIT 10
  `;
  for (const w of latestWire) {
    console.log(`- [Created: ${w.created_at}] (PubDate: ${w.pub_date}) [${w.category}] source=${w.source} staged=${w.staged_as_draft} : ${w.title.slice(0, 50)}...`);
  }

  console.log('\n=== ARTICLES CREATED IN LAST 7 DAYS ===');
  const articlesByDay = await sql`
    SELECT date_trunc('day', created_at) as day, count(*)::int as count 
    FROM articles 
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY day 
    ORDER BY day DESC
  `;
  console.log(articlesByDay);

  console.log('\n=== WIRE ITEMS CREATED IN LAST 7 DAYS ===');
  const wireByDay = await sql`
    SELECT date_trunc('day', created_at) as day, count(*)::int as count 
    FROM wire_items 
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY day 
    ORDER BY day DESC
  `;
  console.log(wireByDay);
}

main().catch(console.error);