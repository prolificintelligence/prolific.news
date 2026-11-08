'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize2, Radio, AlertCircle } from 'lucide-react';

interface LiveStreamPlayerProps {
  streamUrl?: string;
  autoPlay?: boolean;
  className?: string;
  showChyron?: boolean;
}

const DEFAULT_STREAM_URL =
  'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8';

export function LiveStreamPlayer({
  streamUrl = DEFAULT_STREAM_URL,
  autoPlay = true,
  className = '',
  showChyron = true,
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isLive, setIsLive] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setHasError(false);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().then(() => setIsPlaying(true)).catch(() => {
            // Autoplay with sound often blocked by browser; retry muted
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('[HLS] Network error encountered, attempting recovery...');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[HLS] Media error encountered, attempting recovery...');
              hls?.recoverMediaError();
              break;
            default:
              console.error('[HLS] Fatal unrecoverable error:', data);
              hls?.destroy();
              setHasError(true);
              setErrorMessage('Live stream temporarily unavailable. Reconnecting...');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS for Safari / iOS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          video.play().then(() => setIsPlaying(true)).catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
        }
      });
    } else {
      setHasError(true);
      setErrorMessage('Your browser does not support HLS video playback.');
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl, autoPlay]);

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

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group select-none ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white space-y-2 p-4 text-center z-20">
          <AlertCircle className="w-8 h-8 text-[#CC0000] animate-pulse" />
          <p className="font-headline font-bold text-sm uppercase tracking-wider">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#CC0000] hover:bg-[#B30000] text-white text-xs font-headline font-bold uppercase px-3 py-1.5 rounded transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="bg-[#CC0000] text-white text-[10px] font-headline font-black tracking-widest uppercase px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Live Broadcast
          </span>
          <span className="bg-black/60 backdrop-blur-sm text-gray-200 text-[10px] font-headline font-bold uppercase px-2 py-1 rounded hidden sm:inline-block">
            Prolific News Channel Live Feed
          </span>
        </div>
      </div>

      {/* Center Big Play Button (shown when paused) */}
      {!isPlaying && !hasError && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 transition duration-200"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#CC0000] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition">
            <Play className="w-8 h-8 md:w-10 md:h-10 fill-white translate-x-1" />
          </div>
        </div>
      )}

      {/* Lower Thirds Fox News Chyron */}
      {showChyron && (
        <div className="absolute bottom-12 left-4 right-4 bg-gradient-to-r from-[#002B49]/95 via-[#002B49]/90 to-transparent p-3 md:p-4 rounded-l border-l-8 border-[#CC0000] text-white pointer-events-none z-10 shadow-lg">
          <div className="flex items-center gap-2 text-[#FFCC00] text-[10px] md:text-xs font-headline font-black uppercase tracking-wider mb-0.5">
            <Radio className="w-3.5 h-3.5 text-[#CC0000] animate-pulse" />
            <span>SPECIAL REPORT • LIVE ON AIR</span>
          </div>
          <h2 className="font-headline font-black text-lg md:text-2xl uppercase tracking-tight line-clamp-1">
            PROLIFIC NEWS NETWORK: 24/7 CONTINUOUS BROADCAST & BREAKING COVERAGE
          </h2>
        </div>
      )}

      {/* Interactive Control Bar (on hover or touch) */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 py-2 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
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

          <div className="flex items-center gap-1.5 text-xs font-headline font-bold text-emerald-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live HD</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
