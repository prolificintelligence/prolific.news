import React from 'react';
import Link from 'next/link';
import { Play, Flame, Clock } from 'lucide-react';
import { Article } from '@prolific/types';

interface HeroLeadPackageProps {
  article: Article;
}

export function HeroLeadPackage({ article }: HeroLeadPackageProps) {
  const getRelativeTime = (pubDate?: string) => {
    if (!pubDate) return 'Just now';
    const diffMins = Math.max(1, Math.floor((Date.now() - new Date(pubDate).getTime()) / 60000));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <section className="bg-white border-b-2 border-gray-200 py-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Main Column: Giant Headline & Key Developments (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#CC0000] text-white text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              Lead Story
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase">
              {article.category} • Updated {getRelativeTime(article.publishedAt)}
            </span>
          </div>

          <Link href={`/article/${article.slug}`} className="group">
            <h1 className="font-headline font-black text-3xl md:text-5xl lg:text-6xl text-[#111827] leading-[1.05] tracking-tight group-hover:text-[#002B49] transition">
              {article.title}
            </h1>
          </Link>

          {article.subtitle && (
            <p className="text-gray-700 text-lg md:text-xl font-serif leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Key Developments Bullet Box (Fox News Signature Feature) */}
          <div className="bg-[#F8F9FA] border-l-4 border-[#002B49] p-4 rounded-r mt-2">
            <h2 className="font-headline font-black text-sm uppercase tracking-wider text-[#002B49] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CC0000]"></span>
              Key Developments
            </h2>
            <ul className="space-y-2">
              {article.keyDevelopments.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-800 leading-snug">
                  <span className="text-[#CC0000] font-black text-base leading-none select-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs font-bold text-gray-600">
            <span>By <strong className="text-gray-900">{article.author.name}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {article.readTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Right Column: Lead Media Video / High-Impact Visual (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2">
          <div className="relative aspect-video w-full rounded overflow-hidden bg-black shadow-lg group">
            {/* Visual Thumbnail */}
            <img
              src={article.leadMedia?.thumbnailUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80'}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Live/Video Tag */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-[#CC0000] text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Video Report
              </span>
            </div>

            {/* Play Button Overlay */}
            <Link
              href={`/article/${article.slug}`}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#CC0000]/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#CC0000] transition duration-200">
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </div>
            </Link>

            {/* Caption in video frame */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="text-xs font-semibold line-clamp-1 drop-shadow">
                {article.leadMedia?.caption || 'Special broadcast report streaming now on Prolific News.'}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 italic">
            Photo/Video: Prolific News Digital Broadcast Pool
          </p>
        </div>
      </div>
    </section>
  );
}
