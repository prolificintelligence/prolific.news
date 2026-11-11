// One-off integrity migration. Requires DATABASE_URL in the environment (never hard-code it).
import { neon } from '../packages/db/node_modules/@neondatabase/serverless/index.mjs';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

console.log('1. social_posts: add error_message column, widen external_post_id');
await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS error_message TEXT`;
await sql`ALTER TABLE social_posts ALTER COLUMN external_post_id TYPE TEXT`;

console.log('2. delete fabricated social rows (never sent to any platform)');
const del = await sql`
  DELETE FROM social_posts
  WHERE external_post_id LIKE 'pnn-%' OR external_post_id LIKE 'wh-%' OR external_post_id IS NULL
  RETURNING id`;
console.log(`   removed ${del.length} fabricated rows`);

console.log('3. articles: remove templated claims and auto "breaking" labels');
const bodyFix = await sql`
  UPDATE articles
  SET content = REPLACE(
    content,
    'Prolific Newsroom is monitoring this developing story across our regional bureaus and will update as more information is confirmed.',
    'This is a summary of reporting from the original publisher; read the full story at the source.'
  )
  WHERE content LIKE '%monitoring this developing story across our regional bureaus%'
  RETURNING id`;
console.log(`   rewrote body text on ${bodyFix.length} articles`);

const kd = await sql`
  UPDATE articles
  SET key_developments = jsonb_build_array('Reported by ' || COALESCE(tags->>1, 'the original publisher') || '.')
  WHERE key_developments::text LIKE '%desk tracking developments%'
  RETURNING id`;
console.log(`   replaced filler key developments on ${kd.length} articles`);

const br = await sql`
  UPDATE articles SET is_breaking = false
  WHERE is_breaking = true AND author_id = 'auth-ed-board'
  RETURNING id`;
console.log(`   cleared auto-inferred breaking flag on ${br.length} articles`);

console.log('4. authors: replace fictional reporter identities with the desk');
const au = await sql`
  UPDATE authors
  SET name = 'Prolific News Desk', role = 'Editorial Desk', avatar_url = NULL, bio = NULL
  WHERE id IN ('auth-marcus-vance','auth-amara-okafor','auth-kenji-tanaka','auth-clara-mendez')
  RETURNING id`;
console.log(`   updated ${au.length} author rows`);

const c = await sql`
  SELECT
    (SELECT count(*)::int FROM social_posts) AS social_rows,
    (SELECT count(*)::int FROM articles WHERE is_breaking) AS breaking_articles`;
console.log('done:', JSON.stringify(c[0]));
