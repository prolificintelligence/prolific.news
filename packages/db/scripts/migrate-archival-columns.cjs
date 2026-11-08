const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const connStr = fs.readFileSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md', 'utf8').trim();
const sql = neon(connStr);

async function main() {
  console.log('Applying archival columns and indexes to Neon DB...');
  
  // 1. Add is_archived and archived_at to wire_items
  await sql`
    ALTER TABLE wire_items 
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
  `;
  console.log('Added is_archived and archived_at to wire_items.');

  // 2. Add performance indexes for real-time querying and archival filtering
  await sql`
    CREATE INDEX IF NOT EXISTS idx_wire_items_pubdate ON wire_items (pub_date DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_wire_items_cat_archived ON wire_items (category, is_archived, pub_date DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_status_pubdate ON articles (status, published_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_cat_status ON articles (category_id, status, published_at DESC);
  `;
  console.log('Created performance indexes on wire_items and articles.');

  const sample = await sql`SELECT count(*) as total, count(*) FILTER (WHERE is_archived = false) as active FROM wire_items;`;
  console.log('Wire items counts:', sample[0]);
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
