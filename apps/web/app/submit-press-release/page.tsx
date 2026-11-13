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
  CreditCard,
  Lock,
  ArrowRight,
} from 'lucide-react';

const PACKAGES = [
  {
    id: 'standard',
    name: 'Standard Wire Publication',
    price: '$79',
    unitPrice: 79,
    badge: 'Fast Turnaround • 60 Mins',
    description: 'Guaranteed permanent indexed publication across the Prolific global network and Google News sitemap.',
    features: [
      'Published on Prolific News within 60 minutes',
      'Included in live Google News XML sitemap',
      'Targeted desk categorization (Tech, Markets, Africa, etc.)',
      'Permanent canonical link with Google-compliant rel="sponsored" attribution',
      'Instant syndication to Telegram (@prolificnews) & Bluesky feeds',
      'Zero recurring maintenance or renewal fees',
    ],
  },
  {
    id: 'priority',
    name: 'Priority Executive Spotlight',
    price: '$149',
    unitPrice: 149,
    badge: 'Most Popular • Maximum Impact',
    featured: true,
    description: 'Maximum reach with automated syndication across X, Bluesky, Telegram, and 24-hour lead story positioning.',
    features: [
      'All Standard Wire Publication features with 30-minute review',
      '24-Hour Regional Lead Hero placement on desk front page',
      'Dedicated sponsor mention in Daily Morning Intelligence Briefing',
      'Amplified syndication across X, Telegram, Bluesky & Discord',
      'First-party reader dwell time & verified impression telemetry report',
      'Permanent Executive Corporate Dispatch editorial disclosure',
    ],
  },
  {
    id: 'agency',
    name: 'Agency 5-Release Retainer Pack',
    price: '$399',
    unitPrice: 399,
    badge: 'Best Value For PR Agencies',
    description: 'Prepaid 5-release bundle ($79.80/release vs $149 retail). Ideal for boutique PR firms and multi-brand founders.',
    features: [
      '5 Priority Executive Spotlight wire releases ($745 total retail value)',
      'Credits never expire; stage on demand via self-serve portal',
      'Direct WhatsApp & email priority editorial line with wire editor',
      'Guaranteed 30-minute SLA from submission to live Google News indexing',
      'White-label monthly syndication & telemetry proof report for clients',
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
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedTier = PACKAGES.find((p) => p.id === selectedPackage) || PACKAGES[1];

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
        setSubmissionId(data.submissionId);
        setPaymentUrl(data.paymentUrl || null);
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Failed to submit press release. Please check fields and try again.');
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
            Commercial Press Wire & Rapid-Indexing Desk
          </div>
          <h1 className="font-headline font-black text-3xl md:text-5xl uppercase tracking-tight text-white leading-tight">
            Publish Corporate Dispatches Directly Into <span className="text-[#FFCC00]">Google News</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-serif">
            Guaranteed indexed publishing across 12 global bureaus, automated social push distribution, and Google-compliant canonical attribution. Built for startups, boutique PR agencies, and fast-moving enterprises.
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
                  <span className="text-xs text-gray-400">
                    {pkg.id === 'agency' ? 'for 5 releases' : '/ release'}
                  </span>
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
                  className={`w-full py-2.5 text-center text-xs font-headline font-bold uppercase rounded tracking-wider transition ${
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

        {/* Editorial Compliance Callout */}
        <div className="bg-[#001D33] border border-blue-500/30 rounded-lg p-4 flex items-start gap-3 text-xs text-gray-300">
          <ShieldCheck className="w-5 h-5 text-[#FFCC00] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white uppercase tracking-wider block">
              Google News Guidelines & Anti-Spam Compliance
            </span>
            <p className="leading-relaxed">
              Prolific News Network strictly adheres to Google Search Central's Link Spam Guidelines. All commercial hyperlinks are published with <code className="bg-black/40 px-1 py-0.5 rounded text-[#FFCC00] font-mono">rel="sponsored nofollow"</code>. Promotional gambling/casinos, unregulated cryptocurrency presales, adult content, and pharmaceutical submissions are strictly prohibited and automatically rejected.
            </p>
          </div>
        </div>

        {/* Submission Form or Success Message */}
        {submitted ? (
          <div className="bg-[#00233D] border border-emerald-500/50 rounded-xl p-8 md:p-12 text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-headline font-black text-2xl uppercase tracking-wide text-white">
              Commercial Wire Dispatch Filed Successfully
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your submission <strong className="text-[#FFCC00]">({submissionId})</strong> has been staged for priority review. A copy of your filing receipt and billing confirmation have been dispatched to <strong className="text-white">{contactEmail}</strong>.
            </p>

            <div className="bg-[#001A2C] border border-gray-700 rounded-lg p-5 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Package:</span>
                <span className="font-bold text-white uppercase">{selectedTier.name} ({selectedTier.price})</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Headline:</span>
                <span className="font-bold text-white truncate max-w-xs">{headline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Turnaround SLA:</span>
                <span className="font-bold text-emerald-400">
                  {selectedPackage === 'priority' || selectedPackage === 'agency' ? '30 Minutes' : '60 Minutes'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {paymentUrl ? (
                <a
                  href={paymentUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFCC00] text-[#002B49] font-headline font-black text-xs uppercase px-8 py-3.5 rounded tracking-wider hover:bg-amber-400 transition shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Complete Secure Payment ({selectedTier.price})</span>
                </a>
              ) : (
                <a
                  href={`mailto:wire@prolific.news?subject=${encodeURIComponent(
                    `Commercial Wire Payment Confirmation: ${submissionId}`
                  )}&body=${encodeURIComponent(
                    `Hello Wire Desk,\n\nI have filed submission ${submissionId} for ${selectedTier.name} (${selectedTier.price}). Please send invoice / payment settlement details.\n\nThank you.`
                  )}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFCC00] text-[#002B49] font-headline font-black text-xs uppercase px-8 py-3.5 rounded tracking-wider hover:bg-amber-400 transition shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Inquire Wire Desk Invoicing</span>
                </a>
              )}
              <Link
                href="/"
                className="w-full sm:w-auto inline-block bg-white/10 text-white font-headline font-bold text-xs uppercase px-6 py-3.5 rounded tracking-wider hover:bg-white/20 transition"
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
                Selected Tier:{' '}
                <strong className="text-[#FFCC00]">
                  {selectedTier.name} ({selectedTier.price})
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Full Press Release Body (Minimum 200 Words) *
                </label>
                <span className="text-[11px] text-gray-400 font-mono">
                  {content.trim() ? `${content.trim().split(/\s+/).length} words` : '0 words'}
                </span>
              </div>
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
                  <span>Submit Wire Release & Review Slot ({selectedTier.price})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
