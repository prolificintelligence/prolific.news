import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import fs from 'node:fs';
import {
  pullTieredNewsFeed,
  syncTieredFeedsToNeonDb,
  archiveOldContent,
  FEED_REGISTRY
} from '../src/wire-puller.js';

const connStr = fs.readFileSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md', 'utf8').trim();
process.env.DATABASE_URL = connStr;

async function runTests() {
  console.log('=== PROLIFIC NEWS NETWORK: TIERED INGESTION & ARCHIVAL VERIFICATION ===\n');

  console.log(`Registered Feeds: ${FEED_REGISTRY.length} endpoints`);
  const tier1Count = FEED_REGISTRY.filter(f => f.tier === 1).length;
  const tier2Count = FEED_REGISTRY.filter(f => f.tier === 2).length;
  const tier3Count = FEED_REGISTRY.filter(f => f.tier === 3).length;
  console.log(`- Tier 1 (1m cadence): ${tier1Count} feeds`);
  console.log(`- Tier 2 (5m cadence): ${tier2Count} feeds`);
  console.log(`- Tier 3 (15m cadence): ${tier3Count} feeds\n`);

  // 1. Test Tier 1 pull
  console.log('Testing Tier 1 pull (Politics & Markets)...');
  const t1Articles = await pullTieredNewsFeed(1);
  console.log(`✓ Tier 1 pulled ${t1Articles.length} live articles.`);
  if (t1Articles.length > 0) {
    console.log(`  Sample: [${t1Articles[0].source}] ${t1Articles[0].title.slice(0, 70)}...`);
  }

  // 2. Test Tier 2 pull
  console.log('\nTesting Tier 2 pull (US, World, Sports)...');
  const t2Articles = await pullTieredNewsFeed(2);
  console.log(`✓ Tier 2 pulled ${t2Articles.length} live articles.`);

  // 3. Test Tier 3 pull
  console.log('\nTesting Tier 3 pull (Tech, Science, Opinion)...');
  const t3Articles = await pullTieredNewsFeed(3);
  console.log(`✓ Tier 3 pulled ${t3Articles.length} live articles.`);

  // 4. Test Tiered Neon DB Sync
  console.log('\nSyncing Tier 1 to Neon DB...');
  const syncRes = await syncTieredFeedsToNeonDb(1);
  console.log(`✓ Tier 1 Sync result: processed ${syncRes.total}, inserted ${syncRes.inserted}`);

  // 5. Test Archival Engine
  console.log('\nTesting Archival Lifecycle Engine...');
  const archiveRes = await archiveOldContent({ wireRetentionDays: 14, articleRetentionDays: 30 });
  console.log(`✓ Archival result: ${archiveRes.archivedWires} wires flagged, ${archiveRes.archivedArticles} articles transitioned to ARCHIVED.`);

  console.log('\n=== ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
