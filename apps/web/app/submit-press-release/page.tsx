'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Globe,
  Radio,
  FileText,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const PACKAGES = [
  {
    id: 'standard',
    name: 'Standard Wire Publication',
    price: '$49',
    badge: 'Fast Turnaround',
    description: 'Guaranteed permanent indexed publication across the Prolific global network and Google News sitemap.',
    features: [
      'Published on Prolific News within 2 hours',
      'Included in Google News XML sitemap',
      'Targeted desk categorization (Tech, Markets, etc.)',
      'DoFollow canonical attribution backlinks',
      'Permanent hosted URL with zero recurring fees',
    ],
  },
  {
    id: 'priority',
    name: 'Priority Social Syndication',
    price: '$99',
    badge: 'Most Popular',
    featured: true,
    description: 'Maximum reach with automated syndication across official Telegram, Bluesky, and Mastodon broadcast feeds.',
    features: [
      'All Standard Wire Publication features',
      '24-Hour Regional Lead Hero placement',
      'Automated dispatch to Telegram (@prolificnews)',
      'Automated syndication to Bluesky & Mastodon',
      'First-party visitor & impression telemetry report',
    ],
  },
  {
    id: 'executive',
    name: 'Executive Partner Briefing',
    price: '$149',
    badge: 'Maximum Impact',
    description: 'Featured headline slot inside the Prolific Morning Intelligence Email Digest delivered directly to subscribers.',
    features: [
      'All Priority Social Syndication features',
      'Featured Sponsor Slot in Daily Morning Email Digest',
      'Permanent Executive Dispatch editorial badge',
      'Dedicated social media amplification thread',
      'Priority editorial desk review within 30 minutes',
    ],
  },
];

export default function SubmitPressReleasePage() {
  const [selectedPackage, setSelectedPackage] = useState('priority');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('Business');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/press-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage,
          companyName,
          contactEmail,
          headline,
          category,
          summary,
          content,
          mediaUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Failed to submit press release. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#001424] text-white min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#CC0000] text-white font-headline font-bold text-xs uppercase px-3 py-1 rounded tracking-wider">
            <Radio className="w-3.5 h-3.5 text-[#FFCC00]" />
            Self-Service Commercial Wire Submission
          </div>
          <h1 className="font-headline font-black text-3xl md:text-5xl uppercase tracking-tight text-white leading-tight">
            Distribute Your News Across <span className="text-[#FFCC00]">Global Desks</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-serif">
            Publish your company announcements, funding rounds, regulatory dispatches, and product launches to global decision-makers, financial analysts, and regional news audiences.
          </p>
        </div>

        {/* Pricing Tier Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`rounded-xl p-6 cursor-pointer transition flex flex-col justify-between border-2 relative ${
                selectedPackage === pkg.id
                  ? 'bg-gradient-to-b from-[#002B49] to-[#001A2C] border-[#FFCC00] shadow-2xl scale-[1.02]'
                  : 'bg-[#002038] border-gray-800 hover:border-gray-600'
              }`}
            >
              {pkg.badge && (
                <div
                  className={`absolute -top-3 right-4 text-[10px] font-headline font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                    selectedPackage === pkg.id ? 'bg-[#FFCC00] text-[#002B49]' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {pkg.badge}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-headline font-black text-lg uppercase text-white tracking-wide">
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline font-black text-3xl text-[#FFCC00]">{pkg.price}</span>
                  <span className="text-xs text-gray-400">/ release</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{pkg.description}</p>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-200 mt-6 pt-4 border-t border-white/10">
                {pkg.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFCC00] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <div
                  className={`w-full py-2.5 text-center text-xs font-headline font-bold uppercase rounded tracking-wider ${
                    selectedPackage === pkg.id
                      ? 'bg-[#FFCC00] text-[#002B49]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {selectedPackage === pkg.id ? 'Selected Tier' : 'Choose Tier'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submission Form or Success Message */}
        {submitted ? (
          <div className="bg-[#00233D] border border-emerald-500/50 rounded-xl p-8 md:p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-headline font-black text-2xl uppercase tracking-wide text-white">
              Press Release Submitted Successfully
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your press release has been received by the editorial desk. An invoice and tracking receipt have been dispatched to <strong className="text-white">{contactEmail}</strong>. Standard review and indexation will complete within your selected tier window.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-block bg-[#FFCC00] text-[#002B49] font-headline font-black text-xs uppercase px-6 py-3 rounded tracking-wider hover:bg-amber-400 transition"
              >
                Return to Network Wire
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#00233D] border border-gray-800 rounded-xl p-6 md:p-10 space-y-6 max-w-3xl mx-auto shadow-2xl"
          >
            <div className="border-b border-gray-700 pb-4">
              <h2 className="font-headline font-black text-xl uppercase tracking-wide text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FFCC00]" />
                Press Release Details & Editorial Filing
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Selected Package:{' '}
                <strong className="text-[#FFCC00]">
                  {PACKAGES.find((p) => p.id === selectedPackage)?.name} ({PACKAGES.find((p) => p.id === selectedPackage)?.price})
                </strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-950/50 border border-rose-500/50 rounded text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Quantum Labs Inc."
                  className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Contact / Invoicing Email *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="media@yourcompany.com"
                  className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Official Headline *
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Apex Quantum Labs Secures $24M Series A to Expand Regional Grid Infrastructure"
                  className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Primary Desk Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFCC00]"
                >
                  <option value="Business">Business & Markets</option>
                  <option value="Tech">Technology & AI</option>
                  <option value="Politics">Policy & Regulation</option>
                  <option value="Africa">Africa Desk</option>
                  <option value="Asia">Asia-Pacific Desk</option>
                  <option value="LatAm">Latin America Desk</option>
                  <option value="World">Global Affairs</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Executive Subtitle / Lead Summary (1-2 sentences) *
              </label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key takeaway: Funding round co-led by international institutional investors to accelerate energy grid software across 4 major regions."
                className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Full Press Release Body *
              </label>
              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Include full text, quotes from leadership, background details, and company overview (boilerplate)..."
                className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Lead Image or Company Logo URL (Optional)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://yourcompany.com/assets/press-image.jpg"
                className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FFCC00] hover:bg-amber-400 text-[#002B49] font-headline font-black text-sm uppercase py-4 rounded tracking-wider transition shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Filing Wire Dispatch...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Press Release & Reserve Slot</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
