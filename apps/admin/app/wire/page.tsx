'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  CheckCircle2,
  Newspaper,
  Radio,
  Clock,
  Send,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WireItem {
  id: string;
  source: string;
  title: string;
  link: string;
  summary: string;
  category: string;
  mediaUrl: string;
  pubDate: string;
}

export default function WireIngestPage() {
  const router = useRouter();
  const [items, setItems] = useState<WireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const fetchWireItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wire');
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching wire:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWireItems();
  }, []);

  const handleRefreshFeeds = async () => {
    setRefreshing(true);
    setActionStatus('Harvesting live feeds across all 18 endpoints...');
    try {
      const res = await fetch('/api/wire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus(`Refreshed! ${data.message}`);
        await fetchWireItems();
      } else {
        setActionStatus('Refresh completed.');
      }
    } catch {
      setActionStatus('Network error during refresh.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleRefreshTier = async (tier: 1 | 2 | 3) => {
    setRefreshing(true);
    const tierName = tier === 1 ? 'Tier 1 (Breaking/Markets)' : tier === 2 ? 'Tier 2 (Global/Core)' : 'Tier 3 (In-Depth/Tech)';
    setActionStatus(`Harvesting ${tierName}...`);
    try {
      const res = await fetch('/api/wire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-tier', tier }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus(`Updated ${tierName}: ${data.message}`);
        await fetchWireItems();
      }
    } catch {
      setActionStatus('Network error syncing tier.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleRunArchival = async () => {
    setRefreshing(true);
    setActionStatus('Executing automated content archival lifecycle...');
    try {
      const res = await fetch('/api/wire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive-lifecycle' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus(data.message);
        await fetchWireItems();
      }
    } catch {
      setActionStatus('Archival error.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handlePromote = async (item: WireItem, isLeadHero: boolean) => {
    setActionStatus(`Promoting "${item.title.slice(0, 40)}..." as ${isLeadHero ? 'Lead Hero' : 'Article'}...`);
    try {
      const res = await fetch('/api/wire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promote',
          wireItem: item,
          isLeadHero,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus(isLeadHero ? 'Published as Super Lead Hero Story with live stream!' : 'Published as Article in Neon DB!');
      } else {
        setActionStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setActionStatus(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleSendToCopilot = (item: WireItem) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('copilot_raw_wire', `${item.title}\n\n${item.summary}\n\nSource: ${item.source}`);
      router.push('/');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category.toUpperCase() === selectedCategory;
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-wider text-[#002B49]">
              Wire Service Ingestion & Editorial Staging
            </h1>
            <span className="text-xs bg-[#CC0000] text-white font-bold px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Real-time automated wire dispatches harvested from global sources. Review, promote to lead stories, or refine with AI Copilot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleRefreshTier(1)}
            disabled={refreshing}
            className="bg-[#CC0000] hover:bg-[#AA0000] text-white font-headline font-bold text-[11px] uppercase px-3 py-2 rounded tracking-wider transition flex items-center gap-1.5 shadow"
            title="Every 1m: Politics, Markets, Breaking Desk"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Tier 1 (1m)</span>
          </button>

          <button
            onClick={() => handleRefreshTier(2)}
            disabled={refreshing}
            className="bg-[#002B49] hover:bg-[#001F35] text-white font-headline font-bold text-[11px] uppercase px-3 py-2 rounded tracking-wider transition flex items-center gap-1.5 shadow"
            title="Every 5m: US, World, Sports, Ent"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Tier 2 (5m)</span>
          </button>

          <button
            onClick={() => handleRefreshTier(3)}
            disabled={refreshing}
            className="bg-[#002B49] hover:bg-[#001F35] text-white font-headline font-bold text-[11px] uppercase px-3 py-2 rounded tracking-wider transition flex items-center gap-1.5 shadow"
            title="Every 15m: Tech, Science, Opinion, Lifestyle"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Tier 3 (15m)</span>
          </button>

          <button
            onClick={handleRunArchival}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-800 text-white font-headline font-bold text-[11px] uppercase px-3 py-2 rounded tracking-wider transition flex items-center gap-1.5 shadow"
            title="Archive wire items >14d and articles >30d"
          >
            <span>Run Archival</span>
          </button>

          <button
            onClick={handleRefreshFeeds}
            disabled={refreshing}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-headline font-bold text-[11px] uppercase px-3 py-2 rounded tracking-wider transition flex items-center gap-1.5 shadow"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>All Feeds</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Controls: Search & Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wire dispatches by headline, source..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#002B49]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'POLITICS', 'US', 'OPINION', 'ENTERTAINMENT', 'SPORTS', 'LIFESTYLE', 'BUSINESS', 'WORLD', 'TECH', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-headline font-bold uppercase px-2.5 py-1.5 rounded transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#002B49] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wire Items Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <RefreshCw className="w-8 h-8 text-[#002B49] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading wire dispatches from Neon DB...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No wire stories found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-gray-400 transition"
            >
              <div>
                {/* Media Thumbnail */}
                <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                  <img
                    src={item.mediaUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="bg-[#002B49] text-white text-[10px] font-headline font-bold uppercase px-2 py-0.5 rounded shadow">
                      {item.category}
                    </span>
                    <span className="bg-black/60 backdrop-blur-sm text-gray-200 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {item.source}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <h3 className="font-headline font-bold text-sm text-gray-900 leading-snug line-clamp-3">
                    {item.title}
                  </h3>

                  {item.summary && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handlePromote(item, true)}
                  className="bg-[#CC0000] hover:bg-[#B30000] text-white text-[10px] font-headline font-bold uppercase px-2.5 py-1.5 rounded transition flex items-center gap-1 shadow-sm"
                  title="Make this the top Lead Hero story with live video stream"
                >
                  <Flame className="w-3 h-3 fill-white" />
                  <span>Lead Hero</span>
                </button>

                <button
                  onClick={() => handlePromote(item, false)}
                  className="bg-[#002B49] hover:bg-[#001F35] text-white text-[10px] font-headline font-bold uppercase px-2.5 py-1.5 rounded transition flex items-center gap-1 shadow-sm"
                  title="Publish as standard article"
                >
                  <Send className="w-3 h-3" />
                  <span>Publish</span>
                </button>

                <button
                  onClick={() => handleSendToCopilot(item)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-headline font-bold uppercase px-2.5 py-1.5 rounded transition flex items-center gap-1"
                  title="Rewrite with AI Copilot"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Copilot</span>
                </button>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-gray-400 hover:text-gray-700 transition"
                  title="Open source dispatch"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
