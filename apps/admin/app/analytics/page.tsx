'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  ShieldCheck,
  AlertTriangle,
  Download,
  TrendingUp,
  Layers,
  Mail,
} from 'lucide-react';

type RangeKey = 'today' | '24h' | '7d' | '30d' | 'all';

interface OverviewMetrics {
  totalViews: number;
  humanViews: number;
  botViews: number;
  totalSessions: number;
  pagesPerSession: number;
  uniqueVisitors: number;
  engagedViews: number;
  bounceRatePercent: number;
  avgDwellSeconds: number;
  avgScrollPercent: number;
  activeReaders: number;
  internalViews: number;
  activeSubscribers: number;
  newSubscribers: number;
  dispatchedSocialPosts: number;
  deltas: {
    viewsPct: number | null;
    uniquesPct: number | null;
    sessionsPct: number | null;
    dwellPct: number | null;
  } | null;
}

interface TimeBucket {
  bucket: string;
  views: number;
  uniques: number;
  engaged: number;
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

interface PageItem {
  pathname: string;
  views: number;
  unique_visitors: number;
  avg_dwell: number;
}

interface CategoryItem {
  category: string;
  views: number;
  unique_readers: number;
  avg_dwell: number;
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

interface EventDetailItem {
  detail: string;
  event_name: string;
  count: number;
}

interface DeviceItem {
  device_type: string;
  views: number;
}

interface TechItem {
  browser?: string;
  os?: string;
  views: number;
}

const CHANNEL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  TELEGRAM: { bg: 'bg-[#0088cc]/10', text: 'text-[#0088cc]', bar: 'bg-[#0088cc]' },
  BLUESKY: { bg: 'bg-[#0285FF]/10', text: 'text-[#0285FF]', bar: 'bg-[#0285FF]' },
  MASTODON: { bg: 'bg-[#6364FF]/10', text: 'text-[#6364FF]', bar: 'bg-[#6364FF]' },
  X: { bg: 'bg-black/10', text: 'text-neutral-900', bar: 'bg-neutral-900' },
  READER_SHARE: { bg: 'bg-indigo-500/10', text: 'text-indigo-700', bar: 'bg-indigo-600' },
  GOOGLE_SEARCH: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', bar: 'bg-emerald-600' },
  GOOGLE_NEWS: { bg: 'bg-emerald-600/10', text: 'text-emerald-800', bar: 'bg-emerald-700' },
  BING_SEARCH: { bg: 'bg-teal-500/10', text: 'text-teal-700', bar: 'bg-teal-600' },
  DUCKDUCKGO: { bg: 'bg-orange-500/10', text: 'text-orange-700', bar: 'bg-orange-600' },
  AI_SEARCH: { bg: 'bg-violet-500/10', text: 'text-violet-700', bar: 'bg-violet-600' },
  HACKERNEWS: { bg: 'bg-orange-600/10', text: 'text-orange-800', bar: 'bg-orange-600' },
  LINKEDIN: { bg: 'bg-sky-600/10', text: 'text-sky-700', bar: 'bg-sky-600' },
  FACEBOOK: { bg: 'bg-blue-600/10', text: 'text-blue-700', bar: 'bg-blue-600' },
  INSTAGRAM: { bg: 'bg-pink-500/10', text: 'text-pink-700', bar: 'bg-pink-600' },
  THREADS: { bg: 'bg-neutral-500/10', text: 'text-neutral-800', bar: 'bg-neutral-700' },
  REDDIT: { bg: 'bg-red-500/10', text: 'text-red-700', bar: 'bg-red-600' },
  WHATSAPP: { bg: 'bg-green-500/10', text: 'text-green-700', bar: 'bg-green-600' },
  YOUTUBE: { bg: 'bg-rose-600/10', text: 'text-rose-700', bar: 'bg-rose-600' },
  TIKTOK: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-700', bar: 'bg-fuchsia-600' },
  SUBSTACK: { bg: 'bg-amber-600/10', text: 'text-amber-800', bar: 'bg-amber-600' },
  NEWSLETTER: { bg: 'bg-cyan-500/10', text: 'text-cyan-700', bar: 'bg-cyan-600' },
  DIRECT: { bg: 'bg-[#002B49]/10', text: 'text-[#002B49]', bar: 'bg-[#002B49]' },
  INTERNAL: { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-400' },
  REFERRAL: { bg: 'bg-amber-500/10', text: 'text-amber-700', bar: 'bg-amber-600' },
};

function DeltaBadge({ pct }: { pct: number | null | undefined }) {
  if (pct === null || pct === undefined) return null;
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {positive ? '+' : ''}
      {pct}%
    </span>
  );
}

export default function AdminAnalyticsDashboard() {
  const [range, setRange] = useState<RangeKey>('24h');
  const [includeBots, setIncludeBots] = useState<boolean>(false);
  const [contentTab, setContentTab] = useState<'articles' | 'pages' | 'categories'>('articles');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [windowInfo, setWindowInfo] = useState<{ start: string; end: string; granularity: string } | null>(null);

  const [overview, setOverview] = useState<OverviewMetrics>({
    totalViews: 0,
    humanViews: 0,
    botViews: 0,
    totalSessions: 0,
    pagesPerSession: 0,
    uniqueVisitors: 0,
    engagedViews: 0,
    bounceRatePercent: 0,
    avgDwellSeconds: 0,
    avgScrollPercent: 0,
    activeReaders: 0,
    internalViews: 0,
    activeSubscribers: 0,
    newSubscribers: 0,
    dispatchedSocialPosts: 0,
    deltas: null,
  });
  const [timeSeries, setTimeSeries] = useState<TimeBucket[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [utmSources, setUtmSources] = useState<UtmItem[]>([]);
  const [topArticles, setTopArticles] = useState<ArticlePerformanceItem[]>([]);
  const [topPages, setTopPages] = useState<PageItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [countries, setCountries] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetailItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [browsers, setBrowsers] = useState<TechItem[]>([]);
  const [oses, setOses] = useState<TechItem[]>([]);

  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      return null;
    }
  }, []);

  const formatCountryName = (code: string) => {
    if (!code || code === 'Unknown' || code.length !== 2) return code || 'Unknown';
    try {
      return regionNames?.of(code.toUpperCase()) || code;
    } catch {
      return code;
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/analytics?range=${range}&includeBots=${includeBots ? '1' : '0'}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || `Analytics request failed (${res.status})`);
        return;
      }
      setWindowInfo(data.window || null);
      setOverview(data.overview);
      setTimeSeries(data.timeSeries || []);
      setChannels(data.channels || []);
      setUtmSources(data.utmSources || []);
      setTopArticles(data.topArticles || []);
      setTopPages(data.topPages || []);
      setCategories(data.categories || []);
      setCountries(data.countries || []);
      setCities(data.cities || []);
      setEvents(data.events || []);
      setEventDetails(data.eventDetails || []);
      setDevices(data.devices || []);
      setBrowsers(data.browsers || []);
      setOses(data.oses || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setErrorMsg((err as Error).message || 'Network error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchAnalytics();
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [range, includeBots]);

  const formatDwell = (secs: number) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatBucketLabel = (iso: string) => {
    const d = new Date(iso);
    if (windowInfo?.granularity === 'hour') {
      return d.toISOString().slice(11, 16) + 'Z';
    }
    return d.toISOString().slice(5, 10);
  };

  const exportCsv = () => {
    const lines = [
      ['Section', 'Name', 'Views', 'Unique', 'AvgDwellSec', 'ScrollPct'].join(','),
      ['Overview', `${range} (${includeBots ? 'with-bots' : 'human-only'})`, overview.totalViews, overview.uniqueVisitors, overview.avgDwellSeconds, overview.avgScrollPercent].join(','),
      ...channels.map((c) => ['Channel', JSON.stringify(c.channel_group), c.views, c.unique_visitors, c.avg_dwell, ''].join(',')),
      ...topArticles.map((a) => ['Article', JSON.stringify(a.title || a.article_slug), a.views, a.unique_readers, a.avg_dwell, a.avg_scroll].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prolific-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalChannelViews = channels.reduce((sum, c) => sum + Number(c.views), 0) || 1;
  const maxSeriesViews = Math.max(...timeSeries.map((b) => Number(b.views)), 1);

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div>
          <h1 className="font-headline font-black text-2xl uppercase tracking-wider text-[#002B49] flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#002B49]" />
            Audience Intelligence & Telemetry
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
            <span>First-party edge telemetry, inbound attribution, and reader engagement.</span>
            {windowInfo && (
              <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {range === 'all'
                  ? 'All recorded telemetry'
                  : `${new Date(windowInfo.start).toISOString().slice(5, 16).replace('T', ' ')}Z -> ${new Date(windowInfo.end).toISOString().slice(5, 16).replace('T', ' ')}Z`}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="inline-flex rounded-md shadow-sm border border-gray-300 bg-gray-50 p-0.5 text-xs font-bold">
            {(
              [
                ['today', 'Today UTC'],
                ['24h', '24 Hours'],
                ['7d', '7 Days'],
                ['30d', '30 Days'],
                ['all', 'All Time'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`px-2.5 py-1.5 rounded transition ${
                  range === key
                    ? 'bg-[#002B49] text-white shadow'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIncludeBots((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold transition ${
              includeBots
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
            title="Toggle between clean human traffic and raw traffic including bots/crawlers"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{includeBots ? 'Including Bots' : 'Human Only'}</span>
          </button>

          <button
            onClick={exportCsv}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-600 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

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

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3.5 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Failed to load analytics: {errorMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Active Live Readers */}
        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm">
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
          <p className="text-[10px] text-gray-500 mt-1">Open human tabs (5m)</p>
        </div>

        {/* Total Page Views */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#002B49]">
              Page Views
            </span>
            <DeltaBadge pct={overview.deltas?.viewsPct} />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-[#002B49]">
            {overview.totalViews.toLocaleString()}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {includeBots
              ? `${overview.humanViews.toLocaleString()} human + ${overview.botViews.toLocaleString()} bots`
              : `${overview.botViews.toLocaleString()} bots filtered out`}
          </p>
        </div>

        {/* Unique Visitors & Sessions */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-800">
              Daily Uniques
            </span>
            <DeltaBadge pct={overview.deltas?.uniquesPct} />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-neutral-800">
            {overview.uniqueVisitors.toLocaleString()}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {overview.totalSessions.toLocaleString()} sessions ({overview.pagesPerSession} pv/sess)
          </p>
        </div>

        {/* Average Dwell Time & Bounce Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-amber-700">
              Engaged Dwell
            </span>
            <DeltaBadge pct={overview.deltas?.dwellPct} />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-amber-700">
            {formatDwell(overview.avgDwellSeconds)}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {overview.engagedViews.toLocaleString()} engaged • {overview.bounceRatePercent}% &lt;2s bounce
          </p>
        </div>

        {/* Avg Scroll Depth */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-purple-700">
              Avg Scroll
            </span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-purple-700">
            {overview.avgScrollPercent}%
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Article body completion</p>
        </div>

        {/* Subscribers & Syndication */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-sky-800">
              Subscribers
            </span>
            <Mail className="w-4 h-4 text-sky-700" />
          </div>
          <div className="mt-2 text-3xl font-black font-headline text-sky-800">
            {overview.activeSubscribers.toLocaleString()}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            +{overview.newSubscribers} new • {overview.dispatchedSocialPosts} social sent
          </p>
        </div>
      </div>

      {/* Traffic Time-Series Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#002B49]" />
            Traffic Trend ({windowInfo?.granularity === 'hour' ? 'Hourly UTC' : 'Daily UTC'})
          </h2>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#002B49]/80"></span>
              Total Views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              Engaged (≥2s)
            </span>
          </div>
        </div>

        {timeSeries.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400">
            No telemetry buckets recorded in this window.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-36 flex items-end gap-1.5 pt-2">
              {timeSeries.map((pt) => {
                const totalPct = Math.max(4, Math.round((Number(pt.views) / maxSeriesViews) * 100));
                const engagedPct = Math.round((Number(pt.engaged) / maxSeriesViews) * 100);
                const label = formatBucketLabel(pt.bucket);
                return (
                  <div
                    key={pt.bucket}
                    className="flex-1 min-w-[8px] h-full flex flex-col justify-end group relative"
                    title={`${label}: ${pt.views} views (${pt.uniques} uniques, ${pt.engaged} engaged)`}
                  >
                    <div
                      className="w-full bg-[#002B49]/20 rounded-t relative overflow-hidden transition-all group-hover:bg-[#002B49]/35"
                      style={{ height: `${totalPct}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500/85"
                        style={{ height: `${pt.views > 0 ? Math.min(100, Math.round((engagedPct / totalPct) * 100)) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono border-t pt-1.5">
              <span>{formatBucketLabel(timeSeries[0].bucket)}</span>
              <span>Peak bucket: {maxSeriesViews.toLocaleString()} views</span>
              <span>{formatBucketLabel(timeSeries[timeSeries.length - 1].bucket)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Channels & Content Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acquisition & Tech Attribution (1 Col) */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#002B49]" />
              Acquisition Channels
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">First-Touch Inbound</span>
          </div>

          {channels.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No inbound channel telemetry recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((c) => {
                const pct = Math.round((Number(c.views) / totalChannelViews) * 100);
                const styling = CHANNEL_COLORS[c.channel_group] || CHANNEL_COLORS.REFERRAL;
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
                      <div className={`h-1.5 rounded-full ${styling.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {overview.internalViews > 0 && (
                <div className="text-[10px] text-gray-400 font-mono pt-1">
                  +{overview.internalViews.toLocaleString()} internal page transitions excluded from inbound share
                </div>
              )}
            </div>
          )}

          {/* Device Breakdown */}
          <div className="pt-3 border-t space-y-3">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-gray-500 block">
              Audience Devices & Tech
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

            {(browsers.length > 0 || oses.length > 0) && (
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-gray-50 border border-gray-200 rounded p-2 space-y-1">
                  <div className="font-bold text-gray-500 uppercase text-[10px]">Browsers</div>
                  {browsers.slice(0, 4).map((b) => (
                    <div key={b.browser} className="flex justify-between font-mono text-gray-700">
                      <span className="truncate">{b.browser}</span>
                      <span>{b.views}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-2 space-y-1">
                  <div className="font-bold text-gray-500 uppercase text-[10px]">Platforms</div>
                  {oses.slice(0, 4).map((o) => (
                    <div key={o.os} className="flex justify-between font-mono text-gray-700">
                      <span className="truncate">{o.os}</span>
                      <span>{o.views}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Performance Tabs (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-[#002B49] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#002B49]" />
              Content & Editorial Performance
            </h2>
            <div className="inline-flex rounded border border-gray-200 bg-gray-50 p-0.5 text-[11px] font-bold">
              {(
                [
                  ['articles', 'Top Articles'],
                  ['pages', 'All Pages'],
                  ['categories', 'Categories'],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setContentTab(tab)}
                  className={`px-2.5 py-1 rounded transition ${
                    contentTab === tab ? 'bg-[#002B49] text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {contentTab === 'articles' &&
            (topArticles.length === 0 ? (
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
                      <th className="pb-2 text-right">Engaged Dwell</th>
                      <th className="pb-2 text-right">Scroll %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {topArticles.map((art) => (
                      <tr key={art.article_slug} className="hover:bg-gray-50 transition">
                        <td className="py-2.5 pr-3 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                              {art.category}
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
            ))}

          {contentTab === 'pages' &&
            (topPages.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">No page hits recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 uppercase font-headline text-[10px] tracking-wider">
                      <th className="pb-2">Route Path</th>
                      <th className="pb-2 text-right">Views</th>
                      <th className="pb-2 text-right">Unique</th>
                      <th className="pb-2 text-right">Engaged Dwell</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {topPages.map((p) => (
                      <tr key={p.pathname} className="hover:bg-gray-50">
                        <td className="py-2.5 pr-3 text-gray-800 truncate max-w-md">{p.pathname}</td>
                        <td className="py-2.5 text-right font-bold text-[#002B49]">
                          {Number(p.views).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-gray-600">
                          {Number(p.unique_visitors).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-amber-700">{formatDwell(p.avg_dwell)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

          {contentTab === 'categories' &&
            (categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">No category telemetry recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 uppercase font-headline text-[10px] tracking-wider">
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-right">Views</th>
                      <th className="pb-2 text-right">Unique</th>
                      <th className="pb-2 text-right">Engaged Dwell</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((cat) => (
                      <tr key={cat.category} className="hover:bg-gray-50">
                        <td className="py-2.5 font-bold text-[#002B49]">{cat.category}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-[#002B49]">
                          {Number(cat.views).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-mono text-gray-600">
                          {Number(cat.unique_readers).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-mono text-amber-700">
                          {formatDwell(cat.avg_dwell)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>

      {/* Secondary Grid: Geographics, Events & Campaigns */}
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
                      <span className="w-7 text-center font-mono bg-gray-100 text-gray-700 text-[10px] rounded px-1 py-0.5">
                        {c.country}
                      </span>
                      <span>{formatCountryName(c.country)}</span>
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
              <div className="space-y-2">
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

              {eventDetails.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                    Action Breakdown
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {eventDetails.map((d, i) => (
                      <span
                        key={`${d.event_name}-${d.detail}-${i}`}
                        className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded font-mono"
                      >
                        {d.event_name}: {d.detail} ({d.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
