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
  ArrowRight,
  Layers,
} from 'lucide-react';

export const metadata = {
  title: 'B2B Desk Sponsorships & Editorial Partnerships | Prolific News Network (PNN)',
  description:
    'Partner with Prolific News Network. Category desk underwriting across emerging markets (Africa, LatAm, Asia, Tech, Markets), 24/7 broadcast stream lower-third placement, and executive intelligence briefings.',
};

const TIERS = [
  {
    name: 'Emerging Markets Desk Partner',
    price: '$350 / month',
    badge: 'High-Growth Corridors • Most Popular',
    featured: true,
    description:
      'Exclusive 30-day category ownership, persistent desk partner header, and co-branded attribution across any single PNN Regional or Sector Desk (Africa, LatAm, Asia, Tech, or Markets).',
    features: [
      '100% Share-of-Voice header partner badge on chosen Desk front page',
      '1 Executive Q&A or Thought-Leadership feature published to the desk',
      'Primary sponsor credit in weekly regional briefing dispatches',
      'Co-branded social attribution on @prolificnews channels (X, Telegram, Bluesky)',
      '2 Complimentary Priority Commercial Wire releases included ($298 value)',
      'First-party reader engagement & dwell time telemetry report',
    ],
    ctaText: 'Lock Desk Sponsorship ($350/mo)',
    inquirySubject: 'PNN Desk Sponsorship Reservation ($350/mo)',
  },
  {
    name: '24/7 Broadcast & Morning Briefing Underwriter',
    price: '$650 / month',
    badge: 'Flagship • Multi-Platform',
    featured: false,
    description:
      'Multi-channel institutional visibility across the 24/7 PNN Broadcast Stream (/watch), floating mini-player lower-third chyron, and Daily Morning Executive Email Briefings.',
    features: [
      '"Presented by" lower-third chyron badge on 24/7 Watch Hub & Live Stream',
      'Primary sponsor slot in Daily Morning Intelligence Email Briefing',
      '2 In-Depth Executive Thought-Leadership Dispatches per month',
      'Cross-syndication amplification across X, Telegram, Bluesky & Discord',
      '4 Complimentary Priority Commercial Wire releases included ($596 value)',
      'Verified corporate partner profile permanently indexed on PNN',
    ],
    ctaText: 'Lock Briefing Underwriting ($650/mo)',
    inquirySubject: 'PNN Flagship Underwriter Reservation ($650/mo)',
  },
  {
    name: 'Enterprise Wire & Intelligence Feed License',
    price: 'Custom / Annual',
    badge: 'Institutional & Financial',
    featured: false,
    description:
      'Real-time low-latency JSON, MRSS 2.0, and webhook news feed licensing for financial terminals, hedge funds, corporate intelligence portals, and media syndicates.',
    features: [
      'Low-latency JSON & MRSS 2.0 feed access across all 12 global bureaus',
      'Structured algorithmic valueScore & geopolitical sentiment metadata',
      'Custom keyword, sovereign risk, and emerging market trade alerts',
      'Unlimited priority commercial announcement staging queue',
      'Dedicated PNN Commercial Account Director with 15-minute SLA',
    ],
    ctaText: 'Contact Institutional Desk',
    inquirySubject: 'PNN Enterprise Wire & Feed Licensing Inquiry',
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
            Position Your Brand Before Decision-Makers in High-Growth Corridors
          </h1>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed font-serif">
            Prolific News Network (PNN) combines 24/7 continuous broadcast coverage with high-density reporting across emerging markets—delivering over 200 published dispatches across Africa, Latin America, and Asia-Pacific.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:partnerships@prolific.news?subject=PNN%20Desk%20Sponsorship%20Inquiry"
              className="bg-[#FFCC00] hover:bg-amber-400 text-[#002B49] font-headline font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded shadow transition"
            >
              Inquire Desk Sponsorship
            </a>
            <Link
              href="/submit-press-release"
              className="bg-white/10 hover:bg-white/20 text-white font-headline font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded border border-white/20 transition flex items-center gap-1.5"
            >
              <span>Submit Wire Release ($79)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Network Reach & Density Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Published Catalog', value: '560+ Articles', sub: 'Across 12 Global Desks', icon: Globe },
          { label: 'Emerging Market Focus', value: '37% of Catalog', sub: 'Africa (73), LatAm (70), Asia (68)', icon: Layers },
          { label: 'Broadcast Infrastructure', value: '24/7 Live Stream', sub: 'Public Domain Watch Hub (/watch)', icon: Radio },
          { label: 'Autonomous Syndication', value: '6 Platforms', sub: 'Telegram, Bluesky, Mastodon, X, Discord', icon: TrendingUp },
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
            Targeted Sponsorship & Category Ownership
          </h2>
          <p className="text-sm text-gray-600">
            Priced for discretionary marketing approval. No six-month procurement cycles or bloated agency markups.
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
                    tier.inquirySubject
                  )}&body=${encodeURIComponent(
                    `Hello PNN Commercial Desk,\n\nWe would like to reserve the ${tier.name} (${tier.price}).\n\nCompany Name:\nTarget Desk / Sector:\nPreferred Start Date:\nContact Person:\n\nThank you.`
                  )}`}
                  className={`w-full block text-center font-headline font-bold uppercase tracking-wider text-xs py-3 rounded transition ${
                    tier.featured
                      ? 'bg-[#FFCC00] hover:bg-amber-400 text-[#002B49]'
                      : 'bg-[#002B49] hover:bg-[#003B66] text-white'
                  }`}
                >
                  {tier.ctaText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wire Cross-Promotion Callout */}
      <div className="bg-gradient-to-r from-[#001A2C] to-[#002B49] text-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-[#FFCC00]/20">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-[#FFCC00]">
            Self-Service Press Wire Distribution
          </span>
          <h3 className="font-headline font-black text-xl md:text-2xl uppercase">
            Need Fast-Track Publishing For A Specific Corporate Announcement?
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Publish your company funding announcements, product rollouts, or partnership dispatches directly into our Google News XML sitemap and autonomous syndication rails within 60 minutes.
          </p>
        </div>
        <Link
          href="/submit-press-release"
          className="bg-[#FFCC00] hover:bg-amber-400 text-[#002B49] font-headline font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded shrink-0 shadow transition flex items-center gap-2"
        >
          <span>Submit Wire Release ($79)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Direct Contact Strip */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#002B49] text-[#FFCC00] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base uppercase text-[#002B49]">
              Custom Enterprise Campaigns & Executive Roundtables
            </h3>
            <p className="text-xs text-gray-600">
              Commercial Desk: <span className="font-semibold text-[#002B49]">partnerships@prolific.news</span> • Wire Desk: <span className="font-semibold">wire@prolific.news</span>
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
