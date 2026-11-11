import { pgTable, varchar, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const pageViews = pgTable(
  'page_views',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    visitorHash: varchar('visitor_hash', { length: 64 }).notNull(), // Daily salted SHA-256
    sessionId: varchar('session_id', { length: 64 }).notNull(),
    pathname: text('pathname').notNull(),
    articleSlug: varchar('article_slug', { length: 255 }),
    articleCategory: varchar('article_category', { length: 64 }),

    // Inbound Referral & Campaign Attribution
    referrer: text('referrer'),
    referrerDomain: varchar('referrer_domain', { length: 128 }),
    utmSource: varchar('utm_source', { length: 64 }),
    utmMedium: varchar('utm_medium', { length: 64 }),
    utmCampaign: varchar('utm_campaign', { length: 128 }),
    channelGroup: varchar('channel_group', { length: 32 }).default('DIRECT').notNull(), // 'TELEGRAM', 'BLUESKY', 'MASTODON', 'X', 'SEARCH', 'DIRECT', 'REFERRAL'

    // Edge Geolocation
    country: varchar('country', { length: 8 }),
    city: varchar('city', { length: 128 }),
    region: varchar('region', { length: 64 }),
    timezone: varchar('timezone', { length: 64 }),

    // Device & Tech
    deviceType: varchar('device_type', { length: 16 }).default('desktop'), // 'mobile', 'desktop', 'tablet'
    browser: varchar('browser', { length: 32 }),
    os: varchar('os', { length: 32 }),

    // Engagement Metrics
    dwellTimeSeconds: integer('dwell_time_seconds').default(0).notNull(),
    scrollDepthPercent: integer('scroll_depth_percent').default(0).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_page_views_created_at').on(table.createdAt),
    index('idx_page_views_article_slug').on(table.articleSlug),
    index('idx_page_views_utm_source').on(table.utmSource),
    index('idx_page_views_channel').on(table.channelGroup),
    index('idx_page_views_country').on(table.country),
    index('idx_page_views_session_id').on(table.sessionId),
  ]
);

export const telemetryEvents = pgTable(
  'telemetry_events',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    sessionId: varchar('session_id', { length: 64 }).notNull(),
    visitorHash: varchar('visitor_hash', { length: 64 }).notNull(),
    eventName: varchar('event_name', { length: 64 }).notNull(), // 'share_click', 'audio_briefing_play', 'newsletter_signup', 'bookmark_save', 'watch_stream', 'ticker_click'
    targetSlug: varchar('target_slug', { length: 255 }),
    metadata: jsonb('metadata').$type<Record<string, any>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_telemetry_events_name').on(table.eventName),
    index('idx_telemetry_events_created').on(table.createdAt),
    index('idx_telemetry_events_target').on(table.targetSlug),
  ]
);
