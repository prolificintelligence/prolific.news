import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Play, Flame, Radio, ChevronRight, Newspaper } from 'lucide-react';
import { getArticlesByCategory, CATEGORY_METADATA } from '../../../lib/news-service';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const meta = CATEGORY_METADATA[slug.toLowerCase()] || {
    name: slug.toUpperCase(),
    description: `Breaking news and live reporting on ${slug}.`,
  };

  return {
    title: `${meta.name} News, Analysis & Live Video | Prolific News Network`,
    description: meta.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await getArticlesByCategory(slug);

  const { categoryInfo, leadArticle, secondaryArticles, wireBulletins } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Category Masthead Header (Fox News Benchmark) */}
      <div className="border-b-4 border-[#002B49] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#CC0000] text-white text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded">
              Section Desk
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Updates
            </span>
          </div>
          <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tight text-[#002B49]">
            {categoryInfo.name}
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl leading-relaxed">
            {categoryInfo.description}
          </p>
        </div>

        {/* Live Watch Stream Shortcut */}
        <Link
          href="/watch"
          className="inline-flex items-center gap-2 bg-[#002B49] hover:bg-[#001A2C] text-white px-4 py-2 rounded font-headline font-bold text-xs uppercase tracking-wider transition whitespace-nowrap"
        >
          <Radio className="w-4 h-4 text-[#CC0000] animate-pulse" />
          <span>Watch 24/7 Live Coverage</span>
        </Link>
      </div>

      {/* Super Hero Lead Story Package */}
      {leadArticle && (
        <section className="bg-white border-b-2 border-gray-200 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Big Headline & Key Developments (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#CC0000] text-white text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Top Story
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {leadArticle.category} • Updated {leadArticle.readTimeMinutes}m ago
                </span>
              </div>

              <Link href={`/article/${leadArticle.slug}`} className="group">
                <h2 className="font-headline font-black text-3xl md:text-5xl text-[#111827] leading-[1.08] tracking-tight group-hover:text-[#CC0000] transition uppercase">
                  {leadArticle.title}
                </h2>
              </Link>

              {leadArticle.subtitle && (
                <p className="text-gray-700 text-base md:text-lg font-serif leading-relaxed">
                  {leadArticle.subtitle}
                </p>
              )}

              {/* Signature Fox News 3-Bullet Box */}
              {leadArticle.keyDevelopments && leadArticle.keyDevelopments.length > 0 && (
                <div className="bg-[#F8F9FA] border-l-4 border-[#002B49] p-4 rounded-r mt-2">
                  <h3 className="font-headline font-black text-xs uppercase tracking-wider text-[#002B49] mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#CC0000]"></span>
                    Key Developments
                  </h3>
                  <ul className="space-y-1.5">
                    {leadArticle.keyDevelopments.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800 leading-snug">
                        <span className="text-[#CC0000] font-black text-base leading-none select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center gap-4 text-xs font-bold text-gray-600">
                <span>By <strong className="text-gray-900">{leadArticle.author?.name || 'Prolific Correspondent'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {leadArticle.readTimeMinutes} min read
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Container (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-2">
              <div className="relative aspect-[16/10] w-full rounded overflow-hidden bg-black shadow-md group">
                <img
                  src={leadArticle.leadMedia?.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'}
                  alt={leadArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <Link
                  href={`/article/${leadArticle.slug}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300"
                >
                  <span className="bg-[#CC0000] text-white p-3 rounded-full shadow-lg transform group-hover:scale-110 transition">
                    <Play className="w-6 h-6 fill-white" />
                  </span>
                </Link>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="inline-block bg-[#CC0000] text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow mb-1">
                    Multimedia Report
                  </span>
                </div>
              </div>
              {leadArticle.leadMedia?.caption && (
                <p className="text-[11px] text-gray-500 italic leading-snug">
                  {leadArticle.leadMedia.caption}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Grid: Secondary Stories & Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center Stories Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-b-2 border-[#002B49] pb-2 flex items-center justify-between">
            <h3 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49]">
              Featured {categoryInfo.name} Coverage
            </h3>
            <span className="text-xs font-bold text-gray-500 uppercase">
              {secondaryArticles.length} Stories Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryArticles.map((art) => (
              <article key={art.id} className="flex flex-col group space-y-2 border-b md:border-b-0 pb-4 md:pb-0 border-gray-100">
                <div className="aspect-[16/10] w-full rounded overflow-hidden bg-gray-100 relative shadow-sm">
                  <img
                    src={art.leadMedia?.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {art.isBreaking && (
                    <span className="absolute top-2 left-2 bg-[#CC0000] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                      Breaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-bold text-[#002B49] uppercase tracking-wider">
                  {art.category} • {art.readTimeMinutes} min read
                </div>
                <Link
                  href={`/article/${art.slug}`}
                  className="font-headline font-black text-lg text-gray-900 group-hover:text-[#CC0000] leading-tight transition"
                >
                  {art.title}
                </Link>
                {art.subtitle && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-serif">
                    {art.subtitle}
                  </p>
                )}
                <div className="pt-1 text-[11px] font-bold text-gray-500">
                  By {art.author?.name || 'Staff Correspondent'}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right Rail: Category Wire Desk & Trending (4 cols) */}
        <aside className="lg:col-span-4 border-l-0 lg:border-l border-gray-200 lg:pl-6 space-y-6">
          <div className="bg-[#002B49] text-white p-4 rounded shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CC0000] animate-ping"></span>
              <h4 className="font-headline font-black text-sm uppercase tracking-widest text-[#FFCC00]">
                {categoryInfo.name} Wire Desk
              </h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Real-time dispatches filed by verified correspondents and wire services worldwide.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline font-black text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1">
              Latest Bulletins
            </h4>
            <ul className="divide-y divide-gray-100">
              {wireBulletins.map((bulletin) => (
                <li key={bulletin.id} className="py-3 group">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase mb-1">
                    <span className="text-[#CC0000]">{bulletin.category}</span>
                    <span>•</span>
                    <span>{bulletin.timeAgo}</span>
                  </div>
                  <Link
                    href={`/article/${bulletin.slug}`}
                    className="font-headline font-bold text-sm text-gray-900 group-hover:text-[#CC0000] group-hover:underline leading-snug line-clamp-2 transition"
                  >
                    {bulletin.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Newsletter Box */}
          <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded text-center space-y-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-[#002B49]">
              Prolific Alerts
            </span>
            <p className="font-headline font-black text-sm uppercase leading-tight text-gray-900">
              Get {categoryInfo.name} News Sent Directly To Your Inbox
            </p>
            <input
              type="email"
              placeholder="Your email address"
              className="w-full text-xs text-gray-900 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#002B49]"
            />
            <button className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-headline font-bold text-xs uppercase py-2 rounded tracking-wider transition">
              Subscribe Free
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
