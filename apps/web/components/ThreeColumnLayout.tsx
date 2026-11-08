import React from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Radio, Flame, Clock } from 'lucide-react';
import { Article, VideoClip } from '@prolific/types';

interface ThreeColumnLayoutProps {
  wireArticles: Array<{ id: string; title: string; category: string; timeAgo: string; slug: string }>;
  centerArticles: Article[];
  videoClips: VideoClip[];
}

export function ThreeColumnLayout({ wireArticles, centerArticles, videoClips }: ThreeColumnLayoutProps) {
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

          {/* Quick Newsletter Signup Widget */}
          <div className="bg-[#001A2C] text-white p-4 rounded text-center space-y-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#FFCC00]">
              Prolific Morning Brief
            </span>
            <p className="font-headline font-black text-base uppercase leading-tight">
              Get Breaking Alerts Delivered Directly To Your Inbox
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full text-xs text-gray-900 px-3 py-2 rounded focus:outline-none"
            />
            <button className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-headline font-bold text-xs uppercase py-2 rounded tracking-wider transition">
              Subscribe Free
            </button>
          </div>
        </aside>

        {/* Center Column: Primary News Stories & Live Blogs (6 cols) */}
        <main className="lg:col-span-6 space-y-8">
          <div className="border-b-2 border-[#002B49] pb-2 flex items-center justify-between">
            <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49]">
              Featured Coverage
            </h2>
            <Link href="/news" className="text-xs font-bold text-[#CC0000] hover:underline uppercase">
              View All News →
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
                Special Briefing: Federal Reserve Announces Benchmark Interest Decision
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
                <div className="aspect-[16/10] w-full rounded overflow-hidden bg-gray-100 relative">
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
                </div>
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

        {/* Right Column: Video Hub & Editorial Opinion (3 cols) */}
        <aside className="lg:col-span-3 border-l-0 lg:border-l border-gray-200 lg:pl-6 space-y-8">
          {/* Video Hub Section */}
          <div className="space-y-4">
            <div className="border-b-2 border-[#CC0000] pb-2 flex items-center justify-between">
              <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49] flex items-center gap-2">
                <Play className="w-4 h-4 fill-[#CC0000] text-[#CC0000]" />
                Prolific Video
              </h2>
              <Link href="/watch" className="text-[10px] font-bold text-gray-500 uppercase hover:underline">
                Watch More
              </Link>
            </div>

            <div className="space-y-4">
              {videoClips.map((clip) => (
                <div key={clip.id} className="group cursor-pointer">
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
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono font-bold px-1 rounded">
                      {Math.floor(clip.durationSeconds / 60)}:{(clip.durationSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-xs text-gray-900 group-hover:text-[#CC0000] leading-snug line-clamp-2">
                    {clip.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          {/* Fox News Style Opinion Columnists */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="border-b-2 border-[#002B49] pb-2">
              <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49]">
                Opinion & Analysis
              </h2>
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
                  <Link href="/article/opinion-electoral-coalitions" className="font-headline font-bold text-xs text-gray-900 group-hover:text-[#002B49] leading-tight block">
                    The real reason the working-class voter coalition is transforming American politics
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
                  <Link href="/article/opinion-energy-grid-reality" className="font-headline font-bold text-xs text-gray-900 group-hover:text-[#002B49] leading-tight block">
                    Why energy independence remains the linchpin of national security
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
              Watch uncensored documentaries, historical specials, and live commercial-free feeds.
            </p>
            <Link
              href="/plus"
              className="inline-block bg-[#FFCC00] hover:bg-[#E6B800] text-[#002B49] font-headline font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition mt-2"
            >
              Start 7-Day Free Trial
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
