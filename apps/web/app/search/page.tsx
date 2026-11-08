import React from 'react';
import Link from 'next/link';
import { Search, Flame, Globe, ArrowRight } from 'lucide-react';
import { createDb, articles, desc, eq, and, or, ilike } from '@prolific/db';
import { cleanTextSafely, cleanSubtitleSafely } from '../../lib/news-service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search Global Dispatches & News Archive | Prolific News Network',
  description:
    'Search breaking news, regional reports across Africa, Asia, Latin America, U.S., Politics, Markets, and Technology on Prolific News Network.',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

const CATEGORIES = [
  'All',
  'Politics',
  'US',
  'World',
  'Africa',
  'Asia',
  'LatAm',
  'Business',
  'Tech',
  'Sports',
  'Opinion',
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q || '').trim();
  const selectedCategory = (params.category || 'All').trim();

  let results: Array<{
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    category: string;
    geoRegion: string;
    imageUrl: string;
    isBreaking: boolean;
    valueScore: number;
    publishedAt: string;
  }> = [];

  try {
    const db = createDb();
    const conditions: any[] = [eq(articles.status, 'PUBLISHED')];

    if (query) {
      const pattern = `%${query}%`;
      conditions.push(
        or(
          ilike(articles.title, pattern),
          ilike(articles.subtitle, pattern),
          ilike(articles.content, pattern)
        )
      );
    }

    if (selectedCategory && selectedCategory !== 'All') {
      conditions.push(
        eq(articles.categoryId, `cat-${selectedCategory.toLowerCase()}`)
      );
    }

    const rows = await db
      .select()
      .from(articles)
      .where(and(...conditions))
      .orderBy(desc(articles.valueScore), desc(articles.publishedAt))
      .limit(36);

    results = rows.map((r) => {
      const cleanTitle = cleanTextSafely(r.title);
      const cat = r.categoryId.replace('cat-', '').toUpperCase();
      return {
        id: r.id,
        slug: r.slug,
        title: cleanTitle,
        subtitle: cleanSubtitleSafely(r.subtitle, cleanTitle, cat),
        category: cat,
        geoRegion: r.geoRegion || 'Global',
        imageUrl:
          r.leadMediaUrl ||
          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
        isBreaking: r.isBreaking,
        valueScore: r.valueScore || 75,
        publishedAt: r.publishedAt
          ? r.publishedAt.toISOString()
          : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('[SearchPage Error]:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Search Hero Box */}
      <div className="bg-[#002B49] text-white rounded-xl p-6 md:p-8 shadow-lg border-b-4 border-[#CC0000]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#CC0000] text-white text-[10px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded">
            <Globe className="w-3 h-3" /> PNN Intelligence Index
          </div>
          <h1 className="font-headline font-black text-2xl md:text-4xl uppercase tracking-tight">
            Search Global News & Wire Dispatches
          </h1>
          <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-2 pt-1">
            {selectedCategory !== 'All' && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search headlines, regions (Africa, Asia, Markets), policies, or companies..."
                className="w-full pl-10 pr-4 py-3 rounded bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#CC0000] hover:bg-red-700 text-white font-headline font-bold uppercase tracking-wider text-xs px-6 py-3 rounded transition"
            >
              Search Dispatches
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              const href =
                cat === 'All'
                  ? `/search${query ? `?q=${encodeURIComponent(query)}` : ''}`
                  : `/search?category=${encodeURIComponent(cat)}${
                      query ? `&q=${encodeURIComponent(query)}` : ''
                    }`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`text-[11px] font-headline font-bold uppercase tracking-wider px-3 py-1 rounded transition ${
                    active
                      ? 'bg-[#FFCC00] text-[#002B49]'
                      : 'bg-white/10 hover:bg-white/20 text-gray-200'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="font-headline font-black text-lg uppercase tracking-wider text-[#002B49] flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#CC0000]" />
          {query
            ? `Search Results for "${query}" (${results.length})`
            : selectedCategory !== 'All'
            ? `Top Dispatches in ${selectedCategory} (${results.length})`
            : `High-Impact Global Dispatches (${results.length})`}
        </h2>
        {(query || selectedCategory !== 'All') && (
          <Link
            href="/search"
            className="text-xs font-headline font-bold uppercase text-[#CC0000] hover:underline"
          >
            Clear Filters
          </Link>
        )}
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center space-y-3">
          <p className="text-gray-700 font-semibold">
            No matching dispatches found for &ldquo;{query}&rdquo;.
          </p>
          <p className="text-xs text-gray-500">
            Try broadening your keyword or exploring all global categories.
          </p>
          <Link
            href="/search"
            className="inline-block bg-[#002B49] text-white font-headline font-bold text-xs uppercase px-5 py-2.5 rounded tracking-wider"
          >
            View All Top Stories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((art) => (
            <Link
              key={art.id}
              href={`/article/${art.slug}`}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="bg-[#002B49] text-white text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                  {art.isBreaking && (
                    <span className="bg-[#CC0000] text-white text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Breaking
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-headline font-bold text-base text-gray-900 group-hover:text-[#CC0000] leading-snug transition line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {art.subtitle}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                  <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                  <span className="text-[#002B49] font-headline font-bold uppercase flex items-center gap-1 group-hover:text-[#CC0000]">
                    Read Dispatch <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
