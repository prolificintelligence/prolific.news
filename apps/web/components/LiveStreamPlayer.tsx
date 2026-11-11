'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Maximize2, Film, Sparkles, ShieldCheck } from 'lucide-react';

export interface VideoStreamItem {
  id: string;
  title: string;
  category: string;
  duration?: string;
  summary?: string;
  embedUrl: string;
  poster?: string;
  isLive?: boolean;
  license?: string;
}

export const FLAGSHIP_LIVE_STREAM: VideoStreamItem = {
  id: 'flagship-nasa-live',
  title: 'NASA Earth & Orbital Telemetry — 24/7 Live Satellite Observation',
  category: 'Planetary & Aerospace Intelligence',
  duration: '24/7 Live Feed',
  summary:
    'Continuous real-time high-definition satellite observation directly from the International Space Station and NASA deep space telemetry. 100% Public Domain & Ad-Free.',
  embedUrl:
    'https://www.youtube-nocookie.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ&autoplay=1&mute=1&playsinline=1&controls=1&rel=0',
  poster:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  isLive: true,
  license: 'U.S. Federal Government (Public Domain)',
};

interface LiveStreamPlayerProps {
  item?: VideoStreamItem;
  streamUrl?: string;
  autoPlay?: boolean;
  showChyron?: boolean;
  showTopBar?: boolean;
  className?: string;
}

export function LiveStreamPlayer({
  item,
  streamUrl,
  autoPlay,
  showTopBar = true,
  className = '',
}: LiveStreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeItem: VideoStreamItem = item || {
    id: 'stream-custom',
    title: 'Prolific Newsroom Broadcast',
    category: 'Video Dispatch',
    duration: 'Feature',
    summary: 'Prolific News Network broadcast reporting and documentary video dispatch.',
    embedUrl: streamUrl || FLAGSHIP_LIVE_STREAM.embedUrl,
    isLive: !streamUrl,
  };

  const isDirectVideo =
    activeItem.embedUrl.endsWith('.mp4') ||
    activeItem.embedUrl.endsWith('.webm') ||
    activeItem.embedUrl.includes('images-assets.nasa.gov');

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
    <div
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden group select-none shadow-2xl border border-gray-900 aspect-video w-full ${className}`}
    >
      {/* Media Renderer: Direct Native HTML5 Video OR Sovereign Public Domain Embed */}
      {isDirectVideo ? (
        <video
          key={activeItem.id}
          src={activeItem.embedUrl}
          poster={activeItem.poster}
          controls
          autoPlay={autoPlay ?? true}
          muted
          playsInline
          className="w-full h-full object-contain bg-black absolute inset-0"
        />
      ) : (
        <iframe
          key={activeItem.id}
          src={activeItem.embedUrl}
          title={activeItem.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      )}

      {/* Minimalist Top Cinema Bar */}
      {showTopBar && (
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2">
            {activeItem.isLive ? (
              <span className="bg-[#CC0000] text-white text-[10px] md:text-xs font-headline font-black tracking-widest uppercase px-2.5 py-1 rounded flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                LIVE 24/7
              </span>
            ) : (
              <span className="bg-[#002B49]/90 backdrop-blur-md border border-[#004A80] text-[#FFCC00] text-[10px] md:text-xs font-headline font-bold uppercase px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md">
                <Film className="w-3.5 h-3.5 text-[#FFCC00]" />
                Prolific Feature
              </span>
            )}

            <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-sm text-gray-200 text-[10px] md:text-xs font-headline font-semibold px-2.5 py-1 rounded border border-white/10">
              <span className="text-[#FFCC00] uppercase font-bold">{activeItem.category}</span>
              {activeItem.duration && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300 font-mono">{activeItem.duration}</span>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-1 bg-black/60 backdrop-blur-sm text-emerald-400 text-[10px] font-mono px-2 py-1 rounded border border-white/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Public Domain / Zero-Ad</span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="bg-black/60 hover:bg-black/90 text-white p-1.5 rounded border border-white/10 transition cursor-pointer"
              title="Fullscreen Theater"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Prolific Broadcast Sponsorship Overlay Ribbon */}
      <div className="absolute bottom-3 inset-x-3 pointer-events-none z-20 hidden md:flex items-center justify-between text-[10px] md:text-xs">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded text-gray-300 font-sans flex items-center gap-2 pointer-events-auto shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">Prolific Broadcast Network</span>
          <span className="text-gray-500">•</span>
          <span className="text-[#FFCC00] font-mono">White-Label Institutional Feed</span>
        </div>

        <Link
          href="/contact?dept=partnerships"
          className="pointer-events-auto bg-[#002B49]/90 hover:bg-[#003B64] text-[#FFCC00] hover:text-white border border-[#004A80] px-3 py-1 rounded font-headline font-bold uppercase transition tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md"
        >
          <Sparkles className="w-3 h-3 text-[#FFCC00]" />
          <span>Sponsor Broadcast: partnerships@prolific.news</span>
        </Link>
      </div>
    </div>
  );
}
