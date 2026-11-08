'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, Trash2, ExternalLink, RefreshCw, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  categoryId: string;
  isLeadHero: boolean;
  isBreaking: boolean;
  status: string;
  readTimeMinutes: number;
  publishedAt: string;
  leadMediaUrl?: string;
  author: {
    name: string;
    role: string;
  };
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article from Neon DB?')) return;
    try {
      const res = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Article removed from database.');
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-wider text-[#002B49]">
            Published Articles Catalog
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage live stories, lead hero features, and editorial content deployed to Prolific News Network.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/wire"
            className="bg-[#002B49] hover:bg-[#001F35] text-white font-headline font-bold text-xs uppercase px-4 py-2 rounded tracking-wider transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" />
            <span>Ingest More Stories</span>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <RefreshCw className="w-8 h-8 text-[#002B49] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading articles from Neon DB...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No published articles in Neon DB yet.</p>
          <Link href="/wire" className="mt-3 inline-block text-xs font-bold text-[#CC0000] underline">
            Go to Wire Ingestion to publish your first story →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002B49] text-white uppercase font-headline font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Article Headline</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-center gap-2">
                        {art.isLeadHero && (
                          <span className="bg-[#CC0000] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                            Hero
                          </span>
                        )}
                        <span className="font-headline font-bold text-gray-900 line-clamp-1">
                          {art.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold uppercase text-[10px] text-gray-500">
                      {art.categoryId.replace('cat-', '')}
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {art.author.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {art.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px]">
                      {new Date(art.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://prolific.news/article/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-500 hover:text-[#002B49] rounded transition"
                          title="View on Live Site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                          title="Delete from Neon DB"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
