import { pgTable, text, timestamp, boolean, jsonb, integer, varchar } from 'drizzle-orm/pg-core';

export const authors = pgTable('authors', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 128 }).notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 128 }).unique().notNull(),
  description: text('description'),
});

export const articles = pgTable('articles', {
  id: varchar('id', { length: 64 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  keyDevelopments: jsonb('key_developments').$type<string[]>().default([]).notNull(),
  content: text('content').notNull(),
  categoryId: varchar('category_id', { length: 64 }).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  authorId: varchar('author_id', { length: 64 }).notNull(),
  leadMediaType: varchar('lead_media_type', { length: 32 }).default('IMAGE'),
  leadMediaUrl: text('lead_media_url'),
  leadMediaCaption: text('lead_media_caption'),
  isLeadHero: boolean('is_lead_hero').default(false).notNull(),
  isBreaking: boolean('is_breaking').default(false).notNull(),
  status: varchar('status', { length: 32 }).default('DRAFT').notNull(),
  readTimeMinutes: integer('read_time_minutes').default(3).notNull(),
  valueScore: integer('value_score').default(50).notNull(),
  priorityTier: integer('priority_tier').default(2).notNull(),
  geoRegion: varchar('geo_region', { length: 64 }).default('Global').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const wireItems = pgTable('wire_items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  slug: varchar('slug', { length: 255 }),
  source: varchar('source', { length: 64 }).notNull(),
  title: text('title').notNull(),
  link: text('link').notNull(),
  summary: text('summary'),
  category: varchar('category', { length: 64 }).default('General').notNull(),
  mediaUrl: text('media_url'),
  valueScore: integer('value_score').default(50).notNull(),
  geoRegion: varchar('geo_region', { length: 64 }).default('Global').notNull(),
  pubDate: timestamp('pub_date', { withTimezone: true }),
  stagedAsDraft: boolean('staged_as_draft').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  regions: jsonb('regions').$type<string[]>().default(['Global']).notNull(),
  topics: jsonb('topics').$type<string[]>().default(['Politics', 'Business', 'Tech']).notNull(),
  frequency: varchar('frequency', { length: 32 }).default('DAILY_MORNING').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const socialPosts = pgTable('social_posts', {
  id: varchar('id', { length: 64 }).primaryKey(),
  articleId: varchar('article_id', { length: 64 }).notNull(),
  articleSlug: varchar('article_slug', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 32 }).notNull(), // 'X', 'TELEGRAM', 'LINKEDIN', 'FACEBOOK', 'BLUESKY', 'THREADS'
  handle: varchar('handle', { length: 64 }).notNull(), // e.g. '@prolificnews'
  postText: text('post_text').notNull(),
  hashtags: jsonb('hashtags').$type<string[]>().default([]).notNull(),
  mediaUrl: text('media_url'),
  targetUrl: text('target_url').notNull(),
  status: varchar('status', { length: 32 }).default('PUBLISHED').notNull(), // 'QUEUED', 'DISPATCHED', 'FAILED' (DISPATCHED = platform returned a real post id)
  externalPostId: text('external_post_id'),
  errorMessage: text('error_message'),
  impressionsEstimate: integer('impressions_estimate').default(0).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
