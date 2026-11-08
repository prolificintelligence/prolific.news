'use client';

import React, { useEffect, useState } from 'react';
import { X, Maximize2, Radio } from 'lucide-react';
import Link from 'next/link';
import { LiveStreamPlayer } from './LiveStreamPlayer';

const LIVE_STREAM_M3U8 =
  'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8';

export function FloatingMiniPlayer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Don't show floating mini player on the dedicated watch page
      if (typeof window !== 'undefined' && window.location.pathname === '/watch') {
        setIsVisible(false);
        return;
      }
      if (window.scrollY > 400 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 md:w-84 bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-[#002B49] animate-in slide-in-from-bottom-5 duration-300">
      {/* Mini Player Header */}
      <div className="bg-[#002B49] text-white px-2.5 py-1.5 flex items-center justify-between text-xs font-headline font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-[#FFCC00]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#CC0000]" />
          <span>Prolific Live Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/watch" className="text-gray-300 hover:text-white" title="Expand Fullscreen">
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-gray-300 hover:text-white"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Video Stream Container */}
      <div className="relative aspect-video bg-black">
        <LiveStreamPlayer
          streamUrl={LIVE_STREAM_M3U8}
          autoPlay={true}
          showChyron={false}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
