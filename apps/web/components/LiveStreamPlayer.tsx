'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Radio,
  Globe,
  Clock,
  Tv,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface LiveStreamPlayerProps {
  streamUrl?: string;
  autoPlay?: boolean;
  className?: string;
  showChyron?: boolean;
  bureau?: string;
}

interface BroadcastChannel {
  id: string;
  name: string;
  bureau: string;
  category: string;
  type: 'embed' | 'video';
  streamUrl: string;
  title: string;
  summary: string;
  poster: string;
}

const CHANNELS: BroadcastChannel[] = [
  {
    id: 'dw-english',
    name: 'DW News Global',
    bureau: 'BERLIN / GLOBAL',
    category: 'World Affairs',
    type: 'embed',
    streamUrl: 'https://www.youtube-nocookie.com/embed/lu_Z6_37ZAE?autoplay=1&mute=1&playsinline=1&controls=1',
    title: 'DW News Global Satellite: 24/7 International Dispatches & Geopolitical Analysis',
    summary: 'Continuous live television coverage tracking diplomatic summits, global security accords, and regional trade corridors.',
    poster: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'france24-en',
    name: 'France 24 International',
    bureau: 'PARIS / EUROPE / AFRICA',
    category: 'International Affairs',
    type: 'embed',
    streamUrl: 'https://www.youtube-nocookie.com/embed/h3MuI4GQShU?autoplay=1&mute=1&playsinline=1&controls=1',
    title: 'France 24 English Live: In-Depth European & Pan-African Coverage',
    summary: 'Continuous live reporting covering European policy developments, African commercial corridors, and global diplomacy.',
    poster: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'nasa-hd',
    name: 'NASA TV Live HD',
    bureau: 'WASHINGTON / HOUSTON',
    category: 'Science & Aerospace',
    type: 'embed',
    streamUrl: 'https://www.youtube-nocookie.com/embed/21X5lGlDOfg?autoplay=1&mute=1&playsinline=1&controls=1',
    title: 'NASA Live Satellite Stream: Space Missions, Lunar Telemetry & Earth Sciences',
    summary: 'Real-time telemetry, orbital observation, and continuous aerospace engineering updates directly from mission control.',
    poster: 'https://images.unsplash.com/photo-1517976487468-f20514c44f53?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pnn-wire-reel',
    name: 'PNN Autonomous Reel',
    bureau: 'NEW YORK / GLOBAL DESKS',
    category: 'Executive Briefing',
    type: 'video',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Prolific News Network: Autonomous Continuous Dispatch Reel',
    summary: 'Algorithmic compilation of high-value regional bulletins, market movements, and tech alerts.',
    poster: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
  },
];

const BREAKING_TICKERS = [
  'PROLIFIC 24/7: Continuous autonomous broadcast coverage streaming live across all regional bureaus.',
  'GLOBAL MARKETS: Central banks evaluate updated trade guidelines as international logistics networks adapt.',
  'AFRICA DESK: Continental trade secretariat announces expanded zero-tariff cross-border digital payment framework.',
  'ASIA-PACIFIC: Tech manufacturing corridors project quarterly expansion following renewed bilateral agreements.',
  'LATIN AMERICA: Energy modernization initiatives accelerate across regional economic corridors.',
  'CAPITOL HILL: Senate committees finalize emergency infrastructure appropriations package.',
];

export function LiveStreamPlayer({
  streamUrl,
  autoPlay = true,
  className = '',
  showChyron = true,
  bureau,
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeChannelIndex, setActiveChannelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [studioTime, setStudioTime] = useState<string>('');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [viewerCount, setViewerCount] = useState(74);

  const activeChannel = CHANNELS[activeChannelIndex % CHANNELS.length];

  // Studio Clock (EST & UTC)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const est = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setStudioTime(`${est} EST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic viewer count realistic fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => Math.max(45, Math.min(130, prev + Math.floor(Math.random() * 7) - 3)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // News ticker cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % BREAKING_TICKERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Video element playback (for video mode)
  useEffect(() => {
    if (activeChannel.type !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    video.src = streamUrl || activeChannel.streamUrl;
    video.muted = isMuted;

    if (autoPlay) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });
    }
  }, [activeChannel, streamUrl, autoPlay, isMuted]);

  const togglePlay = () => {
    if (activeChannel.type !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (activeChannel.type !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Channel Switcher Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-[#001829] border border-gray-800 p-2 rounded-lg">
        <span className="text-[11px] font-headline font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1.5 shrink-0">
          <Tv className="w-3.5 h-3.5 text-[#FFCC00]" /> Satellite Channels:
        </span>
        {CHANNELS.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannelIndex(idx)}
            className={`text-xs font-headline font-bold uppercase tracking-wider px-3 py-1 rounded transition flex items-center gap-1.5 ${
              activeChannelIndex === idx
                ? 'bg-[#CC0000] text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeChannelIndex === idx ? 'bg-white animate-pulse' : 'bg-gray-500'
              }`}
            />
            <span>{ch.name}</span>
          </button>
        ))}
      </div>

      {/* Main Broadcast Player Screen */}
      <div
        ref={containerRef}
        className={`relative bg-black rounded-lg overflow-hidden group select-none shadow-2xl border border-gray-900 aspect-video ${className}`}
      >
        {activeChannel.type === 'embed' ? (
          <iframe
            src={activeChannel.streamUrl}
            title={activeChannel.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 absolute inset-0"
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted={isMuted}
            poster={activeChannel.poster}
            className="w-full h-full object-cover"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* Top Broadcast Header Bug & Station ID */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2">
            {/* Live Indicator */}
            <span className="bg-[#CC0000] text-white text-[10px] md:text-xs font-headline font-black tracking-widest uppercase px-2.5 py-1 rounded flex items-center gap-1.5 shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              LIVE 24/7
            </span>

            {/* Network Bug */}
            <div className="bg-[#002B49]/90 backdrop-blur-md border border-[#004A80] text-white text-[10px] md:text-xs font-headline font-black uppercase px-2.5 py-1 rounded flex items-center gap-2 shadow-md">
              <Tv className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span className="hidden sm:inline">PROLIFIC SATELLITE:</span>
              <span className="text-[#FFCC00]">{activeChannel.name}</span>
            </div>

            {/* Bureau Badge */}
            <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] font-mono px-2 py-1 rounded border border-white/10">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{bureau || activeChannel.bureau}</span>
            </div>
          </div>

          {/* Studio Time & Viewers */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-[#FFCC00] text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-white/10">
              <Clock className="w-3 h-3 text-[#FFCC00]" />
              <span>{studioTime || 'LIVE EST'}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-emerald-400 text-[10px] font-headline font-bold px-2 py-1 rounded border border-white/10">
              <Radio className="w-3 h-3 animate-ping" />
              <span>{viewerCount} Live</span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="pointer-events-auto bg-black/60 hover:bg-black/90 text-white p-1 rounded border border-white/10 transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Lower Thirds News Chyron (Active in Video Mode or Overlay) */}
        {showChyron && activeChannel.type === 'video' && (
          <div className="absolute bottom-11 inset-x-3 pointer-events-none z-20 space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#CC0000] text-white text-[10px] md:text-xs font-headline font-black uppercase px-2.5 py-0.5 rounded shadow">
                REGIONAL REPORT
              </span>
              <span className="bg-[#002B49]/95 text-[#FFCC00] text-[10px] md:text-xs font-headline font-bold uppercase px-2 py-0.5 rounded border border-[#004A80] shadow">
                {activeChannel.category} • {activeChannel.bureau}
              </span>
            </div>

            <div className="bg-gradient-to-r from-[#002B49] via-[#002B49]/95 to-[#001829]/90 border-l-4 border-[#CC0000] px-3.5 py-2 rounded-r shadow-2xl backdrop-blur-sm">
              <h2 className="font-headline font-black text-sm md:text-lg text-white uppercase tracking-tight line-clamp-1">
                {activeChannel.title}
              </h2>
              <p className="text-[11px] md:text-xs text-gray-300 font-sans line-clamp-1">
                {activeChannel.summary}
              </p>
            </div>

            <div className="bg-black/90 border-t border-[#CC0000]/60 px-3 py-1 flex items-center gap-2 text-[10px] md:text-xs text-gray-200 font-mono overflow-hidden">
              <span className="text-[#FFCC00] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-[#FFCC00]" />
                WIRE TICKER:
              </span>
              <div className="truncate text-gray-100 font-sans font-medium">
                {BREAKING_TICKERS[tickerIndex]}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
