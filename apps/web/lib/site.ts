export interface DepartmentContact {
  id: string;
  name: string;
  email: string;
  sla: string;
  purpose: string;
  description: string;
  badge: string;
}

export const DEPARTMENTS: Record<string, DepartmentContact> = {
  editorial: {
    id: 'editorial',
    name: 'Editorial Desk & Newsroom',
    email: 'editor@prolific.news',
    sla: 'Within 2 hours',
    badge: 'Editorial & Reporting',
    purpose: 'Story tips, factual corrections, editorial clarifications, and retraction requests.',
    description: 'Reach our 24/7 autonomous and senior assignment editors. For urgent corrections, include the article URL and verified source documentation.',
  },
  partnerships: {
    id: 'partnerships',
    name: 'Commercial Partnerships & Sponsorships',
    email: 'partnerships@prolific.news',
    sla: 'Within 4 hours',
    badge: 'Revenue & Advertising',
    purpose: 'Regional bureau sponsorships, broadcast lower-third chyrons, morning briefing underwriting, and commercial media kits.',
    description: 'Connect with our business development desk to discuss category exclusivity, thought leadership dispatches, and institutional partnerships.',
  },
  wire: {
    id: 'wire',
    name: 'Commercial Wire & Press Releases',
    email: 'wire@prolific.news',
    sla: 'Within 1 hour',
    badge: 'Press & Syndication',
    purpose: 'Company disclosures, corporate funding announcements, executive appointments, and PR wire syndication.',
    description: 'Submit corporate press releases for network indexing, Google News inclusion, and automated social broadcast amplification.',
  },
  support: {
    id: 'support',
    name: 'Reader Support & Prolific Plus',
    email: 'support@prolific.news',
    sla: 'Within 6 hours',
    badge: 'Subscribers & Members',
    purpose: 'Prolific Plus memberships, billing inquiries, newsletter preferences, and platform technical support.',
    description: 'Our reader relations team assists with account access, subscription management, audio player playback, and deliverability.',
  },
  legal: {
    id: 'legal',
    name: 'Legal, Compliance & Privacy',
    email: 'legal@prolific.news',
    sla: 'Within 24 hours',
    badge: 'Compliance & Legal',
    purpose: 'DMCA notices, copyright inquiries, GDPR/CCPA data privacy requests, terms of service, and regulatory compliance.',
    description: 'Direct inquiries to Prolific News Network Media legal counsel and compliance officers. Official notices must include valid contact credentials.',
  },
};

export const SITE = {
  name: 'Prolific News Network',
  domain: 'prolific.news',
  url: 'https://prolific.news',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'editor@prolific.news',
  departments: DEPARTMENTS,
  updated: 'November 2026',
};

/** Only accounts that really exist are shown. Set these on Vercel once each account is live. */
export const SOCIAL_LINKS: Array<{ key: string; label: string; url: string; className: string }> = [
  { key: 'telegram', label: 'Telegram', url: process.env.NEXT_PUBLIC_TELEGRAM_URL || '', className: 'bg-[#0088cc]' },
  { key: 'bluesky', label: 'Bluesky', url: process.env.NEXT_PUBLIC_BLUESKY_URL || '', className: 'bg-[#0285FF]' },
  { key: 'mastodon', label: 'Mastodon', url: process.env.NEXT_PUBLIC_MASTODON_URL || '', className: 'bg-[#6364FF]' },
].filter((s) => s.url);
