import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageSquare, Radio, Play, Globe, TrendingUp } from 'lucide-react';
import { LiveStreamPlayer } from '../../../components/LiveStreamPlayer';
import { ArticleEngagementBar } from '../../../components/ArticleEngagementBar';
import { getArticleBySlug, getArticlesByCategory } from '../../../lib/news-service';
import { DEFAULT_PUBLIC_DOMAIN_VIDEO_URL } from '../../../lib/video-catalog';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Prolific News Network',
      description: 'The requested news article could not be located in the Prolific News newsroom index.',
    };
  }

  const cleanTitle = article.title;
  const cleanDesc = article.subtitle || `Reporting on ${article.category} via Prolific News Network.`;
  const ogDynamicUrl = `https://prolific.news/api/og?title=${encodeURIComponent(
    cleanTitle
  )}&category=${encodeURIComponent(article.category)}&author=${encodeURIComponent(
    article.author?.name || 'PNN Global Desk'
  )}`;
  const imageUrl =
    article.leadMedia?.url ||
    article.leadMedia?.thumbnailUrl ||
    ogDynamicUrl;

  return {
    title: `${cleanTitle} | Prolific News Network`,
    description: cleanDesc,
    alternates: {
      canonical: `https://prolific.news/article/${slug}`,
    },
    openGraph: {
      title: `${cleanTitle} | Prolific News Network`,
      description: cleanDesc,
      url: `https://prolific.news/article/${slug}`,
      siteName: 'Prolific News Network',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
        {
          url: ogDynamicUrl,
          width: 1200,
          height: 630,
          alt: `${cleanTitle} — PNN Broadcast Card`,
        },
      ],
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author?.name || 'Prolific Newsroom'],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@prolificnews',
      creator: '@prolificnews',
      title: cleanTitle,
      description: cleanDesc,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const catData = await getArticlesByCategory(article.category.toLowerCase());
  const relatedStories = [
    ...(catData.leadArticle ? [catData.leadArticle] : []),
    ...catData.secondaryArticles,
  ].filter((s) => s.slug !== slug);

  const plainTextBody = (article.content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://prolific.news/article/${article.slug}`,
      },
      headline: article.title,
      description: article.subtitle || article.title,
      image: [
        article.leadMedia?.thumbnailUrl ||
          article.leadMedia?.url ||
          `https://prolific.news/api/og?title=${encodeURIComponent(article.title)}`,
      ],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      articleSection: article.category,
      author: {
        '@type': 'Person',
        name: article.author?.name || 'Prolific News Desk',
      },
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'Prolific News Network',
        alternateName: 'PNN',
        url: 'https://prolific.news',
        logo: {
          '@type': 'ImageObject',
          url: 'https://prolific.news/images/prolific-logo-full.svg',
          width: 340,
          height: 76,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://prolific.news',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: article.category,
          item: `https://prolific.news/category/${article.category.toLowerCase()}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: `https://prolific.news/article/${article.slug}`,
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Body (8 cols) */}
        <article
          className="lg:col-span-8 space-y-6"
          data-article-body="true"
          data-article-category={article.category}
        >
          {/* Breadcrumb & Category */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Link href="/" className="hover:text-[#CC0000]">Home</Link>
            <span>/</span>
            <Link href={`/category/${article.category.toLowerCase()}`} className="hover:text-[#CC0000]">
              {article.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{article.tags[0] || 'Verified Dispatch'}</span>
          </div>

          {/* Headline */}
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#111827] leading-[1.08] tracking-tight uppercase">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-gray-700 font-serif leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author Byline */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-xs font-black uppercase text-[#002B49]">{article.author.name}</div>
                <div className="text-[11px] text-gray-500">
                  {article.author.role} • {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <span className="text-[11px] font-mono text-gray-500 uppercase">
              {Math.max(2, Math.ceil(plainTextBody.split(' ').length / 200))} min read
            </span>
          </div>

          {/* Interactive Audio Dispatch & Omni-Channel Share Bar */}
          <ArticleEngagementBar
            slug={article.slug}
            title={article.title}
            subtitle={article.subtitle}
            category={article.category}
            plainTextContent={plainTextBody}
          />

          {/* Key Developments Box */}
          {article.keyDevelopments.length > 0 && (
            <div className="bg-[#F8F9FA] border-l-4 border-[#CC0000] p-4 rounded-r">
              <h2 className="font-headline font-black text-xs uppercase tracking-wider text-[#002B49] mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CC0000]"></span>
                Key Developments
              </h2>
              <ul className="space-y-2 text-sm text-gray-800">
                {article.keyDevelopments.map((dev, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#CC0000] font-bold select-none">•</span>
                    <span>{dev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lead Video / Media Container */}
          {article.leadMedia?.type === 'VIDEO' ? (
            <div className="aspect-video w-full rounded overflow-hidden bg-black shadow-md relative">
              <LiveStreamPlayer
                streamUrl={article.leadMedia?.url || DEFAULT_PUBLIC_DOMAIN_VIDEO_URL}
                autoPlay={false}
                showChyron={false}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="w-full rounded overflow-hidden bg-gray-100 shadow-md">
              <img
                src={article.leadMedia?.thumbnailUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80'}
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
              {article.leadMedia?.caption && (
                <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 italic">
                  {article.leadMedia.caption}
                </div>
              )}
            </div>
          )}

          {/* Article Text Content */}
          <div
            className="font-serif text-gray-800 text-lg leading-relaxed space-y-5 pt-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Official Social Handles Callout */}
          <div className="bg-[#001A2C] text-white rounded-lg p-5 border-l-4 border-[#FFCC00] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-headline font-bold uppercase tracking-widest text-[#FFCC00] mb-1">
                Prolific News Network Real-Time Wire
              </div>
              <p className="text-sm font-semibold">
                Follow official <span className="text-[#FFCC00]">@prolificnews</span> channels for instant breaking dispatches.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://x.com/prolificnews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded border border-white/15 transition"
              >
                X @prolificnews
              </a>
              <a
                href="https://t.me/prolificnews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0088cc] hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded transition"
              >
                Telegram Wire
              </a>
              <a
                href="/feed.xml"
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded transition"
              >
                RSS 2.0
              </a>
            </div>
          </div>

          {/* Reader Comments Section */}
          <section className="border-t-2 border-gray-200 pt-8 mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-black text-xl uppercase tracking-wider text-[#002B49] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#CC0000]" />
                Conversations
              </h3>
              <span className="text-xs text-gray-500 font-semibold">Moderated Discussion</span>
            </div>

            <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded space-y-3">
              <textarea
                placeholder="What are your thoughts on this development? Be respectful and follow Prolific News community guidelines..."
                className="w-full text-sm p-3 border border-gray-300 rounded focus:outline-none focus:border-[#002B49] resize-none h-24"
              />
              <div className="flex justify-end">
                <button className="bg-[#002B49] hover:bg-[#003B66] text-white font-headline font-bold text-xs uppercase px-5 py-2 rounded tracking-wider transition">
                  Post Comment
                </button>
              </div>
            </div>
          </section>
        </article>

        {/* Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Live Broadcast Card */}
          <div className="bg-[#001A2C] text-white p-5 rounded border border-[#003B66] space-y-3">
            <div className="flex items-center gap-2 text-[#CC0000] font-headline font-black text-xs uppercase tracking-wider">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Prolific Live On-Air</span>
            </div>
            <h4 className="font-headline font-bold text-base uppercase leading-snug">
              Live Analysis: Continuous Rolling Coverage & Breaking Reports
            </h4>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#B30000] text-white font-headline font-bold text-xs uppercase px-4 py-2 rounded tracking-wider transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Broadcast Now</span>
            </Link>
          </div>

          {/* Related Dispatches in Category */}
          {relatedStories.length > 0 && (
            <div className="bg-white border border-gray-200 rounded p-5 space-y-4 shadow-sm">
              <h4 className="font-headline font-black text-sm uppercase tracking-wider text-[#002B49] border-b border-gray-200 pb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#CC0000]" />
                More in {article.category}
              </h4>
              <div className="divide-y divide-gray-100">
                {relatedStories.slice(0, 4).map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/article/${rel.slug}`}
                    className="block py-3 first:pt-0 last:pb-0 group"
                  >
                    <span className="text-[10px] font-bold uppercase text-[#CC0000]">
                      {rel.category}
                    </span>
                    <h5 className="font-headline font-bold text-sm text-gray-900 group-hover:text-[#CC0000] leading-snug transition mt-0.5">
                      {rel.title}
                    </h5>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Executive Sponsorship Placement */}
          <div className="bg-gradient-to-br from-[#002B49] to-[#001220] text-white rounded p-5 border border-[#003B66] space-y-2.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#FFCC00] font-bold">
              <span>PNN Commercial Partner</span>
              <Globe className="w-3.5 h-3.5" />
            </div>
            <h5 className="font-headline font-bold text-base uppercase leading-tight">
              Reach Global Decision-Makers Across 6 Continents
            </h5>
            <p className="text-xs text-gray-300 leading-relaxed">
              Sponsor daily executive briefings, live stream chyrons, and regional Africa, Asia & Markets desks on Prolific News Network.
            </p>
            <Link
              href="/advertise"
              className="inline-block bg-[#FFCC00] hover:bg-amber-400 text-[#002B49] font-headline font-black text-xs uppercase tracking-wider px-4 py-2 rounded transition mt-1"
            >
              Explore Media Kit →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
