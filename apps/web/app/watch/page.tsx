'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Film,
  Radio,
  Play,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
  Building2,
  FileText,
} from 'lucide-react';
import { LiveStreamPlayer } from '../../components/LiveStreamPlayer';
import {
  VideoStreamItem,
  FLAGSHIP_LIVE_STREAM,
  PUBLIC_DOMAIN_CATALOG,
} from '../../lib/video-catalog';

function WatchTheaterContent() {
  const searchParams = useSearchParams();
  const featureId = searchParams.get('feature');

  const [activeVideo, setActiveVideo] = useState<VideoStreamItem>(() => {
    if (featureId) {
      const matched = PUBLIC_DOMAIN_CATALOG.find((item) => item.id === featureId);
      if (matched) return matched;
    }
    return FLAGSHIP_LIVE_STREAM;
  });

  const playerTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (featureId) {
      const matched = PUBLIC_DOMAIN_CATALOG.find((item) => item.id === featureId);
      if (matched) {
        setActiveVideo(matched);
      }
    }
  }, [featureId]);

  // Email capture state
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [subscribeMsg, setSubscribeMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubscribing(true);
    setSubscribeStatus('idle');

    try {
      const res = await fetch('/api/subscribe/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          topics: ['Politics', 'Business', 'Tech', 'Energy'],
          regions: ['Global'],
          frequency: 'DAILY_MORNING',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribeStatus('success');
        setSubscribeMsg('Subscribed! The Prolific Morning Briefing will arrive daily.');
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMsg(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMsg('Network error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const selectVideo = (doc: VideoStreamItem) => {
    setActiveVideo(doc);
    if (playerTopRef.current) {
      playerTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const switchToLive = () => {
    setActiveVideo(FLAGSHIP_LIVE_STREAM);
    if (playerTopRef.current) {
      playerTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#00101C] text-white min-h-screen pb-16">
      {/* Top Discreet Header Bar */}
      <div className="border-b border-gray-800 bg-[#001829]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-wider text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#FFCC00]" />
            <span>Back to Newsroom Wire</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-headline font-bold uppercase tracking-wider">
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Domain Sovereign Media</span>
            </span>

            {activeVideo.isLive ? (
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Flagship Satellite 24/7</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#FFCC00]">
                <Film className="w-3.5 h-3.5" />
                <span>Feature Cinema</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-8" ref={playerTopRef}>
        {/* Cinema Screen Frame */}
        <div className="space-y-4">
          <LiveStreamPlayer item={activeVideo} className="shadow-[0_20px_50px_rgba(0,0,0,0.9)]" />

          {/* Active Feature Control & Metadata Bar */}
          <div className="bg-[#001E35] border border-gray-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-headline font-bold uppercase px-2.5 py-0.5 rounded bg-[#CC0000] text-white tracking-wider">
                  {activeVideo.category}
                </span>
                {activeVideo.duration && (
                  <span className="text-xs font-mono text-[#FFCC00] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeVideo.duration}
                  </span>
                )}
                {activeVideo.license && (
                  <span className="text-[11px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {activeVideo.license}
                  </span>
                )}
              </div>
              <h1 className="font-headline font-black text-xl md:text-2xl uppercase tracking-tight text-white">
                {activeVideo.title}
              </h1>
              <p className="text-xs md:text-sm text-gray-300 font-serif leading-relaxed max-w-4xl">
                {activeVideo.summary}
              </p>
            </div>

            {!activeVideo.isLive && (
              <button
                onClick={switchToLive}
                className="shrink-0 bg-[#CC0000] hover:bg-rose-700 text-white font-headline font-black text-xs uppercase px-4 py-3 rounded tracking-wider transition flex items-center gap-2 shadow-lg cursor-pointer self-start md:self-auto"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Return to 24/7 Live Satellite</span>
              </button>
            )}
          </div>
        </div>

        {/* Prolific Direct Revenue & Audience Conversion Desk */}
        <div className="bg-gradient-to-r from-[#00223A] via-[#002B49] to-[#001829] border border-[#004A80] rounded-xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFCC00] text-[#002B49] text-[10px] font-headline font-black uppercase px-2 py-0.5 rounded tracking-widest">
                  PROLIFIC INTELLIGENCE DESK
                </span>
                <span className="text-xs font-mono text-gray-400">Zero Commercial Ads • 100% Owned Media</span>
              </div>
              <h2 className="font-headline font-black text-xl md:text-2xl text-white uppercase tracking-tight">
                Institutional Analysis Delivered Every Morning
              </h2>
              <p className="text-xs md:text-sm text-gray-300 font-serif leading-relaxed">
                Join thousands of senior decision-makers receiving uncompromised global macroeconomic, defense, and sovereign technology intelligence before markets open.
              </p>
            </div>

            {/* Newsletter Conversion Input */}
            <div className="w-full lg:w-96 shrink-0">
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex rounded-lg overflow-hidden border border-gray-700 focus-within:border-[#FFCC00] transition shadow-inner bg-black/40">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@institution.com"
                    required
                    disabled={subscribing}
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-white placeholder-gray-500 focus:outline-none font-sans"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="bg-[#FFCC00] hover:bg-[#FFE066] text-[#002B49] px-5 text-xs font-headline font-black uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {subscribing ? (
                      <span className="animate-spin text-sm">⏳</span>
                    ) : (
                      <>
                        <span>Join</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {subscribeStatus === 'success' && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{subscribeMsg}</span>
                  </p>
                )}
                {subscribeStatus === 'error' && (
                  <p className="text-xs text-rose-400">{subscribeMsg}</p>
                )}
              </form>
            </div>
          </div>

          {/* Direct Revenue Inquiries Grid */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/contact?dept=partnerships"
              className="bg-[#001829]/70 hover:bg-[#001829] border border-white/10 hover:border-[#FFCC00]/50 p-4 rounded-lg transition flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded bg-[#FFCC00]/10 border border-[#FFCC00]/20 flex items-center justify-center shrink-0 group-hover:bg-[#FFCC00]/20 transition">
                <Building2 className="w-5 h-5 text-[#FFCC00]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-white group-hover:text-[#FFCC00] transition">
                    Sponsor The Broadcast Desk
                  </h3>
                  <span className="text-[10px] font-mono text-[#FFCC00] uppercase font-bold">Inquire</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Feature your brand or enterprise intelligence directly across Prolific Live and executive newsletters. Route to <span className="text-[#FFCC00] font-mono">partnerships@prolific.news</span>.
                </p>
              </div>
            </Link>

            <Link
              href="/contact?dept=wire"
              className="bg-[#001829]/70 hover:bg-[#001829] border border-white/10 hover:border-[#FFCC00]/50 p-4 rounded-lg transition flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded bg-[#CC0000]/10 border border-[#CC0000]/20 flex items-center justify-center shrink-0 group-hover:bg-[#CC0000]/20 transition">
                <FileText className="w-5 h-5 text-rose-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-white group-hover:text-[#FFCC00] transition">
                    Commercial Press Wire Syndication
                  </h3>
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">1h SLA</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Distribute compliant corporate disclosures and earnings releases across 50+ global downstream terminals. Route to <span className="text-rose-400 font-mono">wire@prolific.news</span>.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Curated Public Domain & Open-Access Features Catalog */}
        <div className="space-y-5 pt-4">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-headline font-black text-lg md:text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[#FFCC00]" />
                Public Domain Special Investigations & Telemetry
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Full-length planetary, oceanic, aerospace, and robotics telemetry. Streamed without external advertising or third-party tracking.
              </p>
            </div>
            <span className="text-xs font-mono text-gray-400">
              6 Sovereign Public Domain Features
            </span>
          </div>

          {/* Documentary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PUBLIC_DOMAIN_CATALOG.map((doc) => {
              const isPlaying = activeVideo.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => selectVideo(doc)}
                  className={`group rounded-xl overflow-hidden border-2 cursor-pointer transition flex flex-col justify-between ${
                    isPlaying
                      ? 'bg-[#002B49] border-[#FFCC00] shadow-2xl scale-[1.01]'
                      : 'bg-[#001A2C] border-gray-800 hover:border-gray-600 hover:bg-[#00223A]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Poster Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={doc.poster}
                        alt={doc.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Duration Tag */}
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-[#FFCC00] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/10">
                        {doc.duration}
                      </span>

                      {/* Category Tag */}
                      <span className="absolute top-2.5 left-2.5 bg-[#002B49]/90 text-white text-[10px] font-headline font-bold uppercase px-2 py-0.5 rounded tracking-wider">
                        {doc.category}
                      </span>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                        <div className="w-12 h-12 rounded-full bg-[#FFCC00] text-[#002B49] flex items-center justify-center shadow-xl">
                          <Play className="w-6 h-6 fill-[#002B49] translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-headline font-bold text-base text-white group-hover:text-[#FFCC00] transition line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-300 font-serif line-clamp-3 leading-relaxed">
                        {doc.summary}
                      </p>
                      <div className="pt-2 text-[10px] font-mono text-gray-400 truncate">
                        {doc.license}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      className={`w-full py-2 rounded text-xs font-headline font-bold uppercase tracking-wider transition cursor-pointer ${
                        isPlaying
                          ? 'bg-[#FFCC00] text-[#002B49]'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isPlaying ? 'Currently Streaming in Cinema' : 'Stream Native MP4 in Cinema'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchLivePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#00101C] text-white min-h-screen flex items-center justify-center font-mono text-xs">
          Initializing Sovereign Theater...
        </div>
      }
    >
      <WatchTheaterContent />
    </Suspense>
  );
}
