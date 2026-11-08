import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Globe,
  Radio,
  Mail,
  ShieldCheck,
  BarChart3,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Advertise & Commercial Sponsorships | Prolific News Network (PNN)',
  description:
    'Partner with Prolific News Network. Executive desk sponsorships, 24/7 broadcast stream underwriting, morning intelligence briefings, and B2B wire licensing.',
};

const TIERS = [
  {
    name: 'Regional Desk Sponsor',
    price: '$2,500 / week',
    badge: 'High-Growth Markets',
    description:
      'Exclusive category banner, native intelligence card, and social dispatch attribution across any single PNN Desk (Africa, Asia, LatAm, Markets, or Tech).',
    features: [
      '100% Share-of-Voice on chosen Regional or Sector Desk',
      'Native Executive Partner card in 3-column homepage layout',
      'Co-branded attribution on @prolificnews social dispatches',
      'Weekly verified impression & click-through telemetry report',
    ],
  },
  {
    name: '24/7 Broadcast & Morning Briefing Underwriter',
    price: '$6,500 / month',
    badge: 'Most Popular • Flagship',
    featured: true,
    description:
      'Full-network visibility across the 24/7 PNN Autonomous Broadcast Stream (/watch), floating mini-player lower-third, and Daily Personalized Morning Briefings.',
    features: [
      '"Presented by" lower-third chyron badge on 24/7 Watch Hub',
      'Primary sponsor slot in Daily Personalized Morning Email Digest',
      '4 Sponsored Executive Thought-Leadership Dispatches per month',
      'Syndication amplification across X, Telegram, LinkedIn & Facebook',
    ],
  },
  {
    name: 'Enterprise Wire & B2B Syndication License',
    price: 'Custom / Annual',
    badge: 'Institutional & Media',
    description:
      'Real-time API, RSS 2.0, and webhook feed licensing for financial terminals, regional broadcasters, and corporate intelligence portals.',
    features: [
      'Low-latency JSON & MRSS feed access across 12 global bureaus',
      'Algorithmic valueScore & geopolitical sentiment metadata',
      'Custom topic & sovereign risk monitoring alerts',
      'Dedicated PNN Commercial Account Director',
    ],
  },
];

export default function AdvertisePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#002B49] via-[#001F35] to-[#000F1C] text-white rounded-2xl p-8 md:p-12 shadow-xl border-b-4 border-[#CC0000]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#CC0000] text-white text-xs font-headline font-bold uppercase tracking-widest px-3 py-1 rounded">
            <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" /> PNN Commercial Partnerships
          </div>
          <h1 className="font-headline font-black text-3xl md:text-5xl uppercase tracking-tight leading-[1.08]">
            Position Your Brand Before Global Decision-Makers
          </h1>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed">
            Prolific News Network (PNN) delivers 24/7 broadcast coverage, algorithmic high-value reporting, and regional dispatches across North America, Europe, Africa, Asia-Pacific, and Latin America.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:partnerships@prolific.news?subject=PNN%20Commercial%20Sponsorship%20Inquiry"
              className="bg-[#FFCC00] hover:bg-amber-400 text-[#002B49] font-headline font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded shadow transition"
            >
              Request Commercial Media Kit
            </a>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-headline font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded border border-white/20 transition"
            >
              Contact Advertising Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Audience Reach Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Global Bureaus & Desks', value: '12 Desks', sub: 'US, World, Africa, Asia, LatAm, Markets', icon: Globe },
          { label: 'Broadcast & Web Cadence', value: '24/7 Live', sub: '30-Minute Tier-1 Wire Refresh', icon: Radio },
          { label: 'Social Syndication Channels', value: '6 Platforms', sub: 'X, Telegram, LinkedIn, FB, Bluesky, Threads', icon: TrendingUp },
          { label: 'Executive Reader Profile', value: 'C-Suite & Policy', sub: 'High-Intent Financial & Civic Audience', icon: BarChart3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-1.5"
            >
              <div className="flex items-center justify-between text-[#CC0000]">
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="font-headline font-black text-2xl md:text-3xl text-[#002B49]">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Sponsorship Packages */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tight text-[#002B49]">
            Turnkey Sponsorship & Syndication Solutions
          </h2>
          <p className="text-sm text-gray-600">
            High-impact, clutter-free placements engineered for brand authority, executive recall, and measurable ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl p-6 flex flex-col justify-between border transition ${
                tier.featured
                  ? 'bg-[#002B49] text-white border-[#FFCC00] ring-2 ring-[#FFCC00]/40 shadow-xl'
                  : 'bg-white text-gray-900 border-gray-200 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded ${
                      tier.featured
                        ? 'bg-[#CC0000] text-white'
                        : 'bg-[#002B49]/10 text-[#002B49]'
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>
                <h3 className="font-headline font-black text-xl uppercase tracking-tight">
                  {tier.name}
                </h3>
                <div
                  className={`font-headline font-black text-3xl ${
                    tier.featured ? 'text-[#FFCC00]' : 'text-[#CC0000]'
                  }`}
                >
                  {tier.price}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    tier.featured ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {tier.description}
                </p>

                <ul className="space-y-2.5 pt-3 border-t border-current/10 text-xs">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          tier.featured ? 'text-[#FFCC00]' : 'text-emerald-600'
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6">
                <a
                  href={`mailto:partnerships@prolific.news?subject=${encodeURIComponent(
                    `PNN Inquiry: ${tier.name}`
                  )}`}
                  className={`w-full block text-center font-headline font-bold uppercase tracking-wider text-xs py-3 rounded transition ${
                    tier.featured
                      ? 'bg-[#FFCC00] hover:bg-amber-400 text-[#002B49]'
                      : 'bg-[#002B49] hover:bg-[#003B66] text-white'
                  }`}
                >
                  Reserve Placement
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Contact Strip */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#002B49] text-[#FFCC00] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base uppercase text-[#002B49]">
              Custom Global Brand Campaigns & Event Coverage
            </h3>
            <p className="text-xs text-gray-600">
              Direct inquiries: <span className="font-semibold text-[#002B49]">partnerships@prolific.news</span> • Official handles: <span className="font-semibold">@prolificnews</span>
            </p>
          </div>
        </div>
        <a
          href="mailto:partnerships@prolific.news"
          className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white font-headline font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded transition shrink-0"
        >
          <Mail className="w-4 h-4" /> Email Commercial Desk
        </a>
      </div>
    </div>
  );
}
