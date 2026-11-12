import { Inngest } from 'inngest';
import {
  ingestFeedsToNeonDb,
  promoteAndRevalidateWireItems,
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
 * Full Wire Ingestion (chunked into bounded steps so heavy runs never hit 60s function timeouts)
 */
export const wireIngestCron = inngest.createFunction(
  { id: 'cron-wire-ingest', concurrency: { limit: 1 }, retries: 1 },
  { event: 'wire/full.requested' },
  async ({ event, step }) => {
    const ingest = await step.run('ingest-feeds', () => ingestFeedsToNeonDb());
    const promo = await step.run('promote-and-revalidate', () => promoteAndRevalidateWireItems(3));
    const social =
      event.data?.social === false
        ? null
        : await step.run('syndicate-social', () => autoSyndicateHighValueArticles(2));

    return {
      edition: 'full-cadence',
      processed: ingest.total,
      inserted: ingest.inserted,
      promoted: promo.promoted,
      social,
    };
  }
);

/**
 * On-Demand Tier 1 Ingestion (Breaking Desk, Politics, Markets, Africa, Asia, LatAm)
 * Scheduled ingestion is consolidated in GitHub Actions and dispatched into durable Inngest steps.
 */
export const wireIngestTier1Cron = inngest.createFunction(
  { id: 'cron-wire-tier1', concurrency: { limit: 1 }, retries: 1 },
  { event: 'wire/tier1.requested' },
  async ({ event, step }) => {
    const ingest = await step.run('ingest-tier1-feeds', () => ingestFeedsToNeonDb(1));
    const promo = await step.run('promote-and-revalidate-tier1', () => promoteAndRevalidateWireItems(4));
    const social =
      event.data?.social === false
        ? null
        : await step.run('syndicate-social', () => autoSyndicateHighValueArticles(2));

    return {
      tier: 1,
      processed: ingest.total,
      inserted: ingest.inserted,
      promoted: promo.promoted,
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
 * On-Demand Tier 2 Ingestion (Global, U.S., World, Sports, Entertainment)
 */
export const wireIngestTier2Cron = inngest.createFunction(
  { id: 'cron-wire-tier2', concurrency: { limit: 1 }, retries: 1 },
  { event: 'wire/tier2.requested' },
  async ({ step }) => {
    const ingest = await step.run('ingest-tier2-feeds', () => ingestFeedsToNeonDb(2));
    const promo = await step.run('promote-and-revalidate-tier2', () => promoteAndRevalidateWireItems(2));

    return { tier: 2, processed: ingest.total, inserted: ingest.inserted, promoted: promo.promoted };
  }
);

/**
 * On-Demand Tier 3 Ingestion (Tech, Science, Opinion, Lifestyle)
 */
export const wireIngestTier3Cron = inngest.createFunction(
  { id: 'cron-wire-tier3', concurrency: { limit: 1 }, retries: 1 },
  { event: 'wire/tier3.requested' },
  async ({ step }) => {
    const ingest = await step.run('ingest-tier3-feeds', () => ingestFeedsToNeonDb(3));
    const promo = await step.run('promote-and-revalidate-tier3', () => promoteAndRevalidateWireItems(2));

    return { tier: 3, processed: ingest.total, inserted: ingest.inserted, promoted: promo.promoted };
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
