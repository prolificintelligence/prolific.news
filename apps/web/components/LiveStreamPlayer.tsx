'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Film, ShieldCheck } from 'lucide-react';
import {
  VideoStreamItem,
  FLAGSHIP_LIVE_STREAM,
  DEFAULT_PUBLIC_DOMAIN_VIDEO_URL,
} from '../lib/video-catalog';

export type { VideoStreamItem };
export { FLAGSHIP_LIVE_STREAM };

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
  const [liveResolvedUrl, setLiveResolvedUrl] = useState<string | null>(null);

  // Sanitize legacy demo URLs if any persist in static cache
  const cleanStreamUrl =
    streamUrl && streamUrl.includes('commondatastorage.googleapis.com')
      ? DEFAULT_PUBLIC_DOMAIN_VIDEO_URL
      : streamUrl;

  const activeItem: VideoStreamItem = item || {
    id: cleanStreamUrl ? 'stream-custom' : FLAGSHIP_LIVE_STREAM.id,
    title: 'Prolific Newsroom Broadcast',
    category: 'Video Dispatch',
    duration: 'Feature',
    summary: 'Prolific News Network broadcast reporting and documentary video dispatch.',
    embedUrl: cleanStreamUrl || FLAGSHIP_LIVE_STREAM.embedUrl,
    isLive: !cleanStreamUrl,
  };

  // Auto-resolve live flagship stream ID so NASA stream rotations or maintenance never trigger "Video unavailable"
  const shouldResolveFlagship = Boolean(activeItem.isLive && activeItem.id === FLAGSHIP_LIVE_STREAM.id);

  useEffect(() => {
    if (!shouldResolveFlagship) {
      setLiveResolvedUrl(null);
      return;
    }

    let cancelled = false;
    fetch('/api/live/stream')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { embedUrl?: string } | null) => {
        if (!cancelled && data?.embedUrl) {
          setLiveResolvedUrl(data.embedUrl);
        }
      })
      .catch(() => {
        // Keep initial FLAGSHIP_LIVE_STREAM.embedUrl on transient network error
      });

    return () => {
      cancelled = true;
    };
  }, [shouldResolveFlagship]);

  const effectiveEmbedUrl =
    shouldResolveFlagship && liveResolvedUrl ? liveResolvedUrl : activeItem.embedUrl;

  const isDirectVideo =
    effectiveEmbedUrl.endsWith('.mp4') ||
    effectiveEmbedUrl.endsWith('.webm') ||
    effectiveEmbedUrl.includes('images-assets.nasa.gov');

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
      className={`relative bg-black rounded-xl overflow-hidden group select-none shadow-lg border border-gray-200 aspect-video w-full ${className}`}
    >
      {/* Media Renderer: Direct Native HTML5 Video OR Sovereign Public Domain Embed */}
      {isDirectVideo ? (
        <video
          key={`${activeItem.id}:${effectiveEmbedUrl}`}
          src={effectiveEmbedUrl}
          poster={activeItem.poster}
          controls
          autoPlay={autoPlay ?? true}
          muted
          playsInline
          className="w-full h-full object-contain bg-black absolute inset-0"
        />
      ) : (
        <iframe
          key={`${activeItem.id}:${effectiveEmbedUrl}`}
          src={effectiveEmbedUrl}
          title={activeItem.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      )}

      {/* Minimalist Top Cinema Bar */}
      {showTopBar && (
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2">
            {activeItem.isLive && !isDirectVideo ? (
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
    </div>
  );
}
