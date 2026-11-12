import React from 'react';
import Link from 'next/link';
import { Calendar, Search, Filter, Archive as ArchiveIcon, Clock, ChevronRight, ChevronLeft, Newspaper, ArrowRight } from 'lucide-react';
import { getArchivedArticles, CATEGORY_METADATA } from '../../lib/news-service';

export const revalidate = 300;

interface ArchivePageProps {
  searchParams: Promise<{
    category?: string;
    year?: string;
    month?: string;
    page?: string;
    q?: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: 'News Archive & Historical Broadcast Vault | Prolific News Network',
    description: 'Explore the complete historical record of Prolific News Network news coverage, verified wire dispatches, and broadcast analysis.',
  };
}

const CATEGORIES = [
  'All',
  'Politics',
  'US',
  'Business',
  'World',
  'Tech',
  'Opinion',
  'Sports',
  'Entertainment',
  'Lifestyle',
];

const AVAILABLE_YEARS = [2026, 2025, 2024];

const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const currentCategory = params.category || 'All';
  const currentYear = params.year ? parseInt(params.year, 10) : new Date().getFullYear();
  const currentMonth = params.month ? parseInt(params.month, 10) : undefined;
  const currentPage = params.page ? Math.max(1, parseInt(params.page, 10)) : 1;
  const searchQuery = params.q || '';

  const { articles, total, totalPages } = await getArchivedArticles({
    category: currentCategory === 'All' ? undefined : currentCategory,
    year: currentYear,
    month: currentMonth,
    search: searchQuery,
    page: currentPage,
    limit: 18,
  });

  const buildQueryUrl = (newPage: number) => {
    const query = new URLSearchParams();
    if (currentCategory !== 'All') query.set('category', currentCategory);
    query.set('year', currentYear.toString());
    if (currentMonth) query.set('month', currentMonth.toString());
    if (searchQuery) query.set('q', searchQuery);
    query.set('page', newPage.toString());
    return `/archive?${query.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Archive Vault Masthead */}
      <div className="border-b-4 border-[#002B49] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#002B49] text-white text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <ArchiveIcon className="w-3.5 h-3.5 text-[#CC0000]" />
              Historical Records
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Permanent Record & Verified Dispatches
            </span>
          </div>
          <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tight text-[#002B49]">
            Prolific News Vault
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            Search and inspect indexed coverage across national politics, international affairs, financial markets, and breaking wire developments.
          </p>
        </div>

        {/* Live Wire Shortcut */}
        <div className="flex items-center gap-3">
          <Link
            href="/watch"
            className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#AA0000] text-white px-4 py-2.5 rounded font-headline font-bold text-xs uppercase tracking-wider transition shadow-sm"
          >
            <span>Live Broadcast Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
            return (
              <Link
                key={cat}
                href={`/archive?category=${cat}&year=${currentYear}${currentMonth ? `&month=${currentMonth}` : ''}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
                className={`px-3 py-1.5 rounded text-xs font-headline font-bold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-[#002B49] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Year, Month & Search Form */}
        <form method="GET" action="/archive" className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input type="hidden" name="category" value={currentCategory} />

          {/* Year Dropdown */}
          <select
            name="year"
            defaultValue={currentYear}
            className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#002B49]"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month Dropdown */}
          <select
            name="month"
            defaultValue={currentMonth ? currentMonth.toString() : ''}
            className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#002B49]"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search historical vault..."
              className="w-full bg-white border border-gray-300 rounded pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            type="submit"
            className="bg-[#002B49] text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#001A2C] transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
        <span>
          Showing {articles.length} of {total} Recorded Dispatches ({currentCategory} • {currentYear} {currentMonth ? `• ${MONTHS.find(m => m.value === currentMonth.toString())?.label}` : ''})
        </span>
        {searchQuery && (
          <span className="text-[#CC0000]">
            Filtered by keyword: &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </div>

      {/* High-Density Archive Grid */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const formattedDate = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Archive Record';

              return (
                <article
                  key={article.id}
                  className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition group"
                >
                  {/* Media Image */}
                  <Link href={`/article/${article.slug}`} className="relative aspect-video bg-gray-100 overflow-hidden block">
                    <img
                      src={article.leadMedia?.thumbnailUrl || article.leadMedia?.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-[#002B49] text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                  </Link>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold mb-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{article.readTimeMinutes}m read</span>
                      </div>

                      <Link href={`/article/${article.slug}`}>
                        <h3 className="font-headline font-bold text-base text-[#111827] group-hover:text-[#CC0000] transition line-clamp-2 uppercase leading-snug">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-600 line-clamp-3 mt-1.5 leading-relaxed">
                        {article.subtitle}
                      </p>
                    </div>

                    {/* Footer Attribution */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-gray-500">
                        By {article.author?.name || 'Prolific Newsroom'}
                      </span>
                      <Link
                        href={`/article/${article.slug}`}
                        className="text-[#002B49] font-bold uppercase tracking-wider group-hover:text-[#CC0000] inline-flex items-center gap-0.5"
                      >
                        <span>Read Story</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-200">
              {currentPage > 1 ? (
                <Link
                  href={buildQueryUrl(currentPage - 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded text-xs font-headline font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded text-xs font-headline font-bold uppercase tracking-wider text-gray-400 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 px-3">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={buildQueryUrl(currentPage + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-[#002B49] hover:bg-[#001A2C] text-white rounded text-xs font-headline font-bold uppercase tracking-wider transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded text-xs font-headline font-bold uppercase tracking-wider text-gray-400 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center bg-gray-50 rounded border border-dashed border-gray-300">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-headline font-black text-lg text-gray-800 uppercase tracking-tight">
            No Historical Records Found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            No stories match the selected criteria for {currentCategory} in {currentYear}. Try clearing the search query or selecting another section.
          </p>
          <Link
            href="/archive"
            className="inline-block mt-4 text-xs font-bold text-[#CC0000] uppercase tracking-wider hover:underline"
          >
            Reset All Filters
          </Link>
        </div>
      )}
    </div>
  );
}
