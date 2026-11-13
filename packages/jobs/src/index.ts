import { Inngest } from 'inngest';
import {
  ingestFeedsToNeonDb,
  promoteAndRevalidateWireItems,
  syncWireFeedsToNeonDb,
  syncTieredFeedsToNeonDb,
  archiveOldContent,
} from './wire-puller';
import { autoSyndicateHighValueArticles } from './social-distributor';
import { sendDailyMorningBriefing } from './newsletter-sender';

export * from './wire-puller';
export * from './social-distributor';
export * from './newsletter-sender';
export { dispatchToPlatform } from './social-channels';

export const inngest = new Inngest({ id: 'prolific-news-platform' });

/**
 * Full Wire Ingestion (All 12 desks - on-demand or weekly full sweep)
 */
export const wireIngestCron = inngest.createFunction(
  { id: 'cron-wire-ingest', concurrency: { limit: 1 }, retries: 1 },
  { event: 'wire/full.requested' },
  async ({ event, step }) => {
    const sync = await step.run('sync-full-news', () => syncWireFeedsToNeonDb());
    const social =
      event.data?.social === false
        ? null
        : await step.run('syndicate-social', () => autoSyndicateHighValueArticles(2));

    return {
      edition: 'full-cadence',
      processed: sync.total,
      inserted: sync.inserted,
      promoted: sync.promoted,
      social,
    };
  }
);

/**
 * Autonomous Tier 1 Ingestion (Breaking Desk, Politics, Markets, Africa, Asia, LatAm)
 * Scheduled natively in Inngest Cloud (every 1 hour) with external event dispatch fallback.
 * Consolidated into a single lean step to minimize Vercel Fluid CPU and eliminate multi-invocation container overhead.
 */
export const wireIngestTier1Cron = inngest.createFunction(
  { id: 'cron-wire-tier1', concurrency: { limit: 1 }, retries: 1 },
  [{ cron: '0 * * * *' }, { event: 'wire/tier1.requested' }],
  async ({ event, step }) => {
    const sync = await step.run('sync-tier1-news', () => syncTieredFeedsToNeonDb(1));
    const social =
      event.data?.social === false
        ? null
        : await step.run('syndicate-social', () => autoSyndicateHighValueArticles(2));

    return {
      tier: 1,
      processed: sync.total,
      inserted: sync.inserted,
      promoted: sync.promoted,
      social,
    };
  }
);

/**
 * On-Demand Social Distribution (max 2 stories per run, deduplicated per channel).
 */
export const socialDistributionCron = inngest.createFunction(
  { id: 'cron-social-distribution', concurrency: { limit: 1 }, retries: 1 },
  { event: 'social/syndicate.requested' },
  async ({ step }) => {
    const result = await step.run('auto-syndicate-social', () => autoSyndicateHighValueArticles(2));
    return result;
  }
);

/**
 * Autonomous Tier 2 Ingestion (Global, U.S., World, Sports, Entertainment)
 * Scheduled natively in Inngest Cloud (every 3 hours at :30).
 */
export const wireIngestTier2Cron = inngest.createFunction(
  { id: 'cron-wire-tier2', concurrency: { limit: 1 }, retries: 1 },
  [{ cron: '30 */3 * * *' }, { event: 'wire/tier2.requested' }],
  async ({ step }) => {
    const sync = await step.run('sync-tier2-news', () => syncTieredFeedsToNeonDb(2));
    return { tier: 2, processed: sync.total, inserted: sync.inserted, promoted: sync.promoted };
  }
);

/**
 * Autonomous Tier 3 Ingestion (Tech, Science, Opinion, Lifestyle)
 * Scheduled natively in Inngest Cloud (every 6 hours at :45).
 */
export const wireIngestTier3Cron = inngest.createFunction(
  { id: 'cron-wire-tier3', concurrency: { limit: 1 }, retries: 1 },
  [{ cron: '45 */6 * * *' }, { event: 'wire/tier3.requested' }],
  async ({ step }) => {
    const sync = await step.run('sync-tier3-news', () => syncTieredFeedsToNeonDb(3));
    return { tier: 3, processed: sync.total, inserted: sync.inserted, promoted: sync.promoted };
  }
);

/**
 * Daily Morning Briefing Newsletter (Daily at 07:00 UTC or via event)
 */
export const dailyNewsletterCron = inngest.createFunction(
  { id: 'cron-daily-newsletter', concurrency: { limit: 1 }, retries: 1 },
  [{ cron: '0 7 * * *' }, { event: 'newsletter/morning.requested' }],
  async ({ step }) => {
    return await step.run('send-morning-briefing', () => sendDailyMorningBriefing());
  }
);

/**
 * Automated Content Lifecycle & Archival Engine (Daily at 03:00 UTC)
 * Archives wire items older than 14 days and articles older than 30 days.
 */
export const contentLifecycleCron = inngest.createFunction(
  { id: 'cron-content-lifecycle', concurrency: { limit: 1 }, retries: 1 },
  { cron: '0 3 * * *' },
  async ({ step }) => {
    const result = await step.run('archive-stale-content', async () => {
      return await archiveOldContent({
        wireRetentionDays: 14,
        articleRetentionDays: 30,
      });
    });

    return result;
  }
);

export const inngestFunctions = [
  wireIngestCron,
  wireIngestTier1Cron,
  wireIngestTier2Cron,
  wireIngestTier3Cron,
  socialDistributionCron,
  dailyNewsletterCron,
  contentLifecycleCron,
];
