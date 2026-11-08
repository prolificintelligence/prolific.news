'use client';

import React, { useEffect, useState } from 'react';
import {
  Share2,
  Send,
  CheckCircle2,
  Clock,
  Copy,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Globe,
  TrendingUp,
} from 'lucide-react';

interface SocialPostItem {
  id: string;
  articleId: string | null;
  articleSlug: string;
  platform: string;
  handle: string;
  postCopy: string;
  hashtags: string[];
  targetUrl: string;
  mediaUrl: string | null;
  status: string;
  externalPostId: string | null;
  impressions: number;
  postedAt: string | null;
  createdAt: string;
}

interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  isBreaking: boolean;
  publishedAt: string;
}

const PLATFORM_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  X: { bg: 'bg-black', text: 'text-white', label: 'X (@prolificnews)' },
  TELEGRAM: { bg: 'bg-[#0088cc]', text: 'text-white', label: 'Telegram (t.me/prolificnews)' },
  LINKEDIN: { bg: 'bg-[#0A66C2]', text: 'text-white', label: 'LinkedIn' },
  FACEBOOK: { bg: 'bg-[#1877F2]', text: 'text-white', label: 'Facebook' },
  BLUESKY: { bg: 'bg-[#0285FF]', text: 'text-white', label: 'Bluesky (prolific.news)' },
  THREADS: { bg: 'bg-neutral-800', text: 'text-white', label: 'Threads (@prolificnews)' },
};

export default function AdminSocialCommandCenter() {
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [syndicating, setSyndicating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social?limit=60');
      const data = await res.json();
      if (data.ok) {
        setPosts(data.posts || []);
        setArticles(data.recentArticles || []);
      }
    } catch (err) {
      console.error('Failed to load social dispatches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerAutoSyndicate = async () => {
    setSyndicating(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto', maxArticles: 6 }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage(
          `Syndicated ${data.articlesSyndicated || 0} high-value stories across all 6 official @prolificnews handles.`
        );
        await loadData();
      }
    } catch (e) {
      setStatusMessage('Error running automated syndication.');
    } finally {
      setSyndicating(false);
    }
  };

  const syndicateSingleArticle = async (articleId: string) => {
    setSyndicating(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage(`Dispatched story to ${data.created || 6} social channels!`);
        await loadData();
      }
    } catch (e) {
      setStatusMessage('Failed to syndicate article.');
    } finally {
      setSyndicating(false);
    }
  };

  const copyPostCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPosts =
    selectedPlatform === 'ALL'
      ? posts
      : posts.filter((p) => p.platform === selectedPlatform);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#002B49] text-white rounded-xl p-6 shadow-lg border border-[#003B64] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#CC0000] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded mb-2">
            <Share2 className="w-3 h-3" /> Automated Omni-Channel Syndication
          </div>
          <h1 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tight">
            PNN Social Distribution Command Center
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-2xl">
            Automatically crafts platform-native dispatches, hashtags, and UTM tracking links for official{' '}
            <span className="text-[#FFCC00] font-semibold">@prolificnews</span> handles across X, Telegram, LinkedIn, Facebook, Bluesky, and Threads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerAutoSyndicate}
            disabled={syndicating}
            className="bg-[#CC0000] hover:bg-red-700 disabled:opacity-50 text-white font-headline font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-lg shadow flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-[#FFCC00]" />
            {syndicating ? 'Syndicating...' : 'Auto-Syndicate Top Stories'}
          </button>
          <button
            onClick={loadData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-3 rounded-lg flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Official Handles Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(PLATFORM_BADGES).map(([key, info]) => {
          const count = posts.filter((p) => p.platform === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedPlatform(selectedPlatform === key ? 'ALL' : key)}
              className={`p-3.5 rounded-lg border text-left transition ${
                selectedPlatform === key
                  ? 'border-[#CC0000] ring-2 ring-[#CC0000]/20 bg-white'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`${info.bg} ${info.text} text-[10px] font-bold uppercase px-2 py-0.5 rounded`}>
                  {key}
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">{count} posts</span>
              </div>
              <p className="text-xs font-semibold text-gray-800 truncate">{info.label}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Auto-Sync Active
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Syndicated Social Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#CC0000]" />
              Dispatched Social Stream ({filteredPosts.length})
            </h2>
            {selectedPlatform !== 'ALL' && (
              <button
                onClick={() => setSelectedPlatform('ALL')}
                className="text-xs font-bold uppercase text-[#CC0000] hover:underline"
              >
                Show All Platforms
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 text-sm">
              Loading syndicated social stream...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
              <p className="text-gray-600 text-sm">No social dispatches recorded yet for this filter.</p>
              <button
                onClick={triggerAutoSyndicate}
                className="bg-[#002B49] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded"
              >
                Generate Initial Social Dispatches
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const badge = PLATFORM_BADGES[post.platform] || {
                  bg: 'bg-gray-800',
                  text: 'text-white',
                  label: post.platform,
                };
                return (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs font-mono text-gray-500">{post.handle}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                            post.status === 'posted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {post.status === 'posted' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {post.status}
                        </span>
                        <button
                          onClick={() => copyPostCopy(post.id, post.postCopy)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded flex items-center gap-1 font-medium transition"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedId === post.id ? 'Copied!' : 'Copy'}
                        </button>
                        <a
                          href={post.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs bg-[#002B49]/10 hover:bg-[#002B49]/20 text-[#002B49] px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition"
                        >
                          <ExternalLink className="w-3 h-3" /> Article
                        </a>
                      </div>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">
                      {post.postCopy}
                    </pre>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(post.hashtags || []).map((tag) => (
                          <span key={tag} className="text-[#002B49] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span>
                        {new Date(post.postedAt || post.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 cols: Manual Blast from Recent Articles */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-[#002B49] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#CC0000]" />
            1-Click Article Blast
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-sm">
            {articles.map((art) => (
              <div key={art.id} className="p-3.5 hover:bg-gray-50 transition space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#002B49]/10 text-[#002B49]">
                    {art.category}
                  </span>
                  {art.isBreaking && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#CC0000] text-white">
                      Breaking
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-900 line-clamp-2">{art.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400">
                    {new Date(art.publishedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => syndicateSingleArticle(art.id)}
                    disabled={syndicating}
                    className="bg-[#002B49] hover:bg-[#003B64] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1 transition"
                  >
                    <Send className="w-2.5 h-2.5 text-[#FFCC00]" /> Blast to 6 Handles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
