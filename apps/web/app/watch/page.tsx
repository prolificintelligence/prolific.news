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
    <div className="bg-white text-gray-900 min-h-screen pb-16">
      {/* Top Discreet Light Breadcrumb Bar */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-wider text-[#002B49] hover:text-[#CC0000] transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#CC0000]" />
            <span>Back to Newsroom Wire</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-headline font-bold uppercase tracking-wider">
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Public Domain Sovereign Media</span>
            </span>

            {activeVideo.isLive ? (
              <span className="flex items-center gap-1.5 text-[#CC0000]">
                <span className="w-2 h-2 rounded-full bg-[#CC0000] animate-pulse"></span>
                <span>Flagship Satellite 24/7</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#002B49]">
                <Film className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Feature Cinema</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-10" ref={playerTopRef}>
        {/* Cinema Screen Frame */}
        <div className="space-y-4">
          <LiveStreamPlayer item={activeVideo} className="shadow-xl" />

          {/* Active Feature Control & Metadata Bar */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-headline font-bold uppercase px-2.5 py-0.5 rounded bg-[#CC0000] text-white tracking-wider">
                  {activeVideo.category}
                </span>
                {activeVideo.duration && (
                  <span className="text-xs font-mono font-semibold text-[#002B49] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#CC0000]" />
                    {activeVideo.duration}
                  </span>
                )}
                {activeVideo.license && (
                  <span className="text-[11px] font-mono text-gray-600 bg-[#F8F9FA] px-2.5 py-0.5 rounded border border-gray-200">
                    {activeVideo.license}
                  </span>
                )}
              </div>
              <h1 className="font-headline font-black text-xl md:text-2xl uppercase tracking-tight text-[#002B49]">
                {activeVideo.title}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-serif leading-relaxed max-w-4xl">
                {activeVideo.summary}
              </p>
            </div>

            {!activeVideo.isLive && (
              <button
                onClick={switchToLive}
                className="shrink-0 bg-[#CC0000] hover:bg-red-700 text-white font-headline font-black text-xs uppercase px-5 py-3 rounded tracking-wider transition flex items-center gap-2 shadow-sm cursor-pointer self-start md:self-auto"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Return to 24/7 Live Satellite</span>
              </button>
            )}
          </div>
        </div>

        {/* Prolific Direct Revenue & Audience Conversion Desk */}
        <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#002B49] text-[#FFCC00] text-[10px] font-headline font-black uppercase px-2.5 py-0.5 rounded tracking-widest">
                  PROLIFIC INTELLIGENCE DESK
                </span>
                <span className="text-xs font-mono text-gray-500">Zero Commercial Ads • 100% Owned Media</span>
              </div>
              <h2 className="font-headline font-black text-xl md:text-2xl text-[#002B49] uppercase tracking-tight">
                Institutional Analysis Delivered Every Morning
              </h2>
              <p className="text-xs md:text-sm text-gray-600 font-serif leading-relaxed">
                Join thousands of senior decision-makers receiving uncompromised global macroeconomic, defense, and sovereign technology intelligence before markets open.
              </p>
            </div>

            {/* Newsletter Conversion Input */}
            <div className="w-full lg:w-96 shrink-0">
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex rounded-lg overflow-hidden border border-gray-300 focus-within:border-[#002B49] transition shadow-sm bg-white">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@institution.com"
                    required
                    disabled={subscribing}
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none font-sans"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="bg-[#002B49] hover:bg-[#003B66] text-[#FFCC00] px-5 text-xs font-headline font-black uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {subscribing ? (
                      <span className="animate-spin text-sm">...</span>
                    ) : (
                      <>
                        <span>Join</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {subscribeStatus === 'success' && (
                  <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{subscribeMsg}</span>
                  </p>
                )}
                {subscribeStatus === 'error' && (
                  <p className="text-xs text-[#CC0000] font-medium">{subscribeMsg}</p>
                )}
              </form>
            </div>
          </div>

          {/* Direct Revenue Inquiries Grid */}
          <div className="pt-5 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/contact?dept=partnerships"
              className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#002B49] p-4 rounded-xl transition flex items-start gap-3.5 group shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-[#002B49] text-[#FFCC00] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#002B49] group-hover:text-[#CC0000] transition">
                    Commercial Partnerships & Advertising
                  </h3>
                  <span className="text-[10px] font-mono text-[#002B49] bg-[#002B49]/10 px-1.5 py-0.5 rounded uppercase font-bold">
                    Inquire
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-sans leading-relaxed">
                  Feature your brand or enterprise intelligence directly across Prolific News desks and briefings via <span className="text-[#002B49] font-mono font-semibold">partnerships@prolific.news</span>.
                </p>
              </div>
            </Link>

            <Link
              href="/contact?dept=wire"
              className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#CC0000] p-4 rounded-xl transition flex items-start gap-3.5 group shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-[#CC0000] text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#002B49] group-hover:text-[#CC0000] transition">
                    Commercial Press Wire Syndication
                  </h3>
                  <span className="text-[10px] font-mono text-[#CC0000] bg-red-50 px-1.5 py-0.5 rounded uppercase font-bold">
                    1h SLA
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-sans leading-relaxed">
                  Distribute compliant corporate disclosures and earnings releases across 50+ global downstream terminals via <span className="text-[#CC0000] font-mono font-semibold">wire@prolific.news</span>.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Curated Public Domain & Open-Access Features Catalog */}
        <div className="space-y-5 pt-2">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-headline font-black text-xl md:text-2xl uppercase tracking-tight text-[#002B49] flex items-center gap-2">
                <Film className="w-5 h-5 text-[#CC0000]" />
                Public Domain Special Investigations & Telemetry
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Full-length planetary, oceanic, aerospace, and robotics telemetry streamed without external advertising.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-gray-500">
              {PUBLIC_DOMAIN_CATALOG.length} Sovereign Public Domain Features
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
                  className={`group rounded-xl overflow-hidden border transition cursor-pointer flex flex-col justify-between ${
                    isPlaying
                      ? 'bg-[#002B49] text-white border-[#FFCC00] ring-2 ring-[#FFCC00]/40 shadow-xl'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-[#002B49]/40 shadow-sm'
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                      {/* Duration Tag */}
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-[#FFCC00] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/10">
                        {doc.duration}
                      </span>

                      {/* Category Tag */}
                      <span className="absolute top-2.5 left-2.5 bg-[#002B49]/95 text-white text-[10px] font-headline font-bold uppercase px-2 py-0.5 rounded tracking-wider">
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
                      <h3
                        className={`font-headline font-bold text-base transition line-clamp-2 ${
                          isPlaying ? 'text-[#FFCC00]' : 'text-[#002B49] group-hover:text-[#CC0000]'
                        }`}
                      >
                        {doc.title}
                      </h3>
                      <p
                        className={`text-xs font-serif line-clamp-3 leading-relaxed ${
                          isPlaying ? 'text-gray-200' : 'text-gray-600'
                        }`}
                      >
                        {doc.summary}
                      </p>
                      <div
                        className={`pt-2 text-[10px] font-mono truncate ${
                          isPlaying ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {doc.license}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded text-xs font-headline font-bold uppercase tracking-wider transition cursor-pointer ${
                        isPlaying
                          ? 'bg-[#FFCC00] text-[#002B49]'
                          : 'bg-[#002B49] hover:bg-[#003B66] text-white'
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
        <div className="bg-white text-[#002B49] min-h-screen flex items-center justify-center font-mono text-xs">
          Initializing Prolific Broadcast Theater...
        </div>
      }
    >
      <WatchTheaterContent />
    </Suspense>
  );
}
