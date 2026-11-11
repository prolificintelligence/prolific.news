import fs from 'node:fs';
import { neon } from '../packages/db/node_modules/@neondatabase/serverless/index.mjs';

// Read database URL from .env or local .env file
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlLine = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine ? dbUrlLine.replace('DATABASE_URL=', '').trim() : process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL not found');
}

const sql = neon(dbUrl);

async function migrateTelemetry() {
  console.log('Migrating Telemetry schema to Neon DB...');

  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id VARCHAR(64) PRIMARY KEY,
      visitor_hash VARCHAR(64) NOT NULL,
      session_id VARCHAR(64) NOT NULL,
      pathname TEXT NOT NULL,
      article_slug VARCHAR(255),
      article_category VARCHAR(64),
      referrer TEXT,
      referrer_domain VARCHAR(128),
      utm_source VARCHAR(64),
      utm_medium VARCHAR(64),
      utm_campaign VARCHAR(128),
      channel_group VARCHAR(32) DEFAULT 'DIRECT' NOT NULL,
      country VARCHAR(8),
      city VARCHAR(128),
      region VARCHAR(64),
      timezone VARCHAR(64),
      device_type VARCHAR(16) DEFAULT 'desktop',
      browser VARCHAR(32),
      os VARCHAR(32),
      dwell_time_seconds INTEGER DEFAULT 0 NOT NULL,
      scroll_depth_percent INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ page_views table created/verified');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_views_article_slug ON page_views (article_slug);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_views_utm_source ON page_views (utm_source);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_views_channel ON page_views (channel_group);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views (country);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views (session_id);
  `;
  console.log('✓ page_views indexes created');

  await sql`
    CREATE TABLE IF NOT EXISTS telemetry_events (
      id VARCHAR(64) PRIMARY KEY,
      session_id VARCHAR(64) NOT NULL,
      visitor_hash VARCHAR(64) NOT NULL,
      event_name VARCHAR(64) NOT NULL,
      target_slug VARCHAR(255),
      metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ telemetry_events table created/verified');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_telemetry_events_name ON telemetry_events (event_name);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_telemetry_events_created ON telemetry_events (created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_telemetry_events_target ON telemetry_events (target_slug);
  `;
  console.log('✓ telemetry_events indexes created');

  console.log('🎉 Telemetry migration completed successfully!');
}

migrateTelemetry().catch(console.error);
