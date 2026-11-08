import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { neon } = require('../node_modules/@neondatabase/serverless');

const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const connStr = match ? match[1].trim() : '';

const sql = neon(connStr);

async function main() {
  console.log('Checking authors, categories, and articles in Neon DB...');

  // Ensure default authors
  await sql`
    INSERT INTO authors (id, name, role, avatar_url, bio)
    VALUES 
      ('auth-sterling', 'Jonathan Sterling', 'Chief Washington Correspondent', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', 'Award-winning national security and Capitol Hill correspondent for Prolific News Network.'),
      ('auth-vance', 'Rachel Vance', 'Senior Defense Reporter', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80', 'Specializes in naval warfare, global shipping lanes, and maritime security alliances.'),
      ('auth-thorne', 'Derek Thorne', 'Lead Technology & Energy Editor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', 'Covers artificial intelligence infrastructure, nuclear data center expansion, and clean energy.'),
      ('auth-lin', 'Sarah Lin', 'Senior Political & Elections Analyst', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', 'Analyzes battleground state polling data, congressional dynamics, and voter behavior patterns.')
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log('Verified 4 default editorial authors.');

  // Ensure categories
  await sql`
    INSERT INTO categories (id, name, slug, description)
    VALUES
      ('cat-politics', 'Politics', 'politics', 'Capitol Hill, executive branch, diplomacy, and election coverage.'),
      ('cat-business', 'Business', 'business', 'Wall Street markets, macroeconomics, energy, and corporate finance.'),
      ('cat-world', 'World', 'world', 'Global conflict, international summits, and geopolitical relations.'),
      ('cat-general', 'General', 'general', 'Major breaking news, national headlines, and developing stories.')
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log('Verified default categories.');

  const authorsCount = await sql`SELECT count(*) FROM authors;`;
  const categoriesCount = await sql`SELECT count(*) FROM categories;`;
  const articlesCount = await sql`SELECT count(*) FROM articles;`;
  const alertsCount = await sql`SELECT count(*) FROM breaking_alerts;`;

  console.log({
    authors: authorsCount[0].count,
    categories: categoriesCount[0].count,
    articles: articlesCount[0].count,
    breaking_alerts: alertsCount[0].count,
  });
}

main().catch(console.error);
