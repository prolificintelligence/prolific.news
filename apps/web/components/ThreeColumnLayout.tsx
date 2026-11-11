'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Flame, CheckCircle2, Share2, Globe } from 'lucide-react';
import { Article, VideoClip } from '@prolific/types';

interface ThreeColumnLayoutProps {
  wireArticles: Array<{ id: string; title: string; category: string; timeAgo: string; slug: string }>;
  centerArticles: Article[];
  videoClips: VideoClip[];
}

export function ThreeColumnLayout({ wireArticles, centerArticles, videoClips }: ThreeColumnLayoutProps) {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleQuickSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubStatus('loading');
    try {
      await fetch('/api/subscribe/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          regions: ['Global', 'US', 'Africa', 'Asia'],
          topics: ['Politics', 'Business', 'Tech'],
          frequency: 'DAILY_MORNING',
        }),
      });
      setSubStatus('done');
      setEmail('');
    } catch {
      setSubStatus('done');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: The Wire / Latest Fast Bulletins (3 cols) */}
        <aside className="lg:col-span-3 border-r-0 lg:border-r border-gray-200 lg:pr-6 space-y-6">
          <div className="border-b-2 border-[#002B49] pb-2 flex items-center justify-between">
            <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#CC0000]"></span>
              Latest Bulletins
            </h2>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Live Wire
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {wireArticles.map((wire) => (
              <article key={wire.id} className="py-3 group">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase mb-1">
                  <span className="text-[#CC0000]">{wire.timeAgo}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{wire.category}</span>
                </div>
                <Link
                  href={`/article/${wire.slug}`}
                  className="font-headline font-bold text-sm text-gray-900 group-hover:text-[#CC0000] transition line-clamp-3 leading-snug"
                >
                  {wire.title}
                </Link>
              </article>
            ))}
          </div>

          {/* Connected Quick Newsletter Signup Widget */}
          <form
            onSubmit={handleQuickSubscribe}
            className="bg-[#001A2C] text-white p-4 rounded text-center space-y-3 border border-[#003B66]"
          >
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#FFCC00]">
              Prolific Morning Brief
            </span>
            <p className="font-headline font-black text-base uppercase leading-tight">
              Get Breaking Alerts Delivered Directly To Your Inbox
            </p>
            {subStatus === 'done' ? (
              <div className="bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs p-2.5 rounded flex items-center justify-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed to PNN Briefings!</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full text-xs text-gray-900 px-3 py-2 rounded focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'loading'}
                  className="w-full bg-[#CC0000] hover:bg-[#B30000] disabled:opacity-50 text-white font-headline font-bold text-xs uppercase py-2 rounded tracking-wider transition"
                >
                  {subStatus === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </>
            )}
          </form>

          {/* Official @prolificnews Social Wire Follow Box */}
          <div className="bg-white border border-gray-200 rounded p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-headline font-black text-xs uppercase tracking-wider text-[#002B49] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#CC0000]" />
                Official Social Wire
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600">@prolificnews</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Follow automated real-time dispatches syndicated across official Prolific News Network channels:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-headline font-bold uppercase">
              <a
                href="https://x.com/prolificnews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-2.5 py-1.5 rounded text-center hover:opacity-90 transition"
              >
                X / Twitter
              </a>
              <a
                href="https://t.me/prolificnews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0088cc] text-white px-2.5 py-1.5 rounded text-center hover:opacity-90 transition"
              >
                Telegram
              </a>
              <a
                href="https://linkedin.com/company/prolificnews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0A66C2] text-white px-2.5 py-1.5 rounded text-center hover:opacity-90 transition"
              >
                LinkedIn
              </a>
              <a
                href="/feed.xml"
                className="bg-[#002B49] text-[#FFCC00] px-2.5 py-1.5 rounded text-center hover:opacity-90 transition"
              >
                RSS 2.0 Feed
              </a>
            </div>
          </div>
        </aside>

        {/* Center Column: Primary News Stories & Live Blogs (6 cols) */}
        <main className="lg:col-span-6 space-y-8">
          <div className="border-b-2 border-[#002B49] pb-2 flex items-center justify-between">
            <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49]">
              Featured Coverage
            </h2>
            <Link href="/archive" className="text-xs font-bold text-[#CC0000] hover:underline uppercase">
              View News Archive →
            </Link>
          </div>

          {/* Live Blog Pinned Container */}
          <div className="bg-gradient-to-r from-[#002B49] to-[#0A3F66] text-white rounded p-4 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#CC0000] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded animate-pulse">
                  Live Blog
                </span>
                <span className="text-xs text-gray-300 font-bold uppercase">Ongoing Coverage</span>
              </div>
              <h3 className="font-headline font-black text-xl uppercase tracking-wide">
                Special Briefing: Federal Reserve & Global Central Bank Rate Outlook
              </h3>
            </div>
            <Link
              href="/live/federal-reserve-decision"
              className="bg-white hover:bg-gray-100 text-[#002B49] font-headline font-black text-xs uppercase px-4 py-2 rounded tracking-wider whitespace-nowrap transition"
            >
              Open Live Blog
            </Link>
          </div>

          {/* Secondary Story Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centerArticles.map((article) => (
              <article key={article.id} className="flex flex-col group space-y-2">
                <Link
                  href={`/article/${article.slug}`}
                  className="aspect-[16/10] w-full rounded overflow-hidden bg-gray-100 relative block"
                >
                  <img
                    src={article.leadMedia?.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {article.isBreaking && (
                    <span className="absolute top-2 left-2 bg-[#CC0000] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                      Breaking
                    </span>
                  )}
                </Link>
                <div className="text-[10px] font-bold text-[#002B49] uppercase tracking-wider">
                  {article.category}
                </div>
                <Link
                  href={`/article/${article.slug}`}
                  className="font-headline font-black text-lg text-gray-900 group-hover:text-[#CC0000] leading-tight transition"
                >
                  {article.title}
                </Link>
                {article.subtitle && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {article.subtitle}
                  </p>
                )}
              </article>
            ))}
          </div>
        </main>

        {/* Right Column: Video Hub, Opinion & Commercial Sponsorship (3 cols) */}
        <aside className="lg:col-span-3 border-l-0 lg:border-l border-gray-200 lg:pl-6 space-y-8">
          {/* Video Hub Section */}
          <div className="space-y-4">
            <div className="border-b-2 border-[#CC0000] pb-2 flex items-center justify-between">
              <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49] flex items-center gap-2">
                <Play className="w-4 h-4 fill-[#CC0000] text-[#CC0000]" />
                Prolific Video
              </h2>
              <Link href="/watch" className="text-[10px] font-bold text-gray-500 uppercase hover:underline">
                Watch 24/7 Hub
              </Link>
            </div>

            <div className="space-y-4">
              {videoClips.map((clip) => (
                <Link key={clip.id} href={`/watch?feature=${encodeURIComponent(clip.id)}`} className="group block">
                  <div className="aspect-video w-full rounded overflow-hidden bg-black relative mb-1.5 shadow-sm">
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-[#CC0000]/90 text-white flex items-center justify-center group-hover:scale-110 transition">
                        <Play className="w-4 h-4 fill-white translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-1.5 left-1.5 bg-[#002B49]/90 text-[#FFCC00] text-[9px] font-headline font-bold uppercase px-1.5 py-0.5 rounded">
                      {clip.category}
                    </span>
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono font-bold px-1 rounded">
                      {Math.floor(clip.durationSeconds / 60)}:{(clip.durationSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-xs text-gray-900 group-hover:text-[#CC0000] leading-snug line-clamp-2">
                    {clip.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          {/* Editorial Opinion Columnists */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="border-b-2 border-[#002B49] pb-2 flex items-center justify-between">
              <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49]">
                Opinion & Analysis
              </h2>
              <Link href="/category/opinion" className="text-[10px] font-bold uppercase text-[#CC0000] hover:underline">
                All Opinion
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Columnist"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#002B49] shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#CC0000]">Eleanor Vance</span>
                  <Link href="/category/opinion" className="font-headline font-bold text-xs text-gray-900 group-hover:text-[#002B49] leading-tight block">
                    How emerging trade corridors across Africa and Asia are reshaping global supply chains
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Columnist"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#002B49] shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#CC0000]">Marcus Sterling</span>
                  <Link href="/category/opinion" className="font-headline font-bold text-xs text-gray-900 group-hover:text-[#002B49] leading-tight block">
                    Why energy grid resilience and AI compute infrastructure are the new national security frontier
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Prolific Plus Banner Widget */}
          <div className="bg-gradient-to-br from-[#001A2C] to-[#003366] text-white p-4 rounded shadow border border-[#FFCC00]/30 space-y-2">
            <div className="flex items-center gap-1.5 text-[#FFCC00] font-headline font-black text-sm uppercase">
              <Flame className="w-4 h-4 fill-[#FFCC00]" />
              <span>Prolific Plus Exclusive</span>
            </div>
            <p className="font-headline font-bold text-xs uppercase leading-tight">
              Watch uncensored documentaries, executive briefings, and live commercial-free feeds.
            </p>
            <Link
              href="/plus"
              className="inline-block bg-[#FFCC00] hover:bg-[#E6B800] text-[#002B49] font-headline font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition mt-2"
            >
              Explore Prolific Plus
            </Link>
          </div>

          {/* Native Commercial Sponsorship Slot */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded p-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-headline font-bold uppercase tracking-widest text-gray-400">
              <span>Sponsored Placement</span>
              <Globe className="w-3 h-3 text-[#002B49]" />
            </div>
            <h4 className="font-headline font-bold text-xs uppercase text-[#002B49]">
              Advertise on Prolific News Network
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Sponsor regional desks, 24/7 broadcast streams, and executive morning digests.
            </p>
            <Link
              href="/advertise"
              className="inline-block text-[11px] font-headline font-bold uppercase text-[#CC0000] hover:underline"
            >
              View Commercial Media Kit →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
