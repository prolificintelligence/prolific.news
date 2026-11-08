import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Share2, Bookmark, MessageSquare, ThumbsUp, Radio, Play } from 'lucide-react';
import { LiveStreamPlayer } from '../../../components/LiveStreamPlayer';
import { getArticleBySlug } from '../../../lib/news-service';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

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
  const imageUrl = article.leadMedia?.url || article.leadMedia?.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

  return {
    title: `${cleanTitle} | Prolific News Network`,
    description: cleanDesc,
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
      ],
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author?.name || 'Prolific Newsroom'],
    },
    twitter: {
      card: 'summary_large_image',
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Body (8 cols) */}
        <article className="lg:col-span-8 space-y-6">
          {/* Breadcrumb & Category */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Link href="/" className="hover:text-[#CC0000]">Home</Link>
            <span>/</span>
            <Link href={`/category/${article.category.toLowerCase()}`} className="hover:text-[#CC0000]">
              {article.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{article.tags[0] || 'Top Story'}</span>
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

          {/* Author Byline & Social Share Bar */}
          <div className="flex items-center justify-between border-y border-gray-200 py-3">
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

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-[#002B49] hover:bg-gray-100 rounded transition" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-[#002B49] hover:bg-gray-100 rounded transition" title="Bookmark">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

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
                streamUrl={article.leadMedia?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
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

          {/* Reader Comments Section */}
          <section className="border-t-2 border-gray-200 pt-8 mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-black text-xl uppercase tracking-wider text-[#002B49] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#CC0000]" />
                Conversations
              </h3>
              <span className="text-xs text-gray-500 font-semibold">Moderated Discussion</span>
            </div>

            {/* Comment Form */}
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
        <aside className="lg:col-span-4 space-y-8">
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
        </aside>
      </div>
    </div>
  );
}
