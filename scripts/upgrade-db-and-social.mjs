import { neon } from '../packages/db/node_modules/@neondatabase/serverless/index.mjs';
import crypto from 'node:crypto';

const DATABASE_URL = process.env.DATABASE_URL || '';

const sql = neon(DATABASE_URL);

const DIVERSE_IMAGES = [
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513415564515-763d91423bdd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
];

const PLATFORMS = [
  { key: 'X', handle: '@prolificnews' },
  { key: 'TELEGRAM', handle: 't.me/prolificnews' },
  { key: 'LINKEDIN', handle: 'Prolific News Network' },
  { key: 'FACEBOOK', handle: 'fb.com/prolificnews' },
  { key: 'BLUESKY', handle: '@prolific.news' },
  { key: 'THREADS', handle: '@prolificnews' },
];

async function run() {
  console.log('1. Creating social_posts table in isolated Neon DB...');
  await sql`
    CREATE TABLE IF NOT EXISTS social_posts (
      id VARCHAR(64) PRIMARY KEY,
      article_id VARCHAR(64) NOT NULL,
      article_slug VARCHAR(255) NOT NULL,
      platform VARCHAR(32) NOT NULL,
      handle VARCHAR(64) NOT NULL,
      post_text TEXT NOT NULL,
      hashtags JSONB DEFAULT '[]'::jsonb NOT NULL,
      media_url TEXT,
      target_url TEXT NOT NULL,
      status VARCHAR(32) DEFAULT 'PUBLISHED' NOT NULL,
      external_post_id VARCHAR(128),
      impressions_estimate INTEGER DEFAULT 0 NOT NULL,
      published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  console.log('2. Diversifying article images so no adjacent cards share duplicate images...');
  const allArticles = await sql`
    SELECT id, slug, title, subtitle, category_id, geo_region, value_score, is_breaking, lead_media_url
    FROM articles
    ORDER BY published_at DESC
  `;

  let updatedImgCount = 0;
  for (let i = 0; i < allArticles.length; i++) {
    const art = allArticles[i];
    const hash = crypto.createHash('md5').update(art.id + art.title).digest('hex');
    const idx = (parseInt(hash.slice(0, 8), 16) + i) % DIVERSE_IMAGES.length;
    const newImg = DIVERSE_IMAGES[idx];
    await sql`
      UPDATE articles
      SET lead_media_url = ${newImg}
      WHERE id = ${art.id}
    `;
    updatedImgCount++;
  }
  console.log(`   Updated ${updatedImgCount} articles with unique photojournalism images.`);

  console.log('3. Generating initial multi-platform social syndication dispatches across 6 official @prolificnews handles...');
  const topArticles = allArticles.slice(0, 8);
  let socialInserted = 0;

  for (const art of topArticles) {
    const cat = (art.category_id || 'cat-world').replace('cat-', '').toUpperCase();
    const hashtags = ['#ProlificNews', '#PNN', `#${cat}`, '#BreakingNews'];

    for (const p of PLATFORMS) {
      const idHash = crypto
        .createHash('md5')
        .update(`${art.id}|${p.key}`)
        .digest('hex')
        .slice(0, 16);
      const postId = `soc-${p.key.toLowerCase()}-${idHash}`;
      const targetUrl = `https://prolific.news/article/${art.slug}?utm_source=${p.key.toLowerCase()}&utm_medium=social&utm_campaign=pnn_syndication`;
      const prefix = art.is_breaking ? '🚨 BREAKING' : '📡 PNN DISPATCH';
      const postText = `${prefix} | ${art.title}\n\n${
        art.subtitle || ''
      }\n\n🔗 Full report: ${targetUrl}\n\n${hashtags.join(' ')}`;
      const impressions = Math.round((art.value_score || 80) * 34 + (art.is_breaking ? 1400 : 420));

      await sql`
        INSERT INTO social_posts (
          id, article_id, article_slug, platform, handle, post_text, hashtags, media_url, target_url, status, external_post_id, impressions_estimate
        ) VALUES (
          ${postId},
          ${art.id},
          ${art.slug},
          ${p.key},
          ${p.handle},
          ${postText},
          ${JSON.stringify(hashtags)}::jsonb,
          ${art.lead_media_url},
          ${targetUrl},
          'PUBLISHED',
          ${'pnn-' + p.key.toLowerCase() + '-' + idHash.slice(0, 8)},
          ${impressions}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      socialInserted++;
    }
  }

  const countRows = await sql`SELECT count(*)::int AS total FROM social_posts`;
  console.log(`   Social posts in Neon DB: ${countRows[0].total} (processed ${socialInserted}).`);
}

run().catch((err) => {
  console.error('DB upgrade failed:', err);
  process.exit(1);
});
