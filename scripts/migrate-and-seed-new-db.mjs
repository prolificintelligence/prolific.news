import { neon } from '../packages/db/node_modules/@neondatabase/serverless/index.mjs';

const NEW_DB_URL = process.env.DATABASE_URL;

const sql = neon(NEW_DB_URL);

async function migrateAndSeed() {
  console.log('1. Creating tables in isolated Prolific News Neon DB...');

  await sql`
    CREATE TABLE IF NOT EXISTS authors (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(128) NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ authors table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(128) UNIQUE NOT NULL,
      description TEXT
    );
  `;
  console.log('✓ categories table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS articles (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      key_developments JSONB DEFAULT '[]'::jsonb NOT NULL,
      content TEXT NOT NULL,
      category_id VARCHAR(64) NOT NULL,
      tags JSONB DEFAULT '[]'::jsonb NOT NULL,
      author_id VARCHAR(64) NOT NULL,
      lead_media_type VARCHAR(32) DEFAULT 'IMAGE',
      lead_media_url TEXT,
      lead_media_caption TEXT,
      is_lead_hero BOOLEAN DEFAULT false NOT NULL,
      is_breaking BOOLEAN DEFAULT false NOT NULL,
      status VARCHAR(32) DEFAULT 'DRAFT' NOT NULL,
      read_time_minutes INTEGER DEFAULT 3 NOT NULL,
      value_score INTEGER DEFAULT 50 NOT NULL,
      priority_tier INTEGER DEFAULT 2 NOT NULL,
      geo_region VARCHAR(64) DEFAULT 'Global' NOT NULL,
      published_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      archived_at TIMESTAMP WITH TIME ZONE
    );
  `;
  console.log('✓ articles table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS wire_items (
      id VARCHAR(255) PRIMARY KEY,
      slug VARCHAR(255),
      source VARCHAR(64) NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      summary TEXT,
      category VARCHAR(64) DEFAULT 'General' NOT NULL,
      media_url TEXT,
      value_score INTEGER DEFAULT 50 NOT NULL,
      geo_region VARCHAR(64) DEFAULT 'Global' NOT NULL,
      pub_date TIMESTAMP WITH TIME ZONE,
      staged_as_draft BOOLEAN DEFAULT false NOT NULL,
      is_archived BOOLEAN DEFAULT false NOT NULL,
      archived_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ wire_items table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS live_blogs (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category VARCHAR(64) NOT NULL,
      status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
      lead_media_url TEXT,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ live_blogs table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS live_blog_updates (
      id VARCHAR(64) PRIMARY KEY,
      blogId VARCHAR(64) NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_name VARCHAR(255) NOT NULL,
      is_pinned BOOLEAN DEFAULT false NOT NULL,
      media_url TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ live_blog_updates table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS breaking_alerts (
      id VARCHAR(64) PRIMARY KEY,
      headline TEXT NOT NULL,
      url TEXT NOT NULL,
      urgency VARCHAR(32) DEFAULT 'ALERT' NOT NULL,
      active BOOLEAN DEFAULT true NOT NULL,
      published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ breaking_alerts table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS video_clips (
      id VARCHAR(64) PRIMARY KEY,
      title TEXT NOT NULL,
      duration_seconds VARCHAR(32) DEFAULT '0',
      stream_id VARCHAR(128),
      hls_playback_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      category VARCHAR(64) NOT NULL,
      is_live_broadcast BOOLEAN DEFAULT false NOT NULL,
      published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ video_clips table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      regions JSONB DEFAULT '["Global"]'::jsonb NOT NULL,
      topics JSONB DEFAULT '["Politics","Business","Tech"]'::jsonb NOT NULL,
      frequency VARCHAR(32) DEFAULT 'DAILY_MORNING' NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ newsletter_subscribers table ready');

  // Seed Categories including Africa, Asia, Latin America
  console.log('\n2. Seeding Categories...');
  const categoryDefs = [
    { id: 'cat-politics', name: 'Politics', slug: 'politics', description: 'White House, Capitol Hill, elections, Supreme Court and national policy.' },
    { id: 'cat-us', name: 'U.S. News', slug: 'us', description: 'National reporting across all 50 states, law enforcement, and federal investigations.' },
    { id: 'cat-opinion', name: 'Opinion', slug: 'opinion', description: 'In-depth perspectives, editorial board essays, and guest commentaries.' },
    { id: 'cat-entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Hollywood, streaming cinema, cultural phenomena, and industry trends.' },
    { id: 'cat-sports', name: 'Sports', slug: 'sports', description: 'Scores, trades, championship analysis across NFL, NBA, European football, and athletics.' },
    { id: 'cat-lifestyle', name: 'Lifestyle', slug: 'lifestyle', description: 'Wellness, architecture, luxury automotive, culinary arts, and travel.' },
    { id: 'cat-business', name: 'Business & Markets', slug: 'business', description: 'Wall Street, global macroeconomic indicators, earnings, and tech ventures.' },
    { id: 'cat-world', name: 'World News', slug: 'world', description: 'Geopolitics, defense, international diplomacy, and global affairs.' },
    { id: 'cat-tech', name: 'Technology & AI', slug: 'tech', description: 'Artificial Intelligence, quantum computing, cybersecurity, and consumer electronics.' },
    { id: 'cat-africa', name: 'Africa Bureau', slug: 'africa', description: 'Economic growth, continental trade, tech ecosystems, politics, and culture across African nations.' },
    { id: 'cat-asia', name: 'Asia-Pacific', slug: 'asia', description: 'East Asia, South Asia, ASEAN markets, semiconductor supply chains, and regional diplomacy.' },
    { id: 'cat-latam', name: 'Latin America', slug: 'latam', description: 'South & Central America geopolitics, emerging markets, resources, and cultural affairs.' },
  ];

  for (const c of categoryDefs) {
    await sql`
      INSERT INTO categories (id, name, slug, description)
      VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.description})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
    `;
  }
  console.log(`✓ Seeded ${categoryDefs.length} categories (including Africa, Asia, LatAm)`);

  // Seed Authors
  console.log('\n3. Seeding Editorial Authors...');
  const authorDefs = [
    { id: 'auth-ed-board', name: 'Prolific Editorial Board', role: 'Executive Editorial Bureau', bio: 'The collective voice of Prolific News Network editorial leadership.' },
    { id: 'auth-marcus-vance', name: 'Marcus Vance', role: 'Chief Political Correspondent', bio: 'Capitol Hill and White House veteran reporting.' },
    { id: 'auth-amara-okafor', name: 'Amara Okafor', role: 'Africa Bureau Chief', bio: 'Covering African continental economics, fintech, and diplomacy from Lagos & Nairobi.' },
    { id: 'auth-kenji-tanaka', name: 'Kenji Tanaka', role: 'Asia-Pacific Editor', bio: 'Specialist in East Asian security, Tokyo markets, and tech supply chains.' },
    { id: 'auth-clara-mendez', name: 'Clara Mendez', role: 'Latin America Correspondent', bio: 'Reporting on South American trade, renewable resources, and governance from São Paulo.' },
  ];

  for (const a of authorDefs) {
    await sql`
      INSERT INTO authors (id, name, role, bio)
      VALUES (${a.id}, ${a.name}, ${a.role}, ${a.bio})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
    `;
  }
  console.log(`✓ Seeded ${authorDefs.length} editorial authors`);

  // Seed Breaking Alert
  console.log('\n4. Seeding Initial Breaking Alert...');
  await sql`
    INSERT INTO breaking_alerts (id, headline, url, urgency, active, published_at)
    VALUES (
      'alert-prolific-launch',
      'PROLIFIC NEWS NETWORK 24/7 BROADCAST DESK: EXPANDED CONTINENTAL WIRE COVERAGE NOW LIVE',
      '/category/world',
      'SPECIAL_REPORT',
      true,
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log('✓ Seeded breaking alert');

  console.log('\nDatabase migration and initialization complete!');
}

migrateAndSeed().catch(console.error);
