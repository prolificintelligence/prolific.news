export type ContentStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type AlertUrgency = 'ALERT' | 'BREAKING' | 'DEVELOPING' | 'SPECIAL_REPORT';

export interface BreakingAlert {
  id: string;
  headline: string;
  url: string;
  urgency: AlertUrgency;
  active: boolean;
  publishedAt: string;
}

export interface MarketTickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
}

export interface VideoClip {
  id: string;
  title: string;
  durationSeconds: number;
  streamId: string;
  hlsPlaybackUrl: string;
  thumbnailUrl: string;
  category: string;
  isLiveBroadcast?: boolean;
  publishedAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  keyDevelopments: string[];
  content: string; // HTML or Markdown from block editor
  category: string;
  tags: string[];
  author: Author;
  leadMedia?: {
    type: 'IMAGE' | 'VIDEO' | 'LIVE_STREAM';
    url: string;
    caption?: string;
    thumbnailUrl?: string;
  };
  isLeadHero: boolean;
  isBreaking: boolean;
  status: ContentStatus;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  valueScore?: number;
  priorityTier?: number;
  geoRegion?: string;
}

export interface LiveBlogUpdate {
  id: string;
  blogId: string;
  timestamp: string;
  title: string;
  content: string;
  authorName: string;
  isPinned?: boolean;
  mediaUrl?: string;
}

export interface LiveBlog {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  status: 'ACTIVE' | 'CONCLUDED';
  leadMediaUrl?: string;
  startedAt: string;
  updatedAt: string;
  updates: LiveBlogUpdate[];
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userBadge?: 'SUBSCRIBER' | 'VERIFIED' | 'STAFF';
  content: string;
  upvotes: number;
  createdAt: string;
}

export interface ProlificSubscriptionTier {
  id: string;
  name: string;
  priceMonthly: number;
  features: string[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  regions: string[];
  topics: string[];
  frequency: 'BREAKING_ONLY' | 'DAILY_MORNING' | 'WEEKLY_ROUNDUP';
  isActive: boolean;
  createdAt: string;
}

export interface UserPersonalizationPreferences {
  regions: string[];
  topics: string[];
  readHistory: string[];
}

export type SocialPlatform = 'X' | 'TELEGRAM' | 'LINKEDIN' | 'FACEBOOK' | 'BLUESKY' | 'THREADS' | 'MASTODON';

export interface SocialPost {
  id: string;
  articleId: string;
  articleSlug: string;
  platform: SocialPlatform;
  handle: string;
  postText: string;
  hashtags: string[];
  mediaUrl?: string;
  targetUrl: string;
  status: 'QUEUED' | 'PUBLISHED' | 'DISPATCHED' | 'FAILED';
  externalPostId?: string;
  impressionsEstimate: number;
  publishedAt: string;
  createdAt: string;
}

export const OFFICIAL_SOCIAL_HANDLES: Record<SocialPlatform, { handle: string; name: string; profileUrl: string }> = {
  X: { handle: '@prolificnews', name: 'X (Twitter)', profileUrl: 'https://x.com/prolificnews' },
  TELEGRAM: { handle: 't.me/prolificnews', name: 'Telegram Broadcast', profileUrl: 'https://t.me/prolificnews' },
  LINKEDIN: { handle: 'Prolific News Network', name: 'LinkedIn Executive Desk', profileUrl: 'https://linkedin.com/company/prolificnews' },
  FACEBOOK: { handle: '@prolificnewsnetwork', name: 'Facebook Live & News', profileUrl: 'https://facebook.com/prolificnewsnetwork' },
  BLUESKY: { handle: '@prolific.news', name: 'Bluesky Wire', profileUrl: 'https://bsky.app/profile/prolific.news' },
  THREADS: { handle: '@prolificnews', name: 'Threads', profileUrl: 'https://threads.net/@prolificnews' },
  MASTODON: { handle: 'Prolific News (Mastodon)', name: 'Mastodon', profileUrl: 'https://mastodon.social' },
};
