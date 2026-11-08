const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const connStr = fs.readFileSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md', 'utf8').trim();
const sql = neon(connStr);

async function main() {
  console.log('Connecting to Neon DB...');
  await sql`
    CREATE TABLE IF NOT EXISTS wire_items (
      id VARCHAR(255) PRIMARY KEY,
      source VARCHAR(64) NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      summary TEXT,
      category VARCHAR(64) DEFAULT 'General' NOT NULL,
      media_url TEXT,
      pub_date TIMESTAMP WITH TIME ZONE,
      staged_as_draft BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('Table wire_items verified/created successfully.');

  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public';
  `;
  console.log('Public tables in Neon DB:', tables.map(t => t.table_name));
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
