export const SITE = {
  name: 'Prolific News Network',
  domain: 'prolific.news',
  url: 'https://prolific.news',
  // Set NEXT_PUBLIC_CONTACT_EMAIL on Vercel to a mailbox you actually monitor.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'editor@prolific.news',
  updated: 'November 2026',
};

/** Only accounts that really exist are shown. Set these on Vercel once each account is live. */
export const SOCIAL_LINKS: Array<{ key: string; label: string; url: string; className: string }> = [
  { key: 'telegram', label: 'Telegram', url: process.env.NEXT_PUBLIC_TELEGRAM_URL || '', className: 'bg-[#0088cc]' },
  { key: 'bluesky', label: 'Bluesky', url: process.env.NEXT_PUBLIC_BLUESKY_URL || '', className: 'bg-[#0285FF]' },
  { key: 'mastodon', label: 'Mastodon', url: process.env.NEXT_PUBLIC_MASTODON_URL || '', className: 'bg-[#6364FF]' },
].filter((s) => s.url);
