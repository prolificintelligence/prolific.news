'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  Globe,
  Share2,
  Volume2,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet,
  ExternalLink,
  Compass,
  ArrowUpRight,
} from 'lucide-react';

interface OverviewMetrics {
  totalViews: number;
  uniqueVisitors: number;
  avgDwellSeconds: number;
  avgScrollPercent: number;
  activeReaders: number;
}

interface ChannelItem {
  channel_group: string;
  views: number;
  unique_visitors: number;
  avg_dwell: number;
}

interface UtmItem {
  source: string;
  medium: string;
  campaign: string;
  views: number;
  unique_visitors: number;
}

interface ArticlePerformanceItem {
  article_slug: string;
  title: string | null;
  category: string;
  views: number;
  unique_readers: number;
  avg_dwell: number;
  avg_scroll: number;
}

interface GeoItem {
  country: string;
  views: number;
  unique_visitors?: number;
}

interface CityItem {
  city: string;
  country: string;
  views: number;
}

interface EventItem {
  event_name: string;
  count: number;
  unique_users: number;
}

interface DeviceItem {
  device_type: string;
  views: number;
}

const CHANNEL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  TELEGRAM: { bg: 'bg-[#0088cc]/10', text: 'text-[#0088cc]', bar: 'bg-[#0088cc]' },
  BLUESKY: { bg: 'bg-[#0285FF]/10', text: 'text-[#0285FF]', bar: 'bg-[#0285FF]' },
  MASTODON: { bg: 'bg-[#6364FF]/10', text: 'text-[#6364FF]', bar: 'bg-[#6364FF]' },
  X: { bg: 'bg-black/10', text: 'text-neutral-900', bar: 'bg-neutral-900' },
  GOOGLE_SEARCH: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', bar: 'bg-emerald-600' },
  SEARCH: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', bar: 'bg-emerald-600' },
  DIRECT: { bg: 'bg-[#002B49]/10', text: 'text-[#002B49]', bar: 'bg-[#002B49]' },
  INTERNAL: { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-400' },
  REFERRAL: { bg: 'bg-amber-500/10', text: 'text-amber-700', bar: 'bg-amber-600' },
};

export default function AdminAnalyticsDashboard() {
  const [range, setRange] = useState<string>('24h');
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<OverviewMetrics>({
    totalViews: 0,
    uniqueVisitors: 0,
    avgDwellSeconds: 0,
    avgScrollPercent: 0,
    activeReaders: 0,
  });
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [utmSources, setUtmSources] = useState<UtmItem[]>([]);
  const [topArticles, setTopArticles] = useState<ArticlePerformanceItem[]>([]);
  const [countries, setCountries] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      const data = await res.json();
      if (data.ok) {
        setOverview(data.overview);
        setChannels(data.channels || []);
        setUtmSources(data.utmSources || []);
        setTopArticles(data.topArticles || []);
        setCountries(data.countries || []);
        setCities(data.cities || []);
        setEvents(data.events || []);
        setDevices(data.devices || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [range]);

  const formatDwell = (secs: number) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const totalChannelViews = channels.reduce((sum, c) => sum + Number(c.views), 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div>
          <h1 className="font-headline font-black text-2xl uppercase tracking-wider text-[#002B49] flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#002B49]" />
            Audience Intelligence & Telemetry
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time edge telemetry, social platform attribution, dwell time, and regional demographics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="inline-flex rounded-md shadow-sm border border-gray-300 bg-gray-50 p-0.5 text-xs font-bold">
            {(['24h', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded transition ${
                  range === r
                    ? 'bg-[#002B49] text-white shadow'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-600 transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#002B49]' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Live Readers */}
        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-emerald-700">
              Active Readers
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-emerald-700">
            {overview.activeReaders}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Engaged within past 5 mins</p>
        </div>

        {/* Total Page Views */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#002B49]">
              Total Page Views
            </span>
            <Eye className="w-4 h-4 text-[#002B49]" />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-[#002B49]">
            {overview.totalViews.toLocaleString()}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Edge verified views</p>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-800">
              Unique Visitors
            </span>
            <Users className="w-4 h-4 text-neutral-800" />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-neutral-800">
            {overview.uniqueVisitors.toLocaleString()}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Pseudonymized daily hashes</p>
        </div>

        {/* Average Dwell Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-amber-700">
              Avg Active Dwell
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-amber-700">
            {formatDwell(overview.avgDwellSeconds)}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Active tab read time only</p>
        </div>

        {/* Avg Scroll Depth */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-purple-700">
              Avg Scroll Depth
            </span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-purple-700">
            {overview.avgScrollPercent}%
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Article body completion</p>
        </div>
      </div>

      {/* Main Grid: Channels & Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acquisition & Social Attribution (1 Col) */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#002B49]" />
              Acquisition Channels
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">By Inbound Share</span>
          </div>

          {channels.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No channel telemetry recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((c) => {
                const pct = Math.round((Number(c.views) / totalChannelViews) * 100);
                const styling = CHANNEL_COLORS[c.channel_group] || CHANNEL_COLORS.DIRECT;
                return (
                  <div key={c.channel_group} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${styling.bg} ${styling.text}`}>
                        {c.channel_group}
                      </span>
                      <div className="flex items-center gap-3 text-gray-600 font-mono text-[11px]">
                        <span>{Number(c.views).toLocaleString()} views</span>
                        <span className="text-gray-400">({pct}%)</span>
                        <span className="text-gray-500">{formatDwell(c.avg_dwell)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${styling.bar}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Device Breakdown Pill */}
          <div className="pt-3 border-t">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-gray-500 mb-2 block">
              Audience Devices
            </span>
            <div className="flex items-center gap-2">
              {devices.map((d) => (
                <div
                  key={d.device_type}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded p-2 text-center"
                >
                  <div className="flex items-center justify-center text-gray-600 mb-1">
                    {d.device_type === 'mobile' ? (
                      <Smartphone className="w-3.5 h-3.5" />
                    ) : d.device_type === 'tablet' ? (
                      <Tablet className="w-3.5 h-3.5" />
                    ) : (
                      <Laptop className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-xs font-bold capitalize text-[#002B49]">{d.device_type}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{d.views} views</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Read Articles (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#002B49]" />
              Top Read Articles & Editorial Engagement
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">Ranked by Views & Dwell</span>
          </div>

          {topArticles.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No article reads recorded in this time range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase font-headline text-[10px] tracking-wider">
                    <th className="pb-2">Headline / Article</th>
                    <th className="pb-2 text-right">Views</th>
                    <th className="pb-2 text-right">Unique</th>
                    <th className="pb-2 text-right">Avg Dwell</th>
                    <th className="pb-2 text-right">Scroll %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {topArticles.map((art) => (
                    <tr key={art.article_slug} className="hover:bg-gray-50 transition">
                      <td className="py-2.5 pr-3 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            {art.category.replace('cat-', '')}
                          </span>
                          <a
                            href={`https://prolific.news/article/${art.article_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-gray-900 hover:text-[#002B49] truncate inline-flex items-center gap-1"
                            title={art.title || art.article_slug}
                          >
                            <span className="truncate">{art.title || art.article_slug}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                          </a>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-[#002B49]">
                        {Number(art.views).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-gray-600">
                        {Number(art.unique_readers).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-amber-700 font-semibold">
                        {formatDwell(art.avg_dwell)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-purple-700">
                        {art.avg_scroll}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Grid: Geographics & Interactive Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Geographics: Top Countries & Cities */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#002B49]" />
              Global Readership (Edge Geo)
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">Cloudflare/Vercel</span>
          </div>

          {countries.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No geographical data captured yet.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                {countries.slice(0, 7).map((c) => (
                  <div key={c.country} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-6 text-center font-mono bg-gray-100 text-gray-700 text-[10px] rounded px-1 py-0.5">
                        {c.country}
                      </span>
                      <span>{c.country}</span>
                    </span>
                    <span className="font-mono text-gray-600">{Number(c.views).toLocaleString()} views</span>
                  </div>
                ))}
              </div>

              {cities.length > 0 && (
                <div className="pt-3 border-t">
                  <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                    Top Cities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cities.slice(0, 6).map((ct) => (
                      <span
                        key={`${ct.city}-${ct.country}`}
                        className="bg-gray-100 border border-gray-200 text-gray-700 text-[11px] px-2 py-0.5 rounded font-mono"
                      >
                        {ct.city}, {ct.country} ({ct.views})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Engagement Events */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#002B49]" />
              Reader Actions & Conversions
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">Custom Telemetry</span>
          </div>

          {events.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No interactive reader events recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.event_name}
                  className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded text-xs"
                >
                  <span className="font-bold text-[#002B49] capitalize">
                    {ev.event_name.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-[#002B49]">{ev.count} times</span>
                    <span className="text-gray-500 text-[11px]">({ev.unique_users} users)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed UTM Campaigns */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#002B49]" />
              Fine-Grained Campaigns (UTMs)
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">Campaign Attribution</span>
          </div>

          {utmSources.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No campaign-tagged visits in this period.
            </div>
          ) : (
            <div className="space-y-2">
              {utmSources.slice(0, 6).map((utm, idx) => (
                <div
                  key={`${utm.source}-${utm.medium}-${idx}`}
                  className="p-2 border border-gray-200 rounded text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#002B49]">{utm.source}</span>
                    <span className="font-mono text-[#002B49]">{utm.views} views</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                    <span>medium: {utm.medium}</span>
                    <span>{utm.unique_visitors} unique</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
