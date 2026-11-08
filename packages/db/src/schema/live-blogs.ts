import { pgTable, text, timestamp, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';

export const liveBlogs = pgTable('live_blogs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).default('ACTIVE').notNull(),
  leadMediaUrl: text('lead_media_url'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const liveBlogUpdates = pgTable('live_blog_updates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  blogId: varchar('blog_id', { length: 64 }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  mediaUrl: text('media_url'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

export const breakingAlerts = pgTable('breaking_alerts', {
  id: varchar('id', { length: 64 }).primaryKey(),
  headline: text('headline').notNull(),
  url: text('url').notNull(),
  urgency: varchar('urgency', { length: 32 }).default('ALERT').notNull(),
  active: boolean('active').default(true).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
});

export const videoClips = pgTable('video_clips', {
  id: varchar('id', { length: 64 }).primaryKey(),
  title: text('title').notNull(),
  durationSeconds: varchar('duration_seconds', { length: 32 }).default('0'),
  streamId: varchar('stream_id', { length: 128 }),
  hlsPlaybackUrl: text('hls_playback_url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  isLiveBroadcast: boolean('is_live_broadcast').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
});
