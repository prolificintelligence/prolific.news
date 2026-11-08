'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Radio, Globe, Clock, Tv, Sparkles, ChevronRight } from 'lucide-react';

interface LiveStreamPlayerProps {
  streamUrl?: string;
  autoPlay?: boolean;
  className?: string;
  showChyron?: boolean;
  bureau?: string;
}

// Curated broadcast reel packages for 24/7 autonomous continuous loop
const BROADCAST_REELS = [
  {
    id: 'reel-global',
    title: 'WORLD DISPATCH: STRATEGIC ACCORDS, TRADE CORRIDORS & GLOBAL SECURITY',
    category: 'World',
    bureau: 'GENEVA / WASHINGTON',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    summary: 'Continuous diplomatic coverage tracking high-level bilateral summits and market infrastructure agreements.',
  },
  {
    id: 'reel-markets',
    title: 'FINANCIAL DESK: CENTRAL BANK POLICIES, TECH VALUATIONS & ENERGY EXPANSION',
    category: 'Business',
    bureau: 'NEW YORK / LONDON',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    summary: 'Wall Street and international currency desks react to updated gross margin and inflation guidance.',
  },
  {
    id: 'reel-regional',
    title: 'PAN-AFRICA & ASIA NEXUS: EMERGING DIGITAL HUBS AND INFRASTRUCTURE INVESTMENT',
    category: 'Emerging Markets',
    bureau: 'NAIROBI / SINGAPORE',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    summary: 'Cross-continental report analyzing rapid broadband growth, fintech corridors, and renewable grid modernization.',
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

  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [studioTime, setStudioTime] = useState<string>('');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [viewerCount, setViewerCount] = useState(148720);

  const activeReel = useMemo(() => {
    return BROADCAST_REELS[currentReelIndex % BROADCAST_REELS.length];
  }, [currentReelIndex]);

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

  // Viewer count organic jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 25) - 12);
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

  // Video autoplay & reel advancement
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = streamUrl || activeReel.videoUrl;
    video.muted = isMuted;

    if (autoPlay) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy fallback: ensure muted and retry
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });
    }

    const handleEnded = () => {
      // Advance to next reel seamlessly in the continuous 24/7 channel
      setCurrentReelIndex((prev) => (prev + 1) % BROADCAST_REELS.length);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeReel, streamUrl, autoPlay]);

  const togglePlay = () => {
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
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted && video.volume === 0) {
      video.volume = 0.5;
      setVolume(0.5);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
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

  const nextReel = () => {
    setCurrentReelIndex((prev) => (prev + 1) % BROADCAST_REELS.length);
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group select-none shadow-2xl border border-gray-900 ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted={isMuted}
        poster={activeReel.poster}
        className="w-full h-full object-cover"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Broadcast Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

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
            <span>PROLIFIC CONTINUOUS NEWS</span>
          </div>

          {/* Bureau Badge */}
          <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] font-mono px-2 py-1 rounded border border-white/10">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{bureau || activeReel.bureau}</span>
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
            <span>{viewerCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Big Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/45 cursor-pointer z-20 transition duration-200"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#CC0000] hover:bg-[#B30000] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition duration-200">
            <Play className="w-8 h-8 md:w-10 md:h-10 fill-white translate-x-1" />
          </div>
        </div>
      )}

      {/* Lower Thirds Fox-Style News Chyron */}
      {showChyron && (
        <div className="absolute bottom-11 inset-x-3 pointer-events-none z-20 space-y-1">
          {/* Top Chyron Tab: Bureau & Topic */}
          <div className="flex items-center gap-2">
            <span className="bg-[#CC0000] text-white text-[10px] md:text-xs font-headline font-black uppercase px-2.5 py-0.5 rounded shadow">
              BREAKING REPORT
            </span>
            <span className="bg-[#002B49]/95 text-[#FFCC00] text-[10px] md:text-xs font-headline font-bold uppercase px-2 py-0.5 rounded border border-[#004A80] shadow">
              {activeReel.category} • {activeReel.bureau}
            </span>
          </div>

          {/* Main Headline Banner */}
          <div className="bg-gradient-to-r from-[#002B49] via-[#002B49]/95 to-[#001829]/90 border-l-4 border-[#CC0000] px-3.5 py-2 rounded-r shadow-2xl backdrop-blur-sm">
            <h2 className="font-headline font-black text-sm md:text-lg text-white uppercase tracking-tight line-clamp-1">
              {activeReel.title}
            </h2>
            <p className="text-[11px] md:text-xs text-gray-300 font-sans line-clamp-1">
              {activeReel.summary}
            </p>
          </div>

          {/* Continuous Running Wire Ticker */}
          <div className="bg-black/90 border-t border-[#CC0000]/60 px-3 py-1 flex items-center gap-2 text-[10px] md:text-xs text-gray-200 font-mono overflow-hidden">
            <span className="text-[#FFCC00] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-[#FFCC00]" />
              WIRE DISPATCH:
            </span>
            <div className="truncate text-gray-100 font-sans font-medium">
              {BREAKING_TICKERS[tickerIndex]}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls Bar (shown on hover or tap) */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent px-4 py-2 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="hover:text-[#FFCC00] transition"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="hover:text-[#FFCC00] transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 md:w-20 accent-[#CC0000] h-1 bg-gray-600 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={nextReel}
            className="hidden sm:flex items-center gap-1 text-[11px] font-headline font-bold uppercase bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition"
            title="Next Reel Dispatch"
          >
            <span>Next Dispatch</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            1080p HD 60fps
          </span>
          <button
            onClick={toggleFullscreen}
            className="hover:text-[#FFCC00] transition"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
